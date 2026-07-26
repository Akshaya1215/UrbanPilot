"""
webhook/formatter.py

Turns a GeoAgentState dict (from run_geographic_agent) into plain text
suitable for a WhatsApp reply. WhatsApp supports a small markdown subset:
*bold*, _italic_, ~strikethrough~ — no headers, no tables, no links-as-buttons
(those come later via Twilio's interactive message types, not needed for review 1).

Kept in its own file so your teammate can iterate on message wording/formatting
without touching agent code, and you can iterate on agent logic without
touching message wording.
"""


def format_whatsapp_reply(result: dict) -> str:
    if result.get("error"):
        return (
            f"⚠️ {result['error']}\n\n"
            "Try something like: _from Anna Nagar to T Nagar_"
        )

    origin = result["origin"]
    destination = result["destination"]

    lines = [
        "📍 *Route lookup*",
        f"From: {origin['display_name']}",
        f"To: {destination['display_name']}",
        "",
        "🚇 *Nearest metro to your start:*",
    ]
    if origin["nearest_stations"]:
        for s in origin["nearest_stations"][:2]:
            lines.append(f"  • {s['name']} — {s['distance_km']} km")
    else:
        lines.append("  • No metro station found nearby")

    lines.append("")
    lines.append("🚇 *Nearest metro to your destination:*")
    if destination["nearest_stations"]:
        for s in destination["nearest_stations"][:2]:
            lines.append(f"  • {s['name']} — {s['distance_km']} km")
    else:
        lines.append("  • No metro station found nearby")

    return "\n".join(lines)
