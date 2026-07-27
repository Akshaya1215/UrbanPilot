"""
tools/transit_hub_tool.py

Given a lat/lon, finds the nearest metro/rail stations using the Overpass
API (the query engine for OpenStreetMap data).

This version automatically retries multiple public Overpass servers and
fails gracefully if none are available.
"""

import math
import requests

OVERPASS_SERVERS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Great-circle distance between two lat/lon points, in kilometers.
    """
    R = 6371.0

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)

    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )

    return 2 * R * math.asin(math.sqrt(a))


def find_nearest_transit_hubs(
    lat: float,
    lon: float,
    radius_m: int = 1500,
    limit: int = 3,
) -> list[dict]:
    """
    Query Overpass for nearby railway/metro stations.

    Returns:
        [
            {
                "name": str,
                "lat": float,
                "lon": float,
                "distance_km": float
            }
        ]

    If all public Overpass servers are unavailable, an empty list is
    returned instead of raising an exception.
    """

    query = f"""
[out:json][timeout:15];
(
  node(around:{radius_m},{lat},{lon})["railway"="station"];
  node(around:{radius_m},{lat},{lon})["station"="subway"];
);
out body;
"""

    headers = {
        "User-Agent": "UrbanPilot/1.0 (student project)",
        "Accept": "application/json",
    }

    elements = []

    for server in OVERPASS_SERVERS:
        try:
            response = requests.post(
                server,
                data={"data": query},
                headers=headers,
                timeout=20,
            )

            response.raise_for_status()

            elements = response.json().get("elements", [])

            break

        except requests.RequestException:
            continue

    if not elements:
        return []

    stations = []
    seen_names = set()

    for el in elements:
        name = el.get("tags", {}).get("name")

        if not name or name in seen_names:
            continue

        seen_names.add(name)

        distance = haversine_km(
            lat,
            lon,
            el["lat"],
            el["lon"],
        )

        stations.append(
            {
                "name": name,
                "lat": el["lat"],
                "lon": el["lon"],
                "distance_km": round(distance, 2),
            }
        )

    stations.sort(key=lambda station: station["distance_km"])

    return stations[:limit]
