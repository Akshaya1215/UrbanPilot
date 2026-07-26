"""
tools/transit_hub_tool.py

Given a lat/lon, finds the nearest metro/rail stations using the Overpass
API (the query engine for OpenStreetMap data — same underlying dataset
Nominatim uses, different endpoint, no API key required).

Docs: https://wiki.openstreetmap.org/wiki/Overpass_API
"""

import math
import requests

OVERPASS_URL = "https://overpass-api.de/api/interpreter"


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Great-circle distance between two lat/lon points, in kilometers.
    Straight-line distance, not walking/road distance — good enough for
    "which station is closest" ranking, which is all Agent 1 needs to answer.
    """
    R = 6371.0  # Earth's mean radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = (math.sin(d_phi / 2) ** 2
         + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2)
    return 2 * R * math.asin(math.sqrt(a))


def find_nearest_transit_hubs(
    lat: float,
    lon: float,
    radius_m: int = 1500,
    limit: int = 3,
) -> list[dict]:
    """
    Query Overpass for railway/metro stations within radius_m of (lat, lon),
    then sort by actual distance and return the closest `limit` of them.

    Returns a list of:
        {"name": str, "lat": float, "lon": float, "distance_km": float}
    Empty list if nothing is found nearby (e.g. radius too small, or the
    city's metro isn't in OSM yet).
    """
    query = f"""
    [out:json][timeout:15];
    (
      node(around:{radius_m},{lat},{lon})["railway"="station"];
      node(around:{radius_m},{lat},{lon})["station"="subway"];
    );
    out body;
    """

    response = requests.post(OVERPASS_URL, data={"data": query}, timeout=20)
    response.raise_for_status()
    elements = response.json().get("elements", [])

    stations = []
    seen_names = set()
    for el in elements:
        name = el.get("tags", {}).get("name")
        if not name or name in seen_names:
            continue
        seen_names.add(name)
        dist = haversine_km(lat, lon, el["lat"], el["lon"])
        stations.append({
            "name": name,
            "lat": el["lat"],
            "lon": el["lon"],
            "distance_km": round(dist, 2),
        })

    stations.sort(key=lambda s: s["distance_km"])
    return stations[:limit]
