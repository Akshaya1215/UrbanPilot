"""
webhook/app.py

TEAMMATE: this is your file. See docs/02_guidebook_whatsapp_ui.md for the
full walkthrough (Twilio sandbox setup, ngrok, testing).

This is the "UI" in this architecture — the whole interface is a WhatsApp
chat, and this Flask app is what Twilio calls every time the user sends a
message. It's already wired to Agent 1 below; you shouldn't need to touch
agents/ or tools/ at all.
"""

from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse

from backend.agents.geographic_agent import run_geographic_agent
from backend.webhook.formatter import format_whatsapp_reply

app = Flask(__name__)


@app.route("/whatsapp", methods=["POST"])
def whatsapp_webhook():
    incoming_msg = request.values.get("Body", "").strip()

    result = run_geographic_agent(incoming_msg)
    reply_text = format_whatsapp_reply(result)

    twiml = MessagingResponse()
    twiml.message(reply_text)
    return str(twiml)


@app.route("/health", methods=["GET"])
def health():
    """Quick sanity check while setting up ngrok/Twilio — hit this in a browser."""
    return {"status": "ok"}


if __name__ == "__main__":
    app.run(port=5000, debug=True)
