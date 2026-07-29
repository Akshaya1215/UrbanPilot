import apiClient from './apiClient'

export type Coordinate = {
  lat: number
  lng: number
}

export type TravelPreference = 'Fastest' | 'Cheapest' | 'Balanced' | 'Comfort'

export type EnvironmentAnalyzeRequest = {
  origin: Coordinate
  destination: Coordinate
  departureTime?: string
  travelPreference?: TravelPreference
}

export type WeatherImpact = {
  condition: string
  temperature: number
  humidity: number
  windSpeed: number
  visibility?: number
  rain?: boolean
  description?: string
}

export type TrafficImpact = {
  level: string
  delayMinutes: number
  averageSpeed: number
  roadIncidents?: Array<Record<string, unknown>>
}

export type TravelImpact = {
  walkingComfort: string
  bikeComfort: string
  recommendedTransport: string
  reason: string
  bookingUrl?: string
}

export type JourneyLeg = {
  transport: string
  instruction: string
  durationMinutes: number
  distanceMeters: number
  departureTime: string
  arrivalTime: string
  fare: number
  stationName?: string
  busNumber?: string
  trainNumber?: string
  metroLine?: string
  waitingTimeMinutes?: number
  bookingUrl?: string
}

export type BackendRouteOption = {
  id?: string
  rank?: number
  recommended?: boolean
  transport?: string
  transportSequence?: string[]
  journeyType?: string
  departureTime?: string
  arrivalTime?: string
  departure?: string
  arrival?: string
  waitingTime?: string
  eta?: string | number
  etaMinutes?: number
  travelTime?: string | number
  totalEta?: string
  distance?: string | number
  distanceMeters?: number
  fare?: string | number
  totalFare?: string | number
  weather?: string
  weatherImpact?: string
  traffic?: string
  trafficImpact?: string
  walkingDistance?: string | number
  walkingDistanceMeters?: number
  carbon?: string | number
  carbonEmissionKg?: number
  comfort?: string | number
  comfortScore?: number
  availability?: string | { status?: string }
  overallScore?: string | number
  score?: string | number
  reason?: string
  bookingUrl?: string
  legs?: JourneyLeg[]
}

export type EnvironmentAnalyzeResponse = {
  weather: WeatherImpact
  traffic: TrafficImpact
  recommendation: TravelImpact
  travelImpact: TravelImpact
  message?: string
  bookingUrl?: string
  routes?: BackendRouteOption[]
}

// Backend may return travelImpact or recommendation — accept both
type RawResponse = {
  weather: WeatherImpact
  traffic: TrafficImpact
  recommendation?: TravelImpact
  travelImpact?: TravelImpact
  message?: string
  bookingUrl?: string
  routes?: BackendRouteOption[]
}

function isValidCoordinate(coordinate: Coordinate) {
  return (
    Number.isFinite(coordinate.lat) &&
    Number.isFinite(coordinate.lng) &&
    coordinate.lat >= -90 &&
    coordinate.lat <= 90 &&
    coordinate.lng >= -180 &&
    coordinate.lng <= 180
  )
}

function fallbackEnvironment(message: string): EnvironmentAnalyzeResponse {
  return {
    message,
    weather: {
      condition: 'Unavailable',
      temperature: 0,
      humidity: 0,
      windSpeed: 0,
      visibility: 0,
      rain: false,
      description: message,
    },
    traffic: {
      level: 'Unavailable',
      delayMinutes: 0,
      averageSpeed: 0,
      roadIncidents: [],
    },
    recommendation: {
      walkingComfort: 'Unknown',
      bikeComfort: 'Unknown',
      recommendedTransport: 'Bus',
      reason: message,
    },
    travelImpact: {
      walkingComfort: 'Unknown',
      bikeComfort: 'Unknown',
      recommendedTransport: 'Bus',
      reason: message,
    },
  }
}

export async function analyzeEnvironment(
  payload: EnvironmentAnalyzeRequest,
): Promise<EnvironmentAnalyzeResponse> {
  console.info('[EnvironmentService] Backend request body', payload)

  if (!isValidCoordinate(payload.origin) || !isValidCoordinate(payload.destination)) {
    const message = 'Environmental analysis skipped because the route contains invalid coordinates.'
    console.error('[EnvironmentService] Invalid request blocked', { payload, message })
    return fallbackEnvironment(message)
  }

  try {
    const { data } = await apiClient.post<RawResponse>('/environment/analyze', payload)
    console.info('[EnvironmentService] Backend response', data)

    const recommendation = data.recommendation ?? data.travelImpact

    if (!data.weather || !data.traffic || !recommendation) {
      const message = 'Backend returned an incomplete environmental response.'
      console.error('[EnvironmentService] Incomplete response', { data, message })
      return fallbackEnvironment(message)
    }

    return {
      weather: data.weather,
      traffic: data.traffic,
      recommendation,
      travelImpact: recommendation,
      message: data.message,
      bookingUrl: data.bookingUrl,
      routes: data.routes,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Environmental analysis failed.'
    console.error('[EnvironmentService] Caught exception', { payload, error })
    return fallbackEnvironment(message)
  }
}
