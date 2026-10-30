import uuid
from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class InvestigationReport(db.Model):
    __tablename__ = "investigation_reports"

    id = db.Column(db.Integer, primary_key=True)
    report_token = db.Column(
        db.String(36),
        unique=True,
        nullable=False,
        default=lambda: str(uuid.uuid4()),
    )
    risk_level = db.Column(db.String(40), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    signals = db.Column(db.JSON, nullable=False, default=list)
    recommendation = db.Column(db.Text, nullable=False)
    disclaimer = db.Column(db.Text, nullable=False)
    company_name = db.Column(db.String(200), nullable=True)
    verification_status = db.Column(
        db.String(50),
        nullable=False,
        default="Not checked",
    )
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
