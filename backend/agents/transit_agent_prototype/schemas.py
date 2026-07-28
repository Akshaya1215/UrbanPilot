"""
Shared contract for Agent 3 (Transit Data Agent) and Agent 4
(On-Demand Mobility & Conditions Agent).

A "route" (built later by the Route Options Agent) is a list of LEGS.
Each leg is ONE mode of travel - a bus ride, an auto ride, a walk, etc.
Agent 3 handles bus/train/metro legs. Agent 4 handles auto/cab legs.
Walking legs pass through untouched (Safety Agent will handle those later).
"""

from typing import TypedDict, List, Optional, Literal


# ---------------------------------------------------------------------------
# Input: a single leg of a route (this is what Agent 2 will eventually
# produce - for now we mock it based on your CBE Railway -> Martin's
# Apartments example)
# ---------------------------------------------------------------------------

Mode = Literal["bus", "train", "metro", "auto", "cab", "walk"]


class RouteLeg(TypedDict):
    leg_id: str
    mode: Mode
    line_number: Optional[str]     # e.g. "33", "6", "44" - only for bus/train
    origin_lat: float
    origin_lon: float
    destination_lat: float
    destination_lon: float
    distance_km: float


class RouteOption(TypedDict):
    route_id: str
    legs: List[RouteLeg]


# ---------------------------------------------------------------------------
# Agent 3 output: one enriched result per bus/train leg
# ---------------------------------------------------------------------------

class TransitLegResult(TypedDict):
    leg_id: str
    mode: Mode
    line_number: Optional[str]
    fare_inr: float
    duration_minutes: float
    next_departure_minutes: float   # how long until the next bus/train arrives
    delay_minutes: float            # live delay, e.g. your "15 min delay" example
    status: str                     # "On Time" | "Delayed" | "Unknown"
    error: Optional[str]


# ---------------------------------------------------------------------------
# Agent 4 output: one enriched result per auto/cab leg
# ---------------------------------------------------------------------------

class OnDemandLegResult(TypedDict):
    leg_id: str
    mode: Mode
    provider: str                   # "Ola" | "Uber" | "Auto"
    fare_inr: float
    eta_minutes: float
    surge_multiplier: float
    weather_condition: str
    traffic_delay_minutes: float
    error: Optional[str]


# ---------------------------------------------------------------------------
# Mock input data - CBE Railway Station -> Martin's Apartments
# Three route options, matching your example exactly:
#   Route 1: bus 33 (6km) + auto (4km)               = 10km total... wait, walk(2km) too? see below
#   Route 2: walk (2km) + cab (12km)
#   Route 3: walk (1km) + bus 44 (8km) + bus 6 (3km, 15 min delay)
# (Coordinates are illustrative Coimbatore-area points for testing purposes)
# ---------------------------------------------------------------------------

CBE_LAT, CBE_LON = 11.0018, 76.9629          # CBE Railway Station (approx)
DEST_LAT, DEST_LON = 11.0510, 76.9910         # Martin's Apartments (approx)

MOCK_ROUTE_OPTIONS: List[RouteOption] = [
    {
        "route_id": "route_1_bus33_auto",
        "legs": [
            {
                "leg_id": "r1_l1", "mode": "bus", "line_number": "33",
                "origin_lat": CBE_LAT, "origin_lon": CBE_LON,
                "destination_lat": 11.0250, "destination_lon": 76.9750,
                "distance_km": 6.0,
            },
            {
                "leg_id": "r1_l2", "mode": "auto", "line_number": None,
                "origin_lat": 11.0250, "origin_lon": 76.9750,
                "destination_lat": DEST_LAT, "destination_lon": DEST_LON,
                "distance_km": 4.0,
            },
        ],
    },
    {
        "route_id": "route_2_walk_cab",
        "legs": [
            {
                "leg_id": "r2_l1", "mode": "walk", "line_number": None,
                "origin_lat": CBE_LAT, "origin_lon": CBE_LON,
                "destination_lat": 11.0120, "destination_lon": 76.9700,
                "distance_km": 2.0,
            },
            {
                "leg_id": "r2_l2", "mode": "cab", "line_number": None,
                "origin_lat": 11.0120, "origin_lon": 76.9700,
                "destination_lat": DEST_LAT, "destination_lon": DEST_LON,
                "distance_km": 12.0,
            },
        ],
    },
    {
        "route_id": "route_3_walk_bus44_bus6",
        "legs": [
            {
                "leg_id": "r3_l1", "mode": "walk", "line_number": None,
                "origin_lat": CBE_LAT, "origin_lon": CBE_LON,
                "destination_lat": 11.0050, "destination_lon": 76.9680,
                "distance_km": 1.0,
            },
            {
                "leg_id": "r3_l2", "mode": "bus", "line_number": "44",
                "origin_lat": 11.0050, "origin_lon": 76.9680,
                "destination_lat": 11.0400, "destination_lon": 76.9850,
                "distance_km": 8.0,
            },
            {
                "leg_id": "r3_l3", "mode": "bus", "line_number": "6",
                "origin_lat": 11.0400, "origin_lon": 76.9850,
                "destination_lat": DEST_LAT, "destination_lon": DEST_LON,
                "distance_km": 3.0,
            },
        ],
    },
]