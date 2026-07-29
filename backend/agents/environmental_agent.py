"""Environmental Intelligence Agent for route weather and traffic analysis."""

from __future__ import annotations

from datetime import datetime, timedelta
from math import asin, cos, radians, sin, sqrt
from typing import Any, Awaitable, Callable

from backend.tools.impact_calculator import calculate_travel_impact
from backend.tools.traffic_tool import fetch_traffic
from backend.tools.weather_tool import fetch_weather

Coordinate = dict[str, float]
WeatherFetcher = Callable[..., Awaitable[dict[str, Any]]]
TrafficFetcher = Callable[..., Awaitable[dict[str, Any]]]


class EnvironmentalIntelligenceAgent:
    """Coordinates weather, traffic, and impact analysis for a trip."""

    def __init__(
        self,
        *,
        weather_fetcher: WeatherFetcher = fetch_weather,
        traffic_fetcher: TrafficFetcher = fetch_traffic,
    ) -> None:
        self._weather_fetcher = weather_fetcher
        self._traffic_fetcher = traffic_fetcher

    async def analyze(
        self,
        *,
        origin: Coordinate,
        destination: Coordinate,
        departure_time: datetime,
        travel_preference: str | None = None,
    ) -> dict[str, Any]:
        """Return the environmental travel impact report for a route."""
        weather = await self._weather_fetcher(
            origin["lat"],
            origin["lng"],
        )
        traffic = await self._traffic_fetcher(
            origin,
            destination,
            departure_time=departure_time,
        )
        travel_impact = calculate_travel_impact(weather, traffic)
        routes = build_journey_options(
            origin=origin,
            destination=destination,
            departure_time=departure_time,
            weather=weather,
            traffic=traffic,
            travel_preference=travel_preference or "Balanced",
        )

        return {
            "weather": {
                "condition": weather["condition"],
                "temperature": weather["temperature"],
                "humidity": weather["humidity"],
                "windSpeed": weather["windSpeed"],
                "visibility": weather["visibility"],
                "rain": weather["rain"],
                "description": weather["description"],
            },
            "traffic": {
                "level": traffic["level"],
                "delayMinutes": traffic["delayMinutes"],
                "averageSpeed": traffic["averageSpeed"],
                "roadIncidents": traffic.get("roadIncidents", []),
            },
            "travelImpact": travel_impact,
            "routes": routes,
        }


environmental_agent = EnvironmentalIntelligenceAgent()


def _haversine_km(origin: Coordinate, destination: Coordinate) -> float:
    radius_km = 6371.0
    d_lat = radians(destination["lat"] - origin["lat"])
    d_lng = radians(destination["lng"] - origin["lng"])
    lat1 = radians(origin["lat"])
    lat2 = radians(destination["lat"])
    value = sin(d_lat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(d_lng / 2) ** 2
    return radius_km * 2 * asin(sqrt(value))


def _minutes_after(departure_time: datetime, minutes: int) -> str:
    return (departure_time + timedelta(minutes=minutes)).isoformat()


def _clock_after(departure_time: datetime, minutes: int) -> str:
    return (departure_time + timedelta(minutes=minutes)).strftime("%I:%M %p")


def _route_number(prefix: str, origin: Coordinate, destination: Coordinate, modulo: int) -> str:
    seed = abs(
        int(origin["lat"] * 1000)
        + int(origin["lng"] * 1000)
        + int(destination["lat"] * 1000)
        + int(destination["lng"] * 1000)
    )
    return f"{prefix}{seed % modulo + 1:03d}"


def _availability(traffic: dict[str, Any], weather: dict[str, Any], transport: str) -> str:
    if transport in {"Bike", "Rapido"} and weather.get("rain"):
        return "Limited"
    if transport in {"Cab", "Bus"} and traffic.get("level") == "Heavy":
        return "Delayed"
    return "Available"


def _segment(
    *,
    transport: str,
    instruction: str,
    duration_minutes: int,
    distance_meters: int,
    departure_time: datetime,
    start_offset: int,
    fare: int = 0,
    station_name: str | None = None,
    bus_number: str | None = None,
    train_number: str | None = None,
    metro_line: str | None = None,
    booking_url: str | None = None,
    waiting_time_minutes: int | None = None,
) -> dict[str, Any]:
    leg: dict[str, Any] = {
        "transport": transport,
        "instruction": instruction,
        "durationMinutes": duration_minutes,
        "distanceMeters": distance_meters,
        "departureTime": _minutes_after(departure_time, start_offset),
        "arrivalTime": _minutes_after(departure_time, start_offset + duration_minutes),
        "fare": fare,
    }
    optional = {
        "stationName": station_name,
        "busNumber": bus_number,
        "trainNumber": train_number,
        "metroLine": metro_line,
        "bookingUrl": booking_url,
        "waitingTimeMinutes": waiting_time_minutes,
    }
    leg.update({key: value for key, value in optional.items() if value is not None})
    return leg


def build_journey_options(
    *,
    origin: Coordinate,
    destination: Coordinate,
    departure_time: datetime,
    weather: dict[str, Any],
    traffic: dict[str, Any],
    travel_preference: str,
) -> list[dict[str, Any]]:
    distance_km = max(_haversine_km(origin, destination), 1.0)
    traffic_delay = int(traffic.get("delayMinutes", 0))
    rain = bool(weather.get("rain"))
    origin_station = "Origin transit point"
    destination_station = "Destination transit point"
    bus_number = _route_number("B", origin, destination, 899)
    train_number = _route_number("", origin, destination, 12999)
    metro_line = "Blue Line" if abs(origin["lat"] - destination["lat"]) >= abs(origin["lng"] - destination["lng"]) else "Green Line"

    base_walk = max(250, min(1200, int(distance_km * 90)))
    options: list[dict[str, Any]] = []

    def add_option(
        *,
        route_id: str,
        transport: str,
        sequence: list[str],
        legs: list[dict[str, Any]],
        fare: int,
        comfort: int,
        reason: str,
        booking_url: str,
    ) -> None:
        duration = sum(int(leg["durationMinutes"]) + int(leg.get("waitingTimeMinutes", 0)) for leg in legs)
        walking_distance = sum(int(leg["distanceMeters"]) for leg in legs if leg["transport"] == "Walk")
        carbon = 0.0
        if transport == "Cab":
            carbon = distance_km * 0.18
        elif "Bus" in sequence:
            carbon = distance_km * 0.06
        elif "Train" in sequence or "Metro" in sequence:
            carbon = distance_km * 0.035
        elif transport == "Bike":
            carbon = distance_km * 0.015
        score = max(1, min(100, int(100 - duration * 0.45 - fare * 0.05 + comfort * 3)))
        options.append(
            {
                "id": route_id,
                "transport": transport,
                "transportSequence": sequence,
                "journeyType": " -> ".join(sequence),
                "departureTime": _minutes_after(departure_time, 0),
                "arrivalTime": _minutes_after(departure_time, duration),
                "waitingTime": f"{sum(int(leg.get('waitingTimeMinutes', 0)) for leg in legs)} min",
                "fare": f"₹{fare}",
                "totalFare": fare,
                "travelTime": f"{duration} min",
                "totalEta": f"{duration} min",
                "etaMinutes": duration,
                "distance": f"{distance_km:.1f} km",
                "distanceMeters": int(distance_km * 1000),
                "walkingDistance": f"{walking_distance} m",
                "walkingDistanceMeters": walking_distance,
                "carbon": f"{carbon:.1f} kg CO2",
                "carbonEmissionKg": round(carbon, 2),
                "comfort": f"{comfort}/10",
                "comfortScore": comfort,
                "availability": _availability(traffic, weather, sequence[-2] if len(sequence) > 1 else transport),
                "overallScore": score,
                "reason": reason,
                "bookingUrl": booking_url,
                "legs": legs,
            }
        )

    train_wait = 8
    train_minutes = max(35, int(distance_km * 1.8))
    add_option(
        route_id="walk-train-walk",
        transport="Walk -> Train -> Walk",
        sequence=["Walk", "Train", "Walk"],
        fare=max(45, int(distance_km * 1.2)),
        comfort=8 if not rain else 7,
        reason="Rail keeps the long segment predictable and avoids most road congestion.",
        booking_url="https://www.irctc.co.in/",
        legs=[
            _segment(transport="Walk", instruction=f"Walk {base_walk} meters to {origin_station}.", duration_minutes=max(4, base_walk // 80), distance_meters=base_walk, departure_time=departure_time, start_offset=0, station_name=origin_station),
            _segment(transport="Train", instruction=f"Board Train {train_number} toward {destination_station}.", duration_minutes=train_minutes, distance_meters=int(distance_km * 920), departure_time=departure_time, start_offset=max(4, base_walk // 80) + train_wait, fare=max(45, int(distance_km * 1.2)), station_name=origin_station, train_number=train_number, booking_url="https://www.irctc.co.in/", waiting_time_minutes=train_wait),
            _segment(transport="Walk", instruction=f"Walk {max(250, base_walk // 2)} meters from {destination_station} to destination.", duration_minutes=max(3, base_walk // 140), distance_meters=max(250, base_walk // 2), departure_time=departure_time, start_offset=max(4, base_walk // 80) + train_wait + train_minutes, station_name=destination_station),
        ],
    )

    bus_minutes = max(18, int(distance_km * 3.1) + traffic_delay)
    add_option(
        route_id="walk-bus-walk",
        transport="Walk -> Bus -> Walk",
        sequence=["Walk", "Bus", "Walk"],
        fare=max(15, int(distance_km * 0.8)),
        comfort=6 if traffic.get("level") == "Heavy" else 7,
        reason="Bus offers a lower fare with short walking connections.",
        booking_url="https://www.redbus.in",
        legs=[
            _segment(transport="Walk", instruction=f"Walk {base_walk} meters to the nearest bus stop.", duration_minutes=max(4, base_walk // 80), distance_meters=base_walk, departure_time=departure_time, start_offset=0, station_name=origin_station),
            _segment(transport="Bus", instruction=f"Take Bus {bus_number} toward {destination_station}.", duration_minutes=bus_minutes, distance_meters=int(distance_km * 930), departure_time=departure_time, start_offset=max(4, base_walk // 80) + 6, fare=max(15, int(distance_km * 0.8)), station_name=origin_station, bus_number=bus_number, booking_url="https://www.redbus.in", waiting_time_minutes=6),
            _segment(transport="Walk", instruction=f"Walk {max(250, base_walk // 2)} meters to destination.", duration_minutes=max(3, base_walk // 140), distance_meters=max(250, base_walk // 2), departure_time=departure_time, start_offset=max(4, base_walk // 80) + 6 + bus_minutes, station_name=destination_station),
        ],
    )

    metro_minutes = max(14, int(distance_km * 2.0))
    add_option(
        route_id="walk-metro-walk",
        transport="Walk -> Metro -> Walk",
        sequence=["Walk", "Metro", "Walk"],
        fare=max(20, int(distance_km)),
        comfort=8,
        reason="Metro minimizes traffic exposure and keeps arrival time reliable.",
        booking_url="https://chennaimetrorail.org/",
        legs=[
            _segment(transport="Walk", instruction=f"Walk {base_walk} meters to {origin_station}.", duration_minutes=max(4, base_walk // 80), distance_meters=base_walk, departure_time=departure_time, start_offset=0, station_name=origin_station),
            _segment(transport="Metro", instruction=f"Take the {metro_line} toward {destination_station}.", duration_minutes=metro_minutes, distance_meters=int(distance_km * 900), departure_time=departure_time, start_offset=max(4, base_walk // 80) + 5, fare=max(20, int(distance_km)), station_name=origin_station, metro_line=metro_line, booking_url="https://chennaimetrorail.org/", waiting_time_minutes=5),
            _segment(transport="Walk", instruction=f"Walk {max(250, base_walk // 2)} meters to destination.", duration_minutes=max(3, base_walk // 140), distance_meters=max(250, base_walk // 2), departure_time=departure_time, start_offset=max(4, base_walk // 80) + 5 + metro_minutes, station_name=destination_station),
        ],
    )

    rapido_minutes = max(8, int(distance_km * 1.4) + traffic_delay // 2)
    add_option(
        route_id="rapido-metro-walk",
        transport="Rapido -> Metro -> Walk",
        sequence=["Rapido", "Metro", "Walk"],
        fare=max(60, int(distance_km * 5.5)),
        comfort=7 if not rain else 5,
        reason="Rapido shortens the first mile, then metro avoids road congestion.",
        booking_url="https://www.rapido.bike/",
        legs=[
            _segment(transport="Rapido", instruction=f"Ride to {origin_station}.", duration_minutes=rapido_minutes, distance_meters=max(800, int(distance_km * 140)), departure_time=departure_time, start_offset=0, fare=max(35, int(distance_km * 2.5)), station_name=origin_station, booking_url="https://www.rapido.bike/", waiting_time_minutes=4),
            _segment(transport="Metro", instruction=f"Take the {metro_line} toward {destination_station}.", duration_minutes=metro_minutes, distance_meters=int(distance_km * 820), departure_time=departure_time, start_offset=rapido_minutes + 4, fare=max(20, int(distance_km)), station_name=origin_station, metro_line=metro_line, booking_url="https://chennaimetrorail.org/", waiting_time_minutes=5),
            _segment(transport="Walk", instruction=f"Walk {max(250, base_walk // 2)} meters to destination.", duration_minutes=max(3, base_walk // 140), distance_meters=max(250, base_walk // 2), departure_time=departure_time, start_offset=rapido_minutes + 9 + metro_minutes, station_name=destination_station),
        ],
    )

    cab_minutes = max(12, int(distance_km * 2.4) + traffic_delay)
    add_option(
        route_id="cab",
        transport="Cab",
        sequence=["Cab"],
        fare=max(120, int(distance_km * 18)),
        comfort=9,
        reason="Cab provides the most direct door-to-door journey with minimal walking.",
        booking_url="https://www.uber.com/in/en/",
        legs=[
            _segment(transport="Cab", instruction="Ride directly to destination.", duration_minutes=cab_minutes, distance_meters=int(distance_km * 1000), departure_time=departure_time, start_offset=0, fare=max(120, int(distance_km * 18)), booking_url="https://www.uber.com/in/en/", waiting_time_minutes=5),
        ],
    )

    bike_minutes = max(10, int(distance_km * 2.8) + traffic_delay // 2)
    add_option(
        route_id="bike",
        transport="Bike",
        sequence=["Bike"],
        fare=max(20, int(distance_km * 2.0)),
        comfort=6 if rain else 8,
        reason="Bike is efficient in lighter traffic and keeps cost low.",
        booking_url="https://www.rapido.bike/",
        legs=[
            _segment(transport="Bike", instruction="Ride directly to destination.", duration_minutes=bike_minutes, distance_meters=int(distance_km * 1000), departure_time=departure_time, start_offset=0, fare=max(20, int(distance_km * 2.0)), booking_url="https://www.rapido.bike/"),
        ],
    )

    sorters = {
        "Fastest": lambda route: (route["etaMinutes"], route["totalFare"], -route["comfortScore"]),
        "Cheapest": lambda route: (route["totalFare"], route["etaMinutes"], -route["comfortScore"]),
        "Comfort": lambda route: (-route["comfortScore"], route["etaMinutes"], route["totalFare"]),
        "Balanced": lambda route: (-route["overallScore"], route["etaMinutes"], route["totalFare"]),
    }
    options.sort(key=sorters.get(travel_preference, sorters["Balanced"]))

    for index, route in enumerate(options):
        route["rank"] = index + 1
        route["recommended"] = index == 0
        route["departure"] = _clock_after(departure_time, 0)
        route["arrival"] = _clock_after(departure_time, route["etaMinutes"])
    return options


async def run_environmental_agent(
    origin: Coordinate,
    destination: Coordinate,
    departure_time: datetime,
) -> dict[str, Any]:
    """Public entry point for the Environmental Intelligence Agent."""
    return await environmental_agent.analyze(
        origin=origin,
        destination=destination,
        departure_time=departure_time,
    )
