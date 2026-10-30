import os

from company_verifier import resolve_company_name
from flask import Flask, jsonify, request
from flask_cors import CORS
from models import InvestigationReport, db
from detector import analyze_message

app = Flask(__name__)

base_dir = os.path.abspath(os.path.dirname(__file__))
database_path = os.path.join(base_dir, "scamshield.db")
app.config["SQLALCHEMY_DATABASE_URI"] = (
    "sqlite:///" + database_path.replace("\\", "/")
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
CORS(app)


@app.get("/")
def home():
    return jsonify({"message": "ScamShield AI Backend is Running!"})


@app.post("/api/analyze")
def analyze():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "")

    if not isinstance(message, str) or not message.strip():
        return jsonify({"error": "Please enter a valid message."}), 400
    if len(message) > 10_000:
        return jsonify({"error": "Message is too long."}), 413

    company_name, company_source = resolve_company_name(
        message,
        data.get("company_name"),
    )
    result = analyze_message(message)
    recommendation = result.get(
        "recommendation",
        "Verify the employer independently before proceeding.",
    )
    disclaimer = (
        "This is a preliminary risk assessment, not proof of fraud or legitimacy."
    )

    report = InvestigationReport(
        risk_level=result["risk_level"],
        score=result["score"],
        signals=result["signals"],
        recommendation=recommendation,
        disclaimer=disclaimer,
        company_name=company_name,
    )

    try:
        db.session.add(report)
        db.session.commit()
    except Exception:
        db.session.rollback()
        app.logger.exception("Could not save investigation report.")
        return jsonify({"error": "Unable to save investigation report."}), 500

    return jsonify({
        **result,
        "recommendation": recommendation,
        "disclaimer": disclaimer,
        "company_name": company_name,
        "company_source": company_source,
        "report_id": report.id,
        "report_token": report.report_token,
        "report_url": f"/api/reports/{report.report_token}",
    }), 200


@app.get("/api/reports/<report_token>")
def get_report(report_token):
    report = db.session.execute(
        db.select(InvestigationReport).filter_by(report_token=report_token)
    ).scalar_one_or_none()

    if report is None:
        return jsonify({"error": "Report not found."}), 404

    return jsonify({
        "report_id": report.id,
        "report_token": report.report_token,
        "risk_level": report.risk_level,
        "score": report.score,
        "signals": report.signals,
        "recommendation": report.recommendation,
        "disclaimer": report.disclaimer,
        "company_name": report.company_name,
        "verification_status": report.verification_status,
        "created_at": report.created_at.isoformat(),
    })


with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
