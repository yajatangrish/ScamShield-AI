import os
import unittest
from unittest.mock import patch

from app import app
from whatsapp_bot import send_whatsapp_message


class WhatsAppBotTests(unittest.TestCase):
    def test_webhook_verification_returns_challenge(self):
        with patch.dict(os.environ, {"WHATSAPP_VERIFY_TOKEN": "test-verify-token"}):
            response = app.test_client().get(
                "/webhook/whatsapp",
                query_string={
                    "hub.mode": "subscribe",
                    "hub.verify_token": "test-verify-token",
                    "hub.challenge": "test-challenge",
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_data(as_text=True), "test-challenge")

    def test_webhook_verification_reports_missing_configuration(self):
        with patch.dict(os.environ, {"WHATSAPP_VERIFY_TOKEN": ""}):
            response = app.test_client().get(
                "/webhook/whatsapp",
                query_string={
                    "hub.mode": "subscribe",
                    "hub.verify_token": "test-verify-token",
                    "hub.challenge": "test-challenge",
                },
            )

        self.assertEqual(response.status_code, 503)
        self.assertEqual(
            response.get_json()["error"],
            "Verification token is not configured.",
        )

    def test_send_uses_configured_bearer_token(self):
        class SuccessfulResponse:
            ok = True

        with patch.dict(
            os.environ,
            {
                "WHATSAPP_ACCESS_TOKEN": "test-token",
                "WHATSAPP_PHONE_NUMBER_ID": "123",
                "WHATSAPP_API_VERSION": "v20.0",
            },
        ):
            with patch(
                "whatsapp_bot.requests.post",
                return_value=SuccessfulResponse(),
            ) as post:
                with app.app_context():
                    self.assertTrue(
                        send_whatsapp_message("15551234567", "Test message")
                    )

        self.assertEqual(
            post.call_args.kwargs["headers"]["Authorization"],
            "Bearer test-token",
        )


if __name__ == "__main__":
    unittest.main()
