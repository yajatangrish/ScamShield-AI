from flask import Flask, jsonify, request
from flask_cors import CORS

from detector import analyze_message

app = Flask(__name__)
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

    result = analyze_message(message)
    result["disclaimer"] = (
        "This is a preliminary risk assessment, not proof of fraud or legitimacy."
    )
    return jsonify(result)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
