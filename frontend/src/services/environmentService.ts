import apiClient from './apiClient'

export type Coordinate = {
  lat: number
  lng: number
}

export type EnvironmentAnalyzeRequest = {
  origin: Coordinate
  destination: Coordinate
  departureTime?: string
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
}

export type EnvironmentAnalyzeResponse = {
  weather: WeatherImpact
  traffic: TrafficImpact
  recommendation: TravelImpact
  travelImpact: TravelImpact
  message?: string
}

// Backend may return travelImpact or recommendation — accept both
type RawResponse = {
  weather: WeatherImpact
  traffic: TrafficImpact
  recommendation?: TravelImpact
  travelImpact?: TravelImpact
  message?: string
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
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Environmental analysis failed.'
    console.error('[EnvironmentService] Caught exception', { payload, error })
    return fallbackEnvironment(message)
  }
}
