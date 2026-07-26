# Guidebook: Building the WhatsApp UI Layer

**Who this is for:** the teammate building the UI.
**Goal:** get a real WhatsApp number answering questions, backed by the
Geographic Agent your teammate built — without needing to understand
LangGraph, Nominatim, or Overpass at all.

---

## Chapter 1 — What "UI" means in this project

There's no webpage or app screen here — **WhatsApp itself is the UI.**
The user's entire interface is: type a message, get a message back.

Your job is the layer that sits between WhatsApp and the agent:

```
[ User types on WhatsApp ]
          │
          ▼
[ Twilio receives it, forwards it to your webhook ]
          │
          ▼
[ Your Flask app: webhook/app.py ]
          │  calls run_geographic_agent(message)
          ▼
[ Your teammate's agent code runs, returns a result dict ]
          │
          ▼
[ Your formatter turns that dict into WhatsApp text ]
          │
          ▼
[ Twilio sends it back to the user ]
```

You will **never need to open** `agents/`, `tools/`, or `core/schema.py`
to change agent logic. The one thing you do need from `core/schema.py` is
knowing the *shape* of the dict you'll receive — see Chapter 5.

---

## Chapter 2 — Tech stack, and why each piece is there

| Piece | What it's for | Why this one |
|---|---|---|
| **Flask** | tiny Python web server to receive Twilio's webhook calls | minimal boilerplate, standard for a webhook this simple |
| **Twilio WhatsApp Sandbox** | lets you send/receive real WhatsApp messages without a business account | free, works within minutes, exactly what you need for a review demo |
| **ngrok** | exposes your local Flask server to the public internet | Twilio needs a public URL to send webhook requests to; your laptop's `localhost` isn't reachable from Twilio's servers without it |
| **twilio (Python SDK)** | builds the TwiML response Twilio expects | handles the XML-ish reply format for you |

---

## Chapter 3 — Setting up the Twilio WhatsApp Sandbox

1. Create a free account at [twilio.com/try-twilio](https://www.twilio.com/try-twilio).
2. In the Twilio Console, go to **Messaging → Try it out → Send a WhatsApp message**.
3. You'll see a sandbox number (usually `+1 415 523 8886`) and a join code
   like `join <two-words>`.
4. From your own phone's WhatsApp, send that exact join code as a message
   to that number. You'll get a confirmation — this links **your phone**
   to the sandbox for testing. (Every reviewer/tester who wants to try it
   live needs to do this same join step — mention this during the demo
   so nobody's confused why it doesn't "just work" from a random phone.)
5. Copy your **Account SID** and **Auth Token** from the Twilio Console
   dashboard into `backend/.env`:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
   ```
   (These aren't actually required by the webhook code itself for
   *receiving* messages — Twilio calls your webhook directly — but you'll
   want them if you later send proactive messages via the API.)

---

## Chapter 4 — Exposing your local server with ngrok

Twilio's servers need to reach your Flask app over the public internet.
Your laptop's `localhost:5000` isn't reachable from outside your network,
so ngrok creates a temporary public URL that tunnels straight to it.

```bash
# install: https://ngrok.com/download
ngrok http 5000
```

This prints something like:
```
Forwarding   https://a1b2-c3d4.ngrok-free.app -> http://localhost:5000
```

Copy that `https://...ngrok-free.app` URL — you'll paste it into Twilio
next.

**Important:** every time you restart ngrok, this URL changes (on the
free tier). You'll need to re-paste it into Twilio's sandbox config each
time. Start ngrok *before* your review and don't restart it mid-demo.

In the Twilio Console, go back to the WhatsApp Sandbox settings page and
paste your ngrok URL + `/whatsapp` into the **"When a message comes in"**
field, e.g.:
```
https://a1b2-c3d4.ngrok-free.app/whatsapp
```
Method: `HTTP POST`. Save.

---

## Chapter 5 — The contract you're coding against

Open `backend/core/schema.py` — you don't need to understand how it's
*built*, just what it *contains*. When you call
`run_geographic_agent(message)`, you get back a dict shaped like this:

```python
{
    "user_message": "from Anna Nagar to T Nagar",
    "origin_text": "Anna Nagar",
    "destination_text": "T Nagar",
    "origin": {
        "input_text": "Anna Nagar",
        "display_name": "Anna Nagar, Chennai, Tamil Nadu, India",
        "lat": 13.085,
        "lon": 80.2101,
        "nearest_stations": [
            {"name": "Anna Nagar Tower Metro", "lat": 13.086, "lon": 80.211, "distance_km": 0.4}
        ],
    },
    "destination": { ...same shape as origin... },
    "error": None,   # or a string message if something went wrong
}
```

**The one rule that matters for you:** always check `result["error"]`
first. If it's not `None`, `origin` and `destination` will both be `None`
— don't try to read `result["origin"]["lat"]` in that case, you'll get a
`TypeError`. The formatter (Chapter 7) already handles this correctly —
use it as the template if you extend the message format.

---

## Chapter 6 — The webhook endpoint (`webhook/app.py`)

```python
@app.route("/whatsapp", methods=["POST"])
def whatsapp_webhook():
    incoming_msg = request.values.get("Body", "").strip()

    result = run_geographic_agent(incoming_msg)
    reply_text = format_whatsapp_reply(result)

    twiml = MessagingResponse()
    twiml.message(reply_text)
    return str(twiml)
```

**What each line does:**
- `request.values.get("Body", "")` — Twilio sends the incoming WhatsApp
  message as a form field literally named `Body`. This is Twilio's
  webhook payload format, not something we chose.
- `run_geographic_agent(incoming_msg)` — the one call into your
  teammate's code. This is the entire integration point.
- `MessagingResponse()` / `twiml.message(...)` — builds **TwiML**
  (Twilio Markup Language), an XML format Twilio expects your webhook to
  return. The SDK handles the XML for you — you just call `.message()`
  with plain text.
- `return str(twiml)` — Flask sends this XML string back as the HTTP
  response; Twilio parses it and relays the message to WhatsApp.

**The `/health` route** is just a plain JSON endpoint you can hit in a
browser (`https://your-ngrok-url.ngrok-free.app/health`) to confirm the
server is up before you even touch Twilio — useful for isolating "is my
Flask app broken" from "is my Twilio config broken" when debugging.

---

## Chapter 7 — Formatting the reply (`webhook/formatter.py`)

```python
def format_whatsapp_reply(result: dict) -> str:
    if result.get("error"):
        return f"⚠️ {result['error']}\n\nTry something like: _from Anna Nagar to T Nagar_"
    ...
```

**Why this is a separate file from `app.py`:** you'll want to iterate on
wording, emoji, and formatting a lot more often than you touch the actual
webhook plumbing. Keeping it separate means you can tweak message copy
without risking breaking the Twilio integration.

**WhatsApp's text formatting subset:**
- `*bold*` → **bold**
- `_italic_` → *italic*
- `~strikethrough~` → ~~strikethrough~~
- No headers, no tables, no clickable buttons (those need Twilio's
  separate "interactive message" templates — out of scope for review 1,
  worth mentioning as a roadmap item since Agent 4's deep links will want
  real tappable buttons eventually).

---

## Chapter 8 — Running and testing end-to-end

Terminal 1:
```bash
cd backend
source venv/bin/activate
python webhook/app.py
```

Terminal 2:
```bash
ngrok http 5000
```

Then, from your own WhatsApp (already joined to the sandbox per Chapter 3),
send:
```
from Anna Nagar to T Nagar
```
You should get a reply within a few seconds. If nothing comes back:
1. Check Terminal 1 for a Python traceback — that tells you if the agent
   itself errored.
2. Check the Twilio Console's **Monitor → Logs → Errors** page — that
   tells you if Twilio couldn't reach your ngrok URL at all (wrong URL
   pasted, ngrok not running, etc).
3. Hit `/health` in a browser first to isolate Flask/ngrok issues from
   Twilio config issues.

---

## Chapter 9 — Talking points for the review

- **"Why WhatsApp instead of a custom app?"** — Zero install friction for
  the end user (everyone already has WhatsApp), and it matches how people
  already ask friends "how do I get to X" — a chat, not a form.
- **"Why Twilio instead of the raw WhatsApp Business API?"** — Twilio's
  sandbox gets a working demo running in minutes with no business
  verification process, which matters a lot given the review timeline.
  Production would eventually move to a verified WhatsApp Business number.
- **"What's next for this layer?"** — Twilio's interactive message
  templates (buttons, list pickers) for Agent 4's deep links, once that
  agent exists.
