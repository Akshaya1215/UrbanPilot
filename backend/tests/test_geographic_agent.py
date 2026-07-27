"""
tests/test_geographic_agent.py

Run this directly (`python -m backend.tests.test_geographic_agent`) to see
the full output of the agent printed to your terminal — the fastest way to
sanity-check it before wiring it into the webhook.

Run with pytest (`pytest backend/tests/`) for the assert-based version.
Note: both hit real network APIs (Nominatim + Overpass), so you need
internet access and should expect ~1-2 seconds per call due to rate limiting.
"""

import json
from backend.agents.geographic_agent import run_geographic_agent


def test_basic_route():
    result = run_geographic_agent("from Anna Nagar to T Nagar")
    assert result["error"] is None
    assert result["origin"]["lat"] is not None
    assert result["destination"]["lat"] is not None


def test_unparseable_location():
    result = run_geographic_agent("from Zzzxyqqasdf123place to Nowhereville999")
    # Should fail gracefully with an error message, not raise an exception
    assert result["error"] is not None


if __name__ == "__main__":
    while True:
        message = input("\nEnter a route (or 'exit'): ")

        if message.lower() == "exit":
            break

        output = run_geographic_agent(message)
        print(json.dumps(output, indent=2))
