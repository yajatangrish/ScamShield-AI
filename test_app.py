import unittest

from app import app


class AppTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_health_check(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("Running", response.get_json()["message"])

    def test_analyze_returns_detector_result(self):
        response = self.client.post(
            "/api/analyze",
            json={"message": "Please send us your OTP to verify your account."},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["risk_level"], "Medium")
        self.assertIn("disclaimer", response.get_json())

    def test_analyze_rejects_empty_message(self):
        response = self.client.post("/api/analyze", json={"message": "  "})
        self.assertEqual(response.status_code, 400)

    def test_analyze_rejects_oversized_message(self):
        response = self.client.post("/api/analyze", json={"message": "x" * 10_001})
        self.assertEqual(response.status_code, 413)


if __name__ == "__main__":
    unittest.main()
