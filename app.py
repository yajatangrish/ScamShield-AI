from flask import Flask, request, jsonify, send_from_directory
from pathlib import Path

from detector import analyze_message

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent


@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid request."}), 400

    message = data.get("message")

    if not isinstance(message, str):
        return jsonify({"error": "Message must be text."}), 400

    try:
        result = analyze_message(message)
        return jsonify(result)

    except (ValueError, TypeError) as error:
        return jsonify({"error": str(error)}), 400


@app.route("/<path:filename>")
def serve_files(filename):
    return send_from_directory(BASE_DIR, filename)


if __name__ == "__main__":
    app.run(debug=True)