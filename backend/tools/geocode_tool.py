"""
tools/geocode_tool.py

Wraps the OpenStreetMap Nominatim API: turns a text address into
(lat, lon, display_name).

Docs: https://nominatim.org/release-docs/latest/api/Search/

Nominatim's usage policy requires:
  1. A descriptive User-Agent header (not the default python-requests one).
  2. Max 1 request per second from a single client.
Both are handled below. Do not remove them — Nominatim will start
returning 403s if it thinks you're hammering the free endpoint.
"""

import time
import requests

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

# Nominatim asks that you identify your app + give a contact method.
# Replace the email with your own before the review, in case they ever
# need to reach out about usage.
USER_AGENT = "TransitArbitrageSwarm/1.0 (student project; contact: youremail@example.com)"

_last_call_time = 0.0


def geocode_address(address: str, city_hint: str = "Chennai, India") -> dict | None:
    """
    Look up an address and return its coordinates.

    Args:
        address: free-text place name, e.g. "Anna Nagar"
        city_hint: appended to the query to disambiguate common place names.
                   Change this if your demo city isn't Chennai.

    Returns:
        {"display_name": str, "lat": float, "lon": float} or None if not found.
    """
    global _last_call_time

    # --- rate limiting: Nominatim's free tier requires <= 1 req/sec ---
    elapsed = time.time() - _last_call_time
    if elapsed < 1.0:
        time.sleep(1.0 - elapsed)

    query = f"{address}, {city_hint}"
    params = {
        "q": query,
        "format": "jsonv2",
        "limit": 1,
    }
    headers = {"User-Agent": USER_AGENT}

    response = requests.get(NOMINATIM_URL, params=params, headers=headers, timeout=10)
    _last_call_time = time.time()
    response.raise_for_status()

    results = response.json()
    if not results:
        return None

    top = results[0]
    return {
        "display_name": top["display_name"],
        "lat": float(top["lat"]),
        "lon": float(top["lon"]),
    }
