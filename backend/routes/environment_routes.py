"""FastAPI routes for Environmental Intelligence Agent."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Annotated, Any, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field, field_validator

from backend.agents.environmental_agent import (
    EnvironmentalIntelligenceAgent,
    environmental_agent,
)
from backend.tools.traffic_tool import (
    MissingTomTomAPIKeyError,
    TrafficAPIUnavailableError,
    TrafficAPITimeoutError,
    TrafficRateLimitError,
)
from backend.tools.weather_tool import (
    MissingWeatherAPIKeyError,
    WeatherAPIUnavailableError,
    WeatherAPITimeoutError,
    WeatherRateLimitError,
)

router = APIRouter(prefix="/api/environment", tags=["environment"])
logger = logging.getLogger(__name__)


class CoordinateModel(BaseModel):
    """Latitude and longitude accepted from the frontend."""

    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


class EnvironmentAnalyzeRequest(BaseModel):
    """Request body for environmental route analysis."""

    origin: CoordinateModel
    destination: CoordinateModel
    departureTime: datetime
    travelPreference: Literal[
        "Fastest",
        "Cheapest",
        "Balanced",
        "Comfort",
    ] | None = None

    @field_validator("departureTime")
    @classmethod
    def ensure_departure_time(cls, value: datetime) -> datetime:
        """Reject departure timestamps older than current time plus five minutes."""
        normalized = value if value.tzinfo else value.replace(tzinfo=timezone.utc)
        minimum = datetime.now(normalized.tzinfo) + timedelta(minutes=5)
        if normalized < minimum:
            raise ValueError("Departure time must be at least 5 minutes in the future.")
        return value


class WeatherResponse(BaseModel):
    """Weather response sent to the frontend."""

    condition: str
    temperature: int
    humidity: int
    windSpeed: int
    visibility: int
    rain: bool
    description: str


class TrafficResponse(BaseModel):
    """Traffic response sent to the frontend."""

    level: str
    delayMinutes: int
    averageSpeed: int
    roadIncidents: list[dict[str, Any]]


class TravelImpactResponse(BaseModel):
    """Business recommendation response sent to the frontend."""

    walkingComfort: str
    bikeComfort: str
    recommendedTransport: str
    reason: str
    bookingUrl: str | None = None


class JourneyLegResponse(BaseModel):
    """Single leg inside a multimodal route option."""

    transport: str
    instruction: str
    durationMinutes: int
    distanceMeters: int
    departureTime: datetime
    arrivalTime: datetime
    fare: int
    stationName: str | None = None
    busNumber: str | None = None
    trainNumber: str | None = None
    metroLine: str | None = None
    waitingTimeMinutes: int | None = None
    bookingUrl: str | None = None


class RouteOptionResponse(BaseModel):
    """Detailed journey option sent to the frontend."""

    id: str
    rank: int
    recommended: bool
    transport: str
    transportSequence: list[str]
    journeyType: str
    departureTime: datetime
    arrivalTime: datetime
    departure: str
    arrival: str
    waitingTime: str
    fare: str
    totalFare: int
    travelTime: str
    totalEta: str
    etaMinutes: int
    distance: str
    distanceMeters: int
    walkingDistance: str
    walkingDistanceMeters: int
    carbon: str
    carbonEmissionKg: float
    comfort: str
    comfortScore: int
    availability: str
    overallScore: int
    reason: str
    bookingUrl: str
    legs: list[JourneyLegResponse]


class EnvironmentAnalyzeResponse(BaseModel):
    """Complete environmental analysis response."""

    model_config = ConfigDict(extra="forbid")

    weather: WeatherResponse
    traffic: TrafficResponse
    travelImpact: TravelImpactResponse
    routes: list[RouteOptionResponse] = Field(default_factory=list)
    message: str | None = None


def get_environmental_agent() -> EnvironmentalIntelligenceAgent:
    """Dependency injection hook for tests and future orchestrator wiring."""
    return environmental_agent


def _fallback_analysis(message: str) -> dict[str, Any]:
    """Return a contract-compatible response when external providers fail."""
    return {
        "message": message,
        "weather": {
            "condition": "Unavailable",
            "temperature": 0,
            "humidity": 0,
            "windSpeed": 0,
            "visibility": 0,
            "rain": False,
            "description": message,
        },
        "traffic": {
            "level": "Unavailable",
            "delayMinutes": 0,
            "averageSpeed": 0,
            "roadIncidents": [],
        },
            "travelImpact": {
                "walkingComfort": "Unknown",
                "bikeComfort": "Unknown",
                "recommendedTransport": "Bus",
                "reason": message,
                "bookingUrl": "https://www.redbus.in",
            },
            "routes": [],
    }


@router.post(
    "/analyze",
    response_model=EnvironmentAnalyzeResponse,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def analyze_environment(
    payload: EnvironmentAnalyzeRequest,
    agent: Annotated[
        EnvironmentalIntelligenceAgent,
        Depends(get_environmental_agent),
    ],
) -> dict[str, Any]:
    """Analyze route weather, traffic, and travel impact."""
    request_log = {
        "origin": payload.origin.model_dump(),
        "destination": payload.destination.model_dump(),
        "departureTime": payload.departureTime.isoformat(),
        "travelPreference": payload.travelPreference,
    }
    logger.info("Environment analyze request: %s", request_log)
    try:
        analysis_kwargs = {
            "origin": payload.origin.model_dump(),
            "destination": payload.destination.model_dump(),
            "departure_time": payload.departureTime,
        }
        if payload.travelPreference is not None:
            analysis_kwargs["travel_preference"] = payload.travelPreference
        response = await agent.analyze(**analysis_kwargs)
        logger.info("Environment analyze response: %s", response)
        return response
    except (MissingWeatherAPIKeyError, MissingTomTomAPIKeyError) as exc:
        message = f"Environmental provider configuration error: {exc}"
        logger.exception("Environment analyze caught exception: %s", message)
        return _fallback_analysis(message)
    except (WeatherAPITimeoutError, TrafficAPITimeoutError) as exc:
        message = f"Environmental provider timed out: {exc}"
        logger.exception("Environment analyze caught exception: %s", message)
        return _fallback_analysis(message)
    except (WeatherRateLimitError, TrafficRateLimitError) as exc:
        message = f"Environmental provider rate limit reached: {exc}"
        logger.exception("Environment analyze caught exception: %s", message)
        return _fallback_analysis(message)
    except (WeatherAPIUnavailableError, TrafficAPIUnavailableError) as exc:
        message = f"Environmental provider unavailable: {exc}"
        logger.exception("Environment analyze caught exception: %s", message)
        return _fallback_analysis(message)
    except Exception as exc:
        logger.exception("Unexpected environment analyze exception.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Environmental analysis failed unexpectedly.",
        ) from exc
