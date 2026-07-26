# Multi-Modal Transit Fare & Time Arbitrage Swarm

A 4-agent swarm that finds the fastest/cheapest way to get across an
Indian metro city by combining metro schedules, live auto/bike/cab
pricing, and walking, then arbitrages the options against a direct-cab
benchmark — delivered over WhatsApp.

## Status

| Agent | Status |
|---|---|
| 1. Geographic Agent ("The Mapper") | ✅ Built — see below |
| 2. Public Transit Agent ("The Metro Expert") | 🔲 Stub only (`backend/agents/transit_agent.py`) |
| 3. Open Mobility Agent ("The Negotiator") | 🔲 Stub only (`backend/agents/mobility_agent.py`) |
| 4. Synthesis & Arbitrage Agent ("The Brain") | 🔲 Stub only (`backend/agents/synthesis_agent.py`) |
| WhatsApp UI (Twilio webhook) | ✅ Built — see below |

## Team split

- **Agent developer**: owns `backend/agents/`, `backend/tools/`, `backend/core/`.
- **UI developer**: owns `backend/webhook/`.
- **Shared contract**: `backend/core/schema.py` — read this first, both of you.

Neither of you needs to touch the other's folder. The only integration
point is one function call: `run_geographic_agent(message)` →
returns a dict shaped like `GeoAgentState`.

## Read these in order

1. `docs/00_project_overview.md` — the whole idea, for explaining the project in review.
2. `docs/01_guidebook_geographic_agent.md` — full walkthrough for the agent developer.
3. `docs/02_guidebook_whatsapp_ui.md` — full walkthrough for the UI developer.

## Quickstart

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # fill in GOOGLE_API_KEY / Twilio creds as needed

# Agent developer: sanity check the agent alone
python -m tests.test_geographic_agent

# UI developer: run the webhook (needs ngrok + Twilio sandbox — see docs/02)
python webhook/app.py
```

## File structure

```
transit-swarm/
├── README.md
├── docs/
│   ├── 00_project_overview.md
│   ├── 01_guidebook_geographic_agent.md
│   └── 02_guidebook_whatsapp_ui.md
└── backend/
    ├── requirements.txt
    ├── .env.example
    ├── core/
    │   └── schema.py            # <- THE CONTRACT. Read this first.
    ├── agents/
    │   ├── geographic_agent.py  # ✅ Agent 1 — built
    │   ├── transit_agent.py     # 🔲 Agent 2 — stub
    │   ├── mobility_agent.py    # 🔲 Agent 3 — stub
    │   └── synthesis_agent.py   # 🔲 Agent 4 — stub
    ├── tools/
    │   ├── geocode_tool.py      # Nominatim wrapper
    │   └── transit_hub_tool.py  # Overpass wrapper + distance calc
    ├── webhook/
    │   ├── app.py               # Flask + Twilio webhook
    │   └── formatter.py         # dict -> WhatsApp text
    └── tests/
        └── test_geographic_agent.py
```
