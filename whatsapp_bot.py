
import os
import hmac
import hashlib
import requests

from dotenv import load_dotenv
from flask import (
    Blueprint,
    request,
    jsonify,
    current_app,
    Response
)

from models import db, InvestigationReport
from detector import analyze_message
from company_verifier import resolve_company_name


# Load environment variables from .env
load_dotenv()

whatsapp_bp = Blueprint("whatsapp", __name__)


# --------------------------------------------------
# 1. VERIFY WHATSAPP WEBHOOK SIGNATURE
# --------------------------------------------------

def verify_signature(raw_body):
    app_secret = os.getenv("WHATSAPP_APP_SECRET", "")

    if not app_secret:
        current_app.logger.error(
            "WHATSAPP_APP_SECRET is not configured."
        )
        return False

    received_signature = request.headers.get(
        "X-Hub-Signature-256", ""
    )

    expected_signature = "sha256=" + hmac.new(
        app_secret.encode("utf-8"),
        raw_body,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(
        received_signature,
        expected_signature
    )


# --------------------------------------------------
# 2. SEND WHATSAPP MESSAGE
# --------------------------------------------------

def send_whatsapp_message(recipient, message):

    access_token = os.getenv("WHATSAPP_ACCESS_TOKEN")
    phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
    api_version = os.getenv("WHATSAPP_API_VERSION")

    if not all([
        access_token,
        phone_number_id,
        api_version
    ]):
        current_app.logger.error(
            "WhatsApp API configuration is incomplete."
        )
        return False

    url = (
        f"https://graph.facebook.com/"
        f"{api_version}/{phone_number_id}/messages"
    )

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": recipient,
        "type": "text",
        "text": {
            "preview_url": False,
            "body": message
        }
    }

    try:
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=15
        )

        if response.ok:
            current_app.logger.info(
                "WhatsApp message sent successfully."
            )
            return True

        current_app.logger.error(
            "WhatsApp API returned status %s.",
            response.status_code
        )

    except requests.RequestException:
        current_app.logger.exception(
            "WhatsApp API request failed."
        )

    return False


# --------------------------------------------------
# 3. PROCESS INCOMING MESSAGE
# --------------------------------------------------

def process_incoming_message(sender, message):

    result = analyze_message(message)

    company_name, company_source = resolve_company_name(
        message
    )

    recommendations = {
        "High": (
            "Do not pay money or share sensitive information. "
            "Verify the employer independently."
        ),

        "Medium": (
            "Review the employer and job details carefully "
            "before proceeding."
        ),

        "Low": (
            "No major warning patterns were detected. "
            "This does not prove the job is genuine."
        ),

        "Insufficient information": (
            "There is not enough information. "
            "Check the employer and request clear job details."
        )
    }

    recommendation = recommendations.get(
        result["risk_level"],
        "Verify the employer independently."
    )

    disclaimer = (
        "This is a preliminary risk assessment, "
        "not proof of fraud or legitimacy."
    )

    # Create investigation report
    report = InvestigationReport(
        risk_level=result["risk_level"],
        score=result["score"],
        signals=result["signals"],
        recommendation=recommendation,
        disclaimer=disclaimer,
        company_name=company_name
    )

    # Save report in database
    try:
        db.session.add(report)
        db.session.commit()

    except Exception:
        db.session.rollback()

        current_app.logger.exception(
            "Failed to save investigation report."
        )

        send_whatsapp_message(
            sender,
            "Sorry, we could not save your investigation. "
            "Please try again later."
        )
        return

    # Generate public report URL
    public_url = os.getenv(
        "SCAMSHIELD_PUBLIC_URL", ""
    ).rstrip("/")

    if not public_url.startswith("https://"):

        current_app.logger.error(
            "Public HTTPS URL is not configured."
        )

        send_whatsapp_message(
            sender,
            "Your analysis is complete, but the report "
            "link is not available yet."
        )
        return

    report_url = (
        f"{public_url}/api/reports/{report.report_token}"
    )

    company_text = company_name or "Not identified"

    # Prepare WhatsApp reply
    reply = (
        "SCAMSHIELD AI - ANALYSIS COMPLETE\n\n"
        f"Risk level: {result['risk_level']}\n"
        f"Detection score: {result['score']}\n"
        f"Company identified: {company_text}\n"
        f"Company name source: {company_source}\n\n"
        "Warning signs:\n"
    )

    if result["signals"]:

        for signal in result["signals"]:
            reply += f"- {signal['name']}\n"

    else:
        reply += (
            "- No matching warning patterns detected.\n"
        )

    reply += (
        "\nRecommendation:\n"
        f"{recommendation}\n\n"
        "View your investigation report:\n"
        f"{report_url}\n\n"
        f"Note: {disclaimer}"
    )

    send_whatsapp_message(sender, reply)


# --------------------------------------------------
# 4. WHATSAPP WEBHOOK VERIFICATION
# --------------------------------------------------

@whatsapp_bp.get("/webhook/whatsapp")
def verify_whatsapp_webhook():

    mode = request.args.get("hub.mode")
    token = request.args.get("hub.verify_token")
    challenge = request.args.get("hub.challenge")

    expected_token = os.getenv(
        "WHATSAPP_VERIFY_TOKEN", ""
    )

    # Diagnostic logs (never log the actual token)
    current_app.logger.info(
        "WhatsApp webhook verification request received."
    )

    current_app.logger.info(
        "Webhook mode: %s", mode
    )

    current_app.logger.info(
        "Verification token configured: %s",
        bool(expected_token)
    )

    current_app.logger.info(
        "Verification token received: %s",
        bool(token)
    )

    current_app.logger.info(
        "Challenge received: %s",
        bool(challenge)
    )

    if not expected_token:
        current_app.logger.error(
            "WHATSAPP_VERIFY_TOKEN is missing."
        )

        return jsonify({
            "error": "Verification token is not configured."
        }), 503

    if not token:
        return "Verification token missing", 403

    token_matches = hmac.compare_digest(
        token,
        expected_token
    )

    current_app.logger.info(
        "Verification token matches: %s",
        token_matches
    )

    if (
        mode == "subscribe"
        and token_matches
        and challenge is not None
    ):

        current_app.logger.info(
            "WhatsApp webhook verification successful."
        )

        return Response(
            challenge,
            status=200,
            mimetype="text/plain"
        )

    current_app.logger.warning(
        "WhatsApp webhook verification rejected."
    )

    return "Webhook verification failed", 403


# --------------------------------------------------
# 5. RECEIVE INCOMING WHATSAPP MESSAGES
# --------------------------------------------------

@whatsapp_bp.post("/webhook/whatsapp")
def receive_whatsapp_message():

    raw_body = request.get_data()

    # Verify Meta request signature
    if not verify_signature(raw_body):

        current_app.logger.warning(
            "Invalid WhatsApp webhook signature."
        )

        return jsonify({
            "error": "Invalid webhook signature"
        }), 401

    data = request.get_json(silent=True) or {}

    if data.get("object") != "whatsapp_business_account":

        return jsonify({
            "status": "ignored"
        }), 200

    for entry in data.get("entry", []):

        for change in entry.get("changes", []):

            value = change.get("value", {})

            for incoming in value.get("messages", []):

                sender = incoming.get("from")
                message_type = incoming.get("type")

                if not sender:
                    continue

                if message_type != "text":

                    send_whatsapp_message(
                        sender,
                        "Please paste your suspicious job "
                        "message as text for analysis."
                    )

                    continue

                message = (
                    incoming.get("text", {}).get("body", "")
                )

                if not message.strip():
                    continue

                if len(message) > 10000:

                    send_whatsapp_message(
                        sender,
                        "Your message is too long. "
                        "Please send a shorter message."
                    )

                    continue

                process_incoming_message(
                    sender,
                    message
                )

    return jsonify({
        "status": "received"
    }), 200
