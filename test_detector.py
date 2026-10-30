import unittest

from detector import analyze_message


class DetectorTests(unittest.TestCase):
    def test_task_deposit_and_unrealistic_earnings(self):
        result = analyze_message(
            "Earn ₹5,000 daily. Deposit ₹499 to unlock your earning tasks."
        )
        self.assertEqual(result["risk_level"], "High")
        self.assertIn("Payment or deposit to unlock tasks/earnings", result["signals"])
        self.assertIn("Unusually attractive or guaranteed earnings claim", result["signals"])

    def test_upfront_registration_fee(self):
        result = analyze_message(
            "You are selected. Pay ₹499 registration fee to start the job."
        )
        self.assertEqual(result["risk_level"], "Medium")
        self.assertIn("Upfront job/registration fee request", result["signals"])

    def test_credential_request(self):
        result = analyze_message("Please send us your OTP to verify your account.")
        self.assertEqual(result["risk_level"], "Medium")
        self.assertIn("Request for sensitive credentials or financial details", result["signals"])

    def test_safety_warning_is_not_flagged_as_credential_request(self):
        result = analyze_message("Never share your OTP or password with anyone.")
        
        self.assertNotIn("Request for sensitive credentials or financial details", result["signals"])

    def test_ordinary_message_has_no_configured_signals(self):
        result = analyze_message(
            "We are hiring a junior analyst. Apply through the careers page and review the job description."
        )
        self.assertEqual(result["risk_level"], "Low")
        self.assertEqual(result["signals"], [])
        self.assertIn("does not mean the offer is genuine", result["assessment_note"])

    def test_empty_message_is_rejected(self):
        with self.assertRaises(ValueError):
            analyze_message("   ")

    def test_repeated_same_rule_is_counted_once(self):
        result = analyze_message(
            "Pay a registration fee. Pay another registration fee. Registration fee required."
        )
        self.assertEqual(result["score"], 3)
        self.assertEqual(len(result["signals"]), 1)


if __name__ == "__main__":
    unittest.main(verbosity=2)
