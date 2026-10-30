import unittest

from app import app, db
from models import InvestigationReport


class AppTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.report_ids = []

    def tearDown(self):
        with app.app_context():
            for report_id in self.report_ids:
                report = db.session.get(InvestigationReport, report_id)
                if report is not None:
                    db.session.delete(report)
            db.session.commit()

    def post_analysis(self, payload):
        response = self.client.post("/api/analyze", json=payload)
        if response.status_code == 200:
            self.report_ids.append(response.get_json()["report_id"])
        return response

    def test_health_check(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("Running", response.get_json()["message"])

    def test_analyze_returns_detector_result(self):
        response = self.post_analysis(
            {"message": "Please send us your OTP to verify your account."},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["risk_level"], "Medium")
        self.assertIn("disclaimer", response.get_json())

    def test_manual_company_name_overrides_extracted_name(self):
        response = self.post_analysis({
            "message": "You have been selected at Google.",
            "company_name": "Microsoft",
        })
        self.assertEqual(response.status_code, 200)
        result = response.get_json()
        self.assertEqual(result["company_name"], "Microsoft")
        self.assertEqual(result["company_source"], "User provided")

        report_response = self.client.get(result["report_url"])
        self.assertEqual(report_response.status_code, 200)
        self.assertEqual(report_response.get_json()["company_name"], "Microsoft")

    def test_company_name_is_extracted_from_message(self):
        response = self.post_analysis({
            "message": "You have been selected at Google.",
        })
        self.assertEqual(response.status_code, 200)
        result = response.get_json()
        self.assertEqual(result["company_name"], "Google")
        self.assertEqual(result["company_source"], "Automatically extracted")

    def test_analyze_rejects_empty_message(self):
        response = self.client.post("/api/analyze", json={"message": "  "})
        self.assertEqual(response.status_code, 400)

    def test_analyze_rejects_oversized_message(self):
        response = self.client.post("/api/analyze", json={"message": "x" * 10_001})
        self.assertEqual(response.status_code, 413)


if __name__ == "__main__":
    unittest.main()
