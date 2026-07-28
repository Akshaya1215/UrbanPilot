"""
Agent 3: Transit Data Agent (The Metro/Bus Expert)

Job: for every bus/train/metro LEG inside a route (built later by the
Route Options Agent), return fare, duration, next departure time, and
live delay status.

Real GTFS integration is not needed to get started - this uses a
believable mocked timetable/fare model first, matching the exact shape
GTFS-based logic would eventually produce. You can swap the mock lookup
for a real GTFS SQL query later without changing anything else.

Run this file directly to test it standalone - no LLM, no API keys needed.
"""

import random
from typing import List

from shared.schemas import RouteLeg, TransitLegResult, MOCK_ROUTE_OPTIONS


# ---------------------------------------------------------------------------
# Tool 1: mock fare table (₹ per km, differs by mode)
# In a real system this comes from GTFS fare_rules / fare_attributes tables.
# ---------------------------------------------------------------------------

FARE_PER_KM = {
    "bus": 2.5,
    "train": 1.5,
    "metro": 3.0,
}

BASE_FARE = {
    "bus": 5,
    "train": 10,
    "metro": 10,
}


def get_fare(mode: str, distance_km: float) -> float:
    base = BASE_FARE.get(mode, 5)
    per_km = FARE_PER_KM.get(mode, 2.5)
    return round(base + per_km * distance_km, 2)


# ---------------------------------------------------------------------------
# Tool 2: mock schedule (average speed by mode -> duration)
# In a real system this comes from GTFS stop_times.txt.
# ---------------------------------------------------------------------------

AVG_SPEED_KMPH = {
    "bus": 20,
    "train": 40,
    "metro": 35,
}


def get_duration_minutes(mode: str, distance_km: float) -> float:
    speed = AVG_SPEED_KMPH.get(mode, 20)
    return round((distance_km / speed) * 60, 1)


# ---------------------------------------------------------------------------
# Tool 3: mock live status (next departure + delay)
# In a real system this comes from a live GTFS-realtime feed.
# ---------------------------------------------------------------------------

def get_live_status(mode: str) -> dict:
    next_departure = round(random.uniform(2, 15), 1)     # minutes until next one arrives
    # most of the time on-time, occasionally delayed - mirrors real-world patterns
    delay = 0.0
    status = "On Time"
    if random.random() < 0.3:  # 30% chance of delay
        delay = round(random.uniform(5, 20), 1)
        status = "Delayed"
    return {"next_departure_minutes": next_departure, "delay_minutes": delay, "status": status}


# ---------------------------------------------------------------------------
# Main entry point - processes ONE leg
# ---------------------------------------------------------------------------

def process_transit_leg(leg: RouteLeg) -> TransitLegResult:
    try:
        mode = leg["mode"]
        if mode not in ("bus", "train", "metro"):
            raise ValueError(f"process_transit_leg called with non-transit mode: {mode}")

        fare = get_fare(mode, leg["distance_km"])
        duration = get_duration_minutes(mode, leg["distance_km"])
        live = get_live_status(mode)

        result: TransitLegResult = {
            "leg_id": leg["leg_id"],
            "mode": mode,
            "line_number": leg["line_number"],
            "fare_inr": fare,
            "duration_minutes": duration,
            "next_departure_minutes": live["next_departure_minutes"],
            "delay_minutes": live["delay_minutes"],
            "status": live["status"],
            "error": None,
        }
        return result

    except Exception as e:
        return {
            "leg_id": leg.get("leg_id", "unknown"), "mode": leg.get("mode", "unknown"),
            "line_number": leg.get("line_number"), "fare_inr": 0, "duration_minutes": 0,
            "next_departure_minutes": 0, "delay_minutes": 0, "status": "Unknown",
            "error": str(e),
        }


# ---------------------------------------------------------------------------
# Process ALL transit legs across ALL route options (this is what the
# Orchestrator will actually call)
# ---------------------------------------------------------------------------

def run_transit_agent(route_options: list) -> List[TransitLegResult]:
    results = []
    for route in route_options:
        for leg in route["legs"]:
            if leg["mode"] in ("bus", "train", "metro"):
                results.append(process_transit_leg(leg))
    return results


if __name__ == "__main__":
    import json
    # Test standalone using the mock CBE Railway -> Martin's Apartments routes
    results = run_transit_agent(MOCK_ROUTE_OPTIONS)
    print(json.dumps(results, indent=2))