"""
agents/transit_agent.py

Agent 2: The Public Transit Agent ("The Metro Expert") — NOT BUILT YET.

Planned job: given the nearest_stations found by the Geographic Agent,
query a GTFS (General Transit Feed Specification) dataset loaded into a
SQL DB to compute middle-mile transit time, schedules, and fixed fares
between two stations.

Planned input:  GeoAgentState (specifically origin/destination nearest_stations)
Planned output: {"transit_time_min": int, "fare_rupees": float, "schedule": [...]}

Build this after Agent 1 is reviewed and working end-to-end.
"""

def run_transit_agent(origin_station: dict, destination_station: dict) -> dict:
    raise NotImplementedError("Agent 2 is planned for the next milestone.")
