import { create } from 'zustand'
import type { OsrmRoute, SearchResult } from '../components/map/types'
import type { EnvironmentAnalyzeResponse, TravelPreference } from '../services/environmentService'

export type PlannedTrip = {
  origin: SearchResult
  destination: SearchResult
  route: OsrmRoute
  preference: TravelPreference
  departureTime: string
  environment: EnvironmentAnalyzeResponse
}

interface RouteStore {
  query: string
  geographicResult: unknown
  currentTrip: PlannedTrip | null
  setQuery: (query: string) => void
  setGeographicResult: (result: unknown) => void
  setCurrentTrip: (trip: PlannedTrip) => void
  clearCurrentTrip: () => void
}

export const useRouteStore = create<RouteStore>((set) => ({
  query: '',
  geographicResult: null,
  currentTrip: null,

  setQuery: (query) => set({ query }),
  setGeographicResult: (result) => set({ geographicResult: result }),
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  clearCurrentTrip: () => set({ currentTrip: null }),
}))
