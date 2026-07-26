"""
core/schema.py

THIS FILE IS THE CONTRACT between the two halves of the team.

- You (Agent developer) read/write these shapes inside agents/*.py
- Your teammate (UI/webhook developer) only ever reads the OUTPUT shape
  (GeoAgentState) — they never need to look inside agents/ or tools/.

Rule for the team: if you need to change a field name here, message your
teammate first. This file changing without warning is the #1 cause of
"it worked on my machine" bugs in a two-person split like this.
"""

from typing import TypedDict, Optional, List


class StationInfo(TypedDict):
    """One nearby metro/transit station."""
    name: str
    lat: float
    lon: float
    distance_km: float


class LocationGeo(TypedDict):
    """Everything we know about one point (an origin or a destination)."""
    input_text: str              # what the user typed, e.g. "Anna Nagar"
    display_name: str            # what Nominatim resolved it to (full address)
    lat: float
    lon: float
    nearest_stations: List[StationInfo]


class GeoAgentState(TypedDict):
    """
    The full state that flows through the Geographic Agent's LangGraph graph.

    This is also EXACTLY the dict shape that run_geographic_agent() returns.
    Your teammate's webhook handler will receive this dict and format it
    into a WhatsApp message — nothing more, nothing less.
    """
    user_message: str
    origin_text: Optional[str]
    destination_text: Optional[str]
    origin: Optional[LocationGeo]
    destination: Optional[LocationGeo]
    error: Optional[str]
