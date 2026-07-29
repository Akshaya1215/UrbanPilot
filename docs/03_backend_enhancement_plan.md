# UrbanPilot Backend Enhancement Plan

## Current backend contract

The frontend currently calls `POST /api/environment/analyze`, implemented in `backend/routes/environment_routes.py`.

The request accepts:

- `origin.lat`, `origin.lng`
- `destination.lat`, `destination.lng`
- `departureTime`
- `travelPreference` as an optional non-breaking planner preference

The response currently provides:

- `weather.condition`, `temperature`, `humidity`, `windSpeed`, `visibility`, `rain`, `description`
- `traffic.level`, `delayMinutes`, `averageSpeed`, `roadIncidents`
- `travelImpact.walkingComfort`, `bikeComfort`, `recommendedTransport`, `reason`
- `message` for fallback/provider status

## Missing fields for full multimodal planning

The backend does not yet return multiple route options. To power route cards, ranking, booking, comparison tables, and charts, add a route planning response with:

- `routes[].id`
- `routes[].title`
- `routes[].modes[]`
- `routes[].segments[]` with mode, provider, start, end, ETA, distance, fare, walking distance, and transfer details
- `routes[].etaMinutes`
- `routes[].arrivalTime`
- `routes[].totalFare`
- `routes[].currency`
- `routes[].distanceMeters`
- `routes[].walkingDistanceMeters`
- `routes[].weatherImpact`
- `routes[].trafficImpact`
- `routes[].carbonEmissionKg`
- `routes[].comfortScore`
- `routes[].availability.status`
- `routes[].availability.waitMinutes`
- `routes[].booking.provider`
- `routes[].booking.url`
- `routes[].overallScore`
- `routes[].rankingReasons[]`
- `bestRouteId`
- `comparison.savingsComparedToAlternatives`

## Backend files to extend

- `backend/core/schema.py`: add shared typed contracts for multimodal route request and response shapes.
- `backend/routes/environment_routes.py`: keep `/api/environment/analyze` stable, or add a sibling route such as `/api/environment/routes` for multimodal route ranking.
- `backend/agents/transit_agent.py`: implement public transport options, schedules, fares, availability, and transfers.
- `backend/agents/mobility_agent.py`: implement cab, bike taxi, bike, fare quotes, pickup ETA, provider availability, and booking URLs.
- `backend/agents/synthesis_agent.py`: rank all options by user preference and produce `bestRouteId`, scores, reasons, and savings.
- `backend/tools/impact_calculator.py`: expand scoring for comfort, weather safety, traffic impact, and carbon.
- `backend/tools/transit_hub_tool.py`: expose nearest station/stop data needed by route segments.
- `backend/tests/`: add contract tests for multimodal responses, ranking by preference, fallback behavior, and booking-provider pass-through.

## Frontend TODO markers

The frontend now displays TODO labels anywhere a route option needs backend data that does not exist yet. This prevents fake ETA, fare, availability, carbon, score, and booking data from entering the product experience.
