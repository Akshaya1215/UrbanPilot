"""
tools/transit_hub_tool.py

Given a latitude/longitude, finds the nearest metro / railway stations
using the OpenStreetMap Overpass API.

Automatically retries multiple public Overpass servers and fails
gracefully if all servers are unavailable.
"""

import math
import requests

OVERPASS_SERVERS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two coordinates."""

    R = 6371.0

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)

    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )

    return 2 * R * math.asin(math.sqrt(a))


def find_nearest_transit_hubs(
    lat: float,
    lon: float,
    radius_m: int = 2000,
    limit: int = 5,
) -> list[dict]:
    """
    Returns nearby metro / railway stations.

    Output:
    [
        {
            "name": "...",
            "lat": ...,
            "lon": ...,
            "distance_km": ...
        }
    ]
    """

    query = f"""
[out:json][timeout:20];
(
  node(around:{radius_m},{lat},{lon})["railway"="station"];
  way(around:{radius_m},{lat},{lon})["railway"="station"];
  relation(around:{radius_m},{lat},{lon})["railway"="station"];

  node(around:{radius_m},{lat},{lon})["railway"="halt"];
  way(around:{radius_m},{lat},{lon})["railway"="halt"];
  relation(around:{radius_m},{lat},{lon})["railway"="halt"];

  node(around:{radius_m},{lat},{lon})["station"="subway"];
  way(around:{radius_m},{lat},{lon})["station"="subway"];
  relation(around:{radius_m},{lat},{lon})["station"="subway"];

  node(around:{radius_m},{lat},{lon})["public_transport"="station"];
  way(around:{radius_m},{lat},{lon})["public_transport"="station"];
  relation(around:{radius_m},{lat},{lon})["public_transport"="station"];
);
out center tags;
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
                timeout=25,
            )

            response.raise_for_status()

            data = response.json()

            elements = data.get("elements", [])

            if elements:
                break

        except Exception:
            continue

    if not elements:
        return []

    stations = []
    seen = set()

    for el in elements:

        tags = el.get("tags", {})

        name = tags.get("name")

        if not name:
            continue

        if name in seen:
            continue

        if "lat" in el:
            s_lat = el["lat"]
            s_lon = el["lon"]

        elif "center" in el:
            s_lat = el["center"]["lat"]
            s_lon = el["center"]["lon"]

        else:
            continue

        seen.add(name)

        distance = haversine_km(
            lat,
            lon,
            s_lat,
            s_lon,
        )

        stations.append(
            {
                "name": name,
                "lat": s_lat,
                "lon": s_lon,
                "distance_km": round(distance, 2),
            }
        )

    stations.sort(key=lambda x: x["distance_km"])

    return stations[:limit]
