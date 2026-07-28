"""
agents/mobility_agent_prototype/mobility_agent.py

Agent 3: The Open Mobility Agent ("The Negotiator")

Matches the signature already defined in the official stub
(backend/agents/mobility_agent.py):

    run_mobility_agent(from_lat, from_lon, to_lat, to_lon) -> dict

NOTE for the team: the official stub's docstring shows ONE mode per call
("mode": "auto"|"bike"|"cab"), but doesn't say how the caller picks which
mode. Since price/mode COMPARISON is the actual point of this agent, this
prototype returns a LIST of all three modes' pricing for the same
from/to pair - the caller can pick the cheapest/fastest, or show all
three. Flag this to the team; easy to change the return shape once
confirmed.

Real integrations used:
- Distance: haversine formula (matches OSRM's role conceptually - swap
  in real OSRM road-distance later for more accuracy than straight-line)
- Weather: Open-Meteo (free, no API key) - real call, affects surge
- Traffic delay & fares: mocked with a time-of-day heuristic, since a
  real Beckn/ONDC Mobility Sandbox integration isn't realistic in this
  timeframe - call this out clearly in the README/demo.

Run this file directly to test it standalone - no LLM needed.
"""

import math
import random
from datetime import datetime
from typing import List, TypedDict

import requests


# ---------------------------------------------------------------------------
# Output shape for one mode's pricing (extends the stub's planned output
# with a couple of extra fields useful for comparison/display)
# ---------------------------------------------------------------------------

class MobilityOption(TypedDict):
    mode: str            # "auto" | "bike" | "cab"
    eta_min: float
    fare_rupees: float
    surge_multiplier: float
    distance_km: float
    weather_condition: str
    error: str


# ---------------------------------------------------------------------------
# Tool 1: distance (haversine - straight-line, swap for OSRM road-distance later)
# ---------------------------------------------------------------------------

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ---------------------------------------------------------------------------
# Tool 2: weather (REAL API call - Open-Meteo, no key needed)
# ---------------------------------------------------------------------------

WEATHER_CODE_MAP = {
    0: "Clear", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Fog", 48: "Fog", 51: "Light Drizzle", 61: "Rain",
    63: "Moderate Rain", 65: "Heavy Rain", 80: "Rain Showers", 95: "Thunderstorm",
}


def get_weather(lat: float, lon: float) -> str:
    try:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {"latitude": lat, "longitude": lon, "current_weather": True}
        resp = requests.get(url, params=params, timeout=5)
        resp.raise_for_status()
        code = resp.json()["current_weather"]["weathercode"]
        return WEATHER_CODE_MAP.get(code, "Unknown")
    except Exception:
        return "Unknown"


# ---------------------------------------------------------------------------
# Tool 3: fare/ETA/surge per mode (mocked - swap for Beckn/ONDC sandbox later)
# ---------------------------------------------------------------------------

FARE_TABLES = {
    "auto": {"base": 25, "per_km": 14, "avg_speed_kmph": 22, "surge_range": (1.0, 1.3)},
    "bike": {"base": 15, "per_km": 8, "avg_speed_kmph": 28, "surge_range": (1.0, 1.4)},
    "cab":  {"base": 45, "per_km": 13, "avg_speed_kmph": 25, "surge_range": (1.0, 2.0)},
}


def price_mode(mode: str, distance_km: float, weather: str) -> MobilityOption:
    rates = FARE_TABLES[mode]
    weather_bump = 1.2 if weather in ("Rain", "Moderate Rain", "Heavy Rain", "Rain Showers") else 1.0

    hour = datetime.now().hour
    peak_bump = 1.3 if (8 <= hour <= 10 or 17 <= hour <= 20) else 1.0

    surge = round(random.uniform(*rates["surge_range"]) * weather_bump * peak_bump, 2)
    fare = round((rates["base"] + rates["per_km"] * distance_km) * surge, 2)
    eta = round((distance_km / rates["avg_speed_kmph"]) * 60, 1)

    return {
        "mode": mode,
        "eta_min": eta,
        "fare_rupees": fare,
        "surge_multiplier": surge,
        "distance_km": round(distance_km, 2),
        "weather_condition": weather,
        "error": None,
    }


# ---------------------------------------------------------------------------
# Main entry point - matches the official stub's exact signature
# ---------------------------------------------------------------------------

def run_mobility_agent(from_lat: float, from_lon: float, to_lat: float, to_lon: float) -> List[MobilityOption]:
    try:
        distance = haversine_km(from_lat, from_lon, to_lat, to_lon)
        weather = get_weather(from_lat, from_lon)
        return [price_mode(mode, distance, weather) for mode in FARE_TABLES]

    except Exception as e:
        return [{
            "mode": "unknown", "eta_min": 0, "fare_rupees": 0, "surge_multiplier": 0,
            "distance_km": 0, "weather_condition": "Unknown", "error": str(e),
        }]


if __name__ == "__main__":
    import json
    # Test standalone - CBE Railway Station -> Martin's Apartments (approx)
    result = run_mobility_agent(11.0018, 76.9629, 11.0510, 76.9910)
    print(json.dumps(result, indent=2))