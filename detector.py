"""Explainable rule-based screening for suspicious job/task messages.

This is a hackathon MVP baseline, not a fraud-determination system.
It does not store or transmit the submitted message.
"""

from __future__ import annotations

import re
import unicodedata
from typing import Any

MAX_MESSAGE_LENGTH = 10_000

# The weights and thresholds are initial design choices for the prototype.
# They must be tested and adjusted against a labelled dataset before being
# described as validated risk scores.
RULES: list[dict[str, Any]] = [
    {
        "key": "task_deposit",
        "label": "Payment or deposit to unlock tasks/earnings",
        "weight": 4,
        "reason": "The message appears to ask for money, a recharge, or a deposit before tasks or earnings can be accessed.",
        "patterns": [
            r"\b(?:deposit|recharge|top\s*up|top-up)\b.{0,55}\b(?:unlock|activate|release|start)\b.{0,35}\b(?:tasks?|earning|withdraw(?:al)?|account)\b",
            r"\b(?:unlock|activate|release)\b.{0,35}\b(?:tasks?|earning|withdraw(?:al)?|account)\b.{0,55}\b(?:deposit|recharge|top\s*up|top-up)\b",
            r"\bpay\b.{0,30}\b(?:to\s+)?(?:unlock|activate|release)\b.{0,35}\b(?:tasks?|earning|withdraw(?:al)?|account)\b",
            r"\bpay\b.{0,30}\bto\s+withdraw\b.{0,25}\b(?:earnings?|balance|money)\b",
        ],
    },
    {
        "key": "upfront_payment",
        "label": "Upfront job/registration fee request",
        "weight": 3,
        "reason": "The message mentions a fee, charge, or deposit connected with applying for or starting a job.",
        "patterns": [
            r"\b(?:registration|application|processing|training|security|joining|activation|verification)\s+(?:fee|fees|charge|charges|payment|deposit)\b",
            r"\bpay\b.{0,25}\b(?:registration|application|processing|training|security|joining|activation)\s+(?:fee|charge|amount)\b",
            r"\b(?:refundable|non[- ]refundable)\s+(?:deposit|fee)\b",
        ],
    },
    {
        "key": "sensitive_information",
        "label": "Request for sensitive credentials or financial details",
        "weight": 4,
        "reason": "The message appears to request an OTP, password, UPI PIN, CVV, or similar credential.",
        "patterns": [
            r"\b(?:share|send|provide|tell|give|reveal)\s+(?:(?:us|me)\s+|to\s+(?:us|me)\s+)?(?:your\s+)?(?:otp|one[- ]time password|upi\s*pin|password|cvv|card\s+pin)\b",
            r"\b(?:otp|one[- ]time password|upi\s*pin|cvv|card\s+pin)\b.{0,30}\b(?:send|share|tell|provide)\b",
        ],
    },
    {
        "key": "unrealistic_earnings",
        "label": "Unusually attractive or guaranteed earnings claim",
        "weight": 2,
        "reason": "The message makes a high or guaranteed earnings claim that should be independently checked.",
        "patterns": [
            r"\b(?:earn|make|get)\s+(?:up\s+to\s+)?(?:₹|rs\.?\s*|inr\s*)\s*[\d,]+\s*(?:per\s+day|a\s+day|/\s*day|daily)\b",
            r"\b(?:guaranteed|fixed|assured)\s+(?:high\s+)?(?:income|earnings|salary|profit)\b",
            r"\b(?:no\s+experience|without\s+experience)\b.{0,45}\b(?:huge|unlimited|easy|high)\s+(?:income|earnings|salary)\b",
        ],
    },
    {
        "key": "urgency_pressure",
        "label": "Pressure to act or pay immediately",
        "weight": 1,
        "reason": "The message uses a time pressure or last-chance statement that may discourage careful verification.",
        "patterns": [
            r"\b(?:pay|transfer|send|respond|act|register|apply)\b.{0,30}\b(?:immediately|right now|within\s+(?:the\s+)?next\s+\d+\s*(?:minutes?|hours?)|today only)\b",
            r"\b(?:limited time|last chance|only a few minutes|offer expires today)\b",
        ],
    },
]


def _normalize(message: str) -> str:
    """Normalize Unicode and whitespace while preserving readable evidence."""
    normalized = unicodedata.normalize("NFKC", message)
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized.casefold().strip()


def _is_negated_request(text: str, match_start: int) -> bool:
    """Avoid flagging simple safety warnings such as 'Never share your OTP'."""
    prefix = text[max(0, match_start - 55):match_start]
    return bool(
        re.search(
            r"\b(?:do\s+not|don't|never|avoid|must\s+not|should\s+not)\s+(?:ever\s+)?$",
            prefix,
        )
    )


def analyze_message(message: str) -> dict[str, Any]:
    """Analyze one job/task message and return an explainable risk estimate.

    Raises:
        TypeError: if message is not a string.
        ValueError: if message is empty or exceeds MAX_MESSAGE_LENGTH.
    """
    if not isinstance(message, str):
        raise TypeError("message must be a string")

    original = message.strip()
    if not original:
        raise ValueError("Please enter a message to analyze.")
    if len(original) > MAX_MESSAGE_LENGTH:
        raise ValueError(f"Message is too long. Maximum length is {MAX_MESSAGE_LENGTH} characters.")

    normalized = _normalize(original)
    detected: list[dict[str, Any]] = []

    for rule in RULES:
        evidence: str | None = None
        for pattern in rule["patterns"]:
            match = re.search(pattern, normalized, flags=re.IGNORECASE)
            if not match:
                continue
            if rule["key"] == "sensitive_information" and _is_negated_request(normalized, match.start()):
                continue
            evidence = match.group(0)[:140]
            break  # Count each warning category once; avoid repeated-phrase inflation.

        if evidence is not None:
            detected.append(
                {
                    "key": rule["key"],
                    "label": rule["label"],
                    "weight": rule["weight"],
                    "reason": rule["reason"],
                    "matched_text": evidence,
                }
            )

    score = sum(item["weight"] for item in detected)
    if score >= 6:
        risk_level = "High"
    elif score >= 3:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    if detected:
        labels = [item["label"] for item in detected]
        explanation = "The message contains these warning indicators: " + "; ".join(labels) + "."
    else:
        explanation = "No warning patterns from the current prototype rules were detected in this text."

    recommendations: list[str] = []
    keys = {item["key"] for item in detected}
    if "task_deposit" in keys or "upfront_payment" in keys:
        recommendations.append("Do not pay a registration fee or deposit until the employer and offer have been independently verified.")
    if "sensitive_information" in keys:
        recommendations.append("Never share an OTP, password, UPI PIN, CVV, or card PIN with a recruiter or unknown contact.")
    if "unrealistic_earnings" in keys:
        recommendations.append("Check the pay, duties, and employment terms through independently found official company contact details.")
    if "urgency_pressure" in keys:
        recommendations.append("Pause and verify the offer independently instead of responding under time pressure.")
    if not recommendations:
        recommendations.append("Verify the employer, job description, contact details, and payment terms through independently found official sources.")

    return {
        "risk_level": risk_level,
        "score": score,
        "signals": [item["label"] for item in detected],
        "evidence": detected,
        "explanation": explanation,
        "recommendation": " ".join(recommendations),
        "assessment_note": (
            "This is a screening estimate, not proof that the offer is fraudulent."
            if detected
            else "No matched warning pattern does not mean the offer is genuine or safe. The text may not contain enough information to assess it."
        ),
        "detector_version": "0.1-rule-based",
    }
