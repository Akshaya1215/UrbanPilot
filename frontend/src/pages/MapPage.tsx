import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Bot,
  Bus,
  Car,
  ChevronDown,
  ChevronUp,
  CloudRain,
  Compass,
  LocateFixed,
  MapPin,
  Minus,
  Navigation,
  Plus,
  RotateCcw,
  Search,
  Train,
  X,
  Zap,
} from 'lucide-react'
import { analyzeEnvironment, type EnvironmentAnalyzeResponse } from '../services/environmentService'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

type LatLng = { lat: number; lng: number }
type SearchResult = { id: string; name: string; lat: number; lng: number; type: string }
type Maneuver = { type: string; modifier?: string }
type RouteStep = { instruction: string; distance: number; duration: number; name: string; maneuver: Maneuver; location: LatLng }
type RouteData = { geometry: LatLng[]; steps: RouteStep[]; distance: number; duration: number; fetchedAt: number }
type OsrmManeuver = Maneuver & { location?: [number, number] }
type OsrmStep = { distance: number; duration: number; name?: string; maneuver?: OsrmManeuver }
type OsrmLeg = { steps: OsrmStep[] }
type OsrmRoute = { distance: number; duration: number; geometry: { coordinates: [number, number][] }; legs: OsrmLeg[] }
type OsrmResponse = { code: string; routes?: OsrmRoute[] }
type NominatimItem = { place_id: number | string; display_name: string; lat: string; lon: string; type?: string; class?: string }

const MAX_OSRM_DRIVING_DISTANCE_METERS = 5_000_000

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const userIcon = L.divIcon({
  className: '',
  html: '<div class="nav-user-marker"><span></span></div>',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
})

const waypointIcon = L.divIcon({
  className: '',
  html: '<div class="nav-waypoint-marker"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

function haversineMeters(a: LatLng, b: LatLng) {
  const radius = 6_371_000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return radius * 2 * Math.asin(Math.sqrt(h))
}

function isValidCoordinate(value: LatLng | null | undefined): value is LatLng {
  return Boolean(
    value &&
    Number.isFinite(value.lat) &&
    Number.isFinite(value.lng) &&
    value.lat >= -90 &&
    value.lat <= 90 &&
    value.lng >= -180 &&
    value.lng <= 180,
  )
}

function pointToSegmentDistance(point: LatLng, a: LatLng, b: LatLng) {
  const dx = b.lng - a.lng
  const dy = b.lat - a.lat
  const length = dx * dx + dy * dy
  if (!length) return haversineMeters(point, a)
  const t = Math.max(0, Math.min(1, ((point.lng - a.lng) * dx + (point.lat - a.lat) * dy) / length))
  return haversineMeters(point, { lat: a.lat + t * dy, lng: a.lng + t * dx })
}

function routeProgress(route: LatLng[], point: LatLng) {
  if (route.length < 2) return { remaining: 0, completed: 0, total: 0, offRoute: Infinity, closestIndex: 0 }

  const segmentLengths = route.slice(0, -1).map((coord, index) => haversineMeters(coord, route[index + 1]))
  const total = segmentLengths.reduce((sum, distance) => sum + distance, 0)
  let walked = 0
  let bestWalked = 0
  let closestIndex = 0
  let offRoute = Infinity

  for (let index = 0; index < route.length - 1; index += 1) {
    const a = route[index]
    const b = route[index + 1]
    const distance = pointToSegmentDistance(point, a, b)
    if (distance < offRoute) {
      const segment = segmentLengths[index] || 0
      const raw = ((point.lng - a.lng) * (b.lng - a.lng) + (point.lat - a.lat) * (b.lat - a.lat)) /
        ((b.lng - a.lng) ** 2 + (b.lat - a.lat) ** 2 || 1)
      bestWalked = walked + Math.max(0, Math.min(1, raw)) * segment
      closestIndex = index
      offRoute = distance
    }
    walked += segmentLengths[index] || 0
  }

  return { remaining: Math.max(0, total - bestWalked), completed: bestWalked, total, offRoute, closestIndex }
}

function formatDistance(meters: number | null) {
  if (meters == null || Number.isNaN(meters)) return '--'
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`
}

function formatDuration(seconds: number | null) {
  if (seconds == null || Number.isNaN(seconds)) return '--'
  const minutes = Math.max(1, Math.round(seconds / 60))
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`
}

function arrivalTime(seconds: number | null) {
  if (seconds == null) return '--'
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(Date.now() + seconds * 1000))
}

function formatInstruction(maneuver: Maneuver, road: string) {
  if (maneuver.type === 'arrive') return 'Arrive at destination'
  if (maneuver.type === 'depart') return road ? `Head onto ${road}` : 'Start driving'
  const direction = maneuver.modifier?.replace(/_/g, ' ')
  const action = direction ? `Turn ${direction}` : maneuver.type.replace(/_/g, ' ')
  return road ? `${action} on ${road}` : action
}

function InstructionGlyph({ step, size = 18 }: { step?: RouteStep | null; size?: number }) {
  const modifier = step?.maneuver.modifier || ''
  const type = step?.maneuver.type || ''
  if (type === 'arrive') return <MapPin size={size} />
  if (modifier.includes('left')) return <ArrowLeft size={size} />
  if (modifier.includes('right')) return <ArrowRight size={size} />
  if (modifier.includes('straight') || type === 'depart') return <ArrowDown size={size} />
  return <Navigation size={size} />
}

async function fetchRoute(origin: LatLng, destination: LatLng): Promise<RouteData> {
  if (!isValidCoordinate(origin) || !isValidCoordinate(destination)) {
    console.error('[OSRM] Invalid coordinates blocked', { origin, destination })
    throw new Error('Route cannot be calculated because one or more coordinates are invalid.')
  }

  const directDistance = haversineMeters(origin, destination)
  if (directDistance > MAX_OSRM_DRIVING_DISTANCE_METERS) {
    console.warn('[OSRM] Cross-region route blocked', { origin, destination, directDistance })
    throw new Error('Selected destination is too far for a driving route from your current location. Choose a closer matching place.')
  }

  const url = new URL(`https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`)
  url.search = new URLSearchParams({ overview: 'full', steps: 'true', geometries: 'geojson', annotations: 'true' }).toString()
  console.info('[OSRM] Route request', {
    currentLocation: origin,
    destination,
    osrmCoordinateOrder: 'longitude,latitude',
    url: url.toString(),
  })
  const response = await fetch(url)
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    console.error('[OSRM] Route request failed', { status: response.status, body, url: url.toString() })
    throw new Error(`OSRM could not calculate this route (${response.status}). Check the selected destination and try again.`)
  }
  const data = (await response.json()) as OsrmResponse
  console.info('[OSRM] Route response', data)
  if (data.code !== 'Ok' || !data.routes?.[0]) throw new Error('No driving route was found for these coordinates.')
  const route = data.routes[0]
  return {
    geometry: route.geometry.coordinates.map(([lng, lat]: [number, number]) => ({ lat, lng })),
    distance: route.distance,
    duration: route.duration,
    fetchedAt: Date.now(),
    steps: route.legs.flatMap((leg) =>
      leg.steps.map((step) => {
        const maneuver: OsrmManeuver = step.maneuver ?? { type: 'continue', location: [origin.lng, origin.lat] }
        const name = step.name || 'Unnamed road'
        return {
          distance: step.distance,
          duration: step.duration,
          name,
          maneuver,
          instruction: formatInstruction(maneuver, name),
          location: { lng: maneuver.location?.[0] ?? origin.lng, lat: maneuver.location?.[1] ?? origin.lat },
        }
      }),
    ),
  }
}

async function searchNominatim(query: string, current: LatLng | null, signal?: AbortSignal): Promise<SearchResult[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  const params: Record<string, string> = {
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '6',
  }
  if (isValidCoordinate(current)) {
    const span = 2.5
    params.viewbox = `${current.lng - span},${current.lat + span},${current.lng + span},${current.lat - span}`
    params.bounded = '0'
  }
  url.search = new URLSearchParams(params).toString()
  console.info('[Nominatim] Search request', { query, currentLocation: current, url: url.toString() })
  const response = await fetch(url, { headers: { Accept: 'application/json' }, signal })
  if (!response.ok) throw new Error('Destination search is unavailable.')
  const data = (await response.json()) as NominatimItem[]
  console.info('[Nominatim] Search response', data)
  return data
    .map((item) => ({
    id: String(item.place_id),
    name: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon),
    type: item.type || item.class || 'place',
    }))
    .filter((item) => {
      const valid = isValidCoordinate(item)
      if (!valid) console.warn('[Nominatim] Invalid result dropped', item)
      return valid
    })
}

function MapFollower({ position, enabled }: { position: LatLng | null; enabled: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (position && enabled) map.setView([position.lat, position.lng], Math.max(map.getZoom(), 16), { animate: true })
  }, [enabled, map, position])
  return null
}

function MapEvents({ onUserMove }: { onUserMove: () => void }) {
  useMapEvents({ dragstart: onUserMove, zoomstart: onUserMove })
  return null
}

function MapControls({ dark, onDarkToggle, onRecenter }: { dark: boolean; onDarkToggle: () => void; onRecenter: () => void }) {
  const map = useMap()
  const controls = [
    { label: 'Zoom in', icon: Plus, onClick: () => map.zoomIn() },
    { label: 'Zoom out', icon: Minus, onClick: () => map.zoomOut() },
    { label: 'Compass', icon: Compass, onClick: () => map.setView(map.getCenter(), map.getZoom(), { animate: true }) },
    { label: 'Current location', icon: LocateFixed, onClick: onRecenter },
    { label: dark ? 'Light map' : 'Dark map', icon: dark ? CloudRain : Zap, onClick: onDarkToggle },
  ]
  return (
    <div className="absolute right-3 top-24 z-[900] flex flex-col gap-2">
      {controls.map(({ label, icon: Icon, onClick }) => (
        <button key={label} type="button" title={label} aria-label={label} onClick={onClick} className="nav-icon-button">
          <Icon size={18} />
        </button>
      ))}
    </div>
  )
}

function SearchBox({
  value,
  results,
  loading,
  error,
  onChange,
  onSelect,
}: {
  value: string
  results: SearchResult[]
  loading: boolean
  error: string | null
  onChange: (value: string) => void
  onSelect: (result: SearchResult) => void
}) {
  return (
    <div className="absolute left-3 right-3 top-3 z-[910] sm:left-4 sm:right-auto sm:w-[430px]">
      <div className="nav-glass p-3">
        <div className="flex items-center gap-2">
          <Search size={18} className="text-[#1a73e8]" />
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Search city, station, airport, college, landmark"
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#202124] outline-none placeholder:text-[#80868b]"
          />
          {value && (
            <button type="button" aria-label="Clear search" onClick={() => onChange('')} className="rounded-full p-1 text-[#5f6368] hover:bg-[#f1f3f4]">
              <X size={16} />
            </button>
          )}
        </div>
        {(loading || error || results.length > 0) && (
          <div className="mt-3 max-h-72 overflow-y-auto border-t border-[#e0e0e0] pt-2">
            {loading && <p className="px-2 py-2 text-sm text-[#5f6368]">Searching places...</p>}
            {error && <p className="px-2 py-2 text-sm text-[#d93025]">{error}</p>}
            {results.map((result) => (
              <button key={result.id} type="button" onClick={() => onSelect(result)} className="flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left hover:bg-[#f8fafd]">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#ea4335]" />
                <span className="min-w-0">
                  <span className="line-clamp-2 text-sm font-medium text-[#202124]">{result.name}</span>
                  <span className="text-xs capitalize text-[#5f6368]">{result.type}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function InstructionCard({ step, nextStep, etaSeconds, remaining }: { step: RouteStep | null; nextStep: RouteStep | null; etaSeconds: number | null; remaining: number | null }) {
  if (!step) return null
  return (
    <div className="absolute left-3 right-3 top-24 z-[905] sm:left-4 sm:right-auto sm:w-[430px]">
      <div className="nav-glass nav-card-enter p-4">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1a73e8] text-white">
            <InstructionGlyph step={step} size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold leading-tight text-[#202124]">{step.instruction}</p>
            <p className="mt-1 text-sm text-[#5f6368]">After {formatDistance(step.distance)}{step.name ? ` on ${step.name}` : ''}</p>
            {nextStep && <p className="mt-2 truncate text-xs font-medium text-[#1a73e8]">Next: {nextStep.instruction}</p>}
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[#3c4043]">
              <span className="rounded-full bg-[#e8f0fe] px-2 py-1">ETA {formatDuration(etaSeconds)}</span>
              <span className="rounded-full bg-[#e6f4ea] px-2 py-1">{formatDistance(remaining)} left</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DirectionsPanel({ open, steps, onToggle }: { open: boolean; steps: RouteStep[]; onToggle: () => void }) {
  return (
    <div className="absolute bottom-32 right-3 z-[905] hidden w-80 lg:block">
      <div className="nav-glass overflow-hidden">
        <button type="button" onClick={onToggle} className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-[#202124]">
          Navigation Steps
          {open ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
        {open && (
          <div className="max-h-[360px] overflow-y-auto border-t border-[#e0e0e0] p-2">
            {steps.map((step, index) => {
              return (
                <div key={`${step.instruction}-${index}`} className="flex gap-3 rounded-lg p-2 hover:bg-[#f8fafd]">
                  <span className="mt-0.5 shrink-0 text-[#1a73e8]"><InstructionGlyph step={step} size={17} /></span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#202124]">{step.instruction}</p>
                    <p className="text-xs text-[#5f6368]">{formatDistance(step.distance)} · {step.name}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function JourneyPanel({ speed, remaining, etaSeconds, progress, environment }: { speed: number | null; remaining: number | null; etaSeconds: number | null; progress: number; environment: EnvironmentAnalyzeResponse | null }) {
  const trafficDelay = environment?.traffic.delayMinutes ?? 0
  return (
    <div className="absolute bottom-32 left-4 z-[905] hidden w-72 xl:block">
      <div className="nav-glass p-4">
        <p className="text-xs font-bold uppercase text-[#5f6368]">Live Journey</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Metric label="Speed" value={speed != null ? `${speed} km/h` : '--'} />
          <Metric label="ETA" value={formatDuration(etaSeconds)} />
          <Metric label="Remaining" value={formatDistance(remaining)} />
          <Metric label="Arrival" value={arrivalTime(etaSeconds)} />
          <Metric label="Delay" value={`${trafficDelay} min`} />
          <Metric label="Carbon Saved" value={`${Math.max(0.2, (progress / 100) * 1.8).toFixed(1)} kg`} />
        </div>
        <div className="mt-4 h-2 rounded-full bg-[#e8eaed]">
          <div className="h-full rounded-full bg-[#34a853] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-[#5f6368]">{label}</p>
      <p className="text-sm font-semibold text-[#202124]">{value}</p>
    </div>
  )
}

function AiAssistant({ environment, error }: { environment: EnvironmentAnalyzeResponse | null; error: string | null }) {
  const recommendation = environment?.recommendation
  const suggestions = [
    environment?.traffic.level ? `Traffic ahead is ${environment.traffic.level.toLowerCase()} with ${environment.traffic.delayMinutes} min delay.` : null,
    environment?.weather.condition ? `${environment.weather.condition}; wind ${environment.weather.windSpeed} km/h and humidity ${environment.weather.humidity}%.` : null,
    recommendation?.recommendedTransport ? `${recommendation.recommendedTransport} recommended: ${recommendation.reason}` : null,
    environment?.traffic.averageSpeed ? `Average road speed is ${environment.traffic.averageSpeed} km/h.` : null,
  ].filter(Boolean)
  const maybeBooking = recommendation?.recommendedTransport && /cab|train|bus|metro/i.test(recommendation.recommendedTransport)

  return (
    <div className="absolute right-3 top-[330px] z-[905] hidden w-80 lg:block">
      <div className="nav-glass p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f0fe] text-[#1a73e8]">
            <Bot size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#202124]">AI Assistant</p>
            <p className="text-xs text-[#5f6368]">Weather, traffic and transit agents</p>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {error && <p className="rounded-lg bg-[#fce8e6] px-3 py-2 text-sm text-[#d93025]">{error}</p>}
          {!error && suggestions.length === 0 && <p className="text-sm text-[#5f6368]">Agent recommendations appear after a route is selected.</p>}
          {suggestions.map((suggestion) => (
            <p key={suggestion} className="rounded-lg bg-[#f8fafd] px-3 py-2 text-sm text-[#3c4043]">{suggestion}</p>
          ))}
        </div>
        {maybeBooking && (
          <button type="button" className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1a73e8] px-3 py-2 text-sm font-semibold text-white">
            {/train|metro/i.test(recommendation.recommendedTransport) ? <Train size={16} /> : /bus/i.test(recommendation.recommendedTransport) ? <Bus size={16} /> : <Car size={16} />}
            Book Now
          </button>
        )}
      </div>
    </div>
  )
}

function BottomCard({ speed, remaining, etaSeconds, progress }: { speed: number | null; remaining: number | null; etaSeconds: number | null; progress: number }) {
  return (
    <div className="absolute bottom-3 left-3 right-3 z-[906]">
      <div className="nav-glass mx-auto max-w-3xl p-3">
        <div className="grid grid-cols-4 gap-2 text-center">
          <Metric label="Speed" value={speed != null ? `${speed} km/h` : '--'} />
          <Metric label="Remaining" value={formatDistance(remaining)} />
          <Metric label="ETA" value={formatDuration(etaSeconds)} />
          <Metric label="Arrival" value={arrivalTime(etaSeconds)} />
        </div>
        <div className="mt-3 h-2 rounded-full bg-[#e8eaed]">
          <div className="h-full rounded-full bg-[#1a73e8] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}

function Snackbar({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3200)
    return () => window.clearTimeout(timer)
  }, [onClose])
  return <div className="snackbar-enter absolute left-1/2 top-5 z-[999] -translate-x-1/2 rounded-full bg-[#202124] px-4 py-2 text-sm font-semibold text-white shadow-xl">{message}</div>
}

export function MapPage() {
  const [current, setCurrent] = useState<LatLng | null>(null)
  const [destination, setDestination] = useState<SearchResult | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [route, setRoute] = useState<RouteData | null>(null)
  const [routeError, setRouteError] = useState<string | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [speed, setSpeed] = useState<number | null>(null)
  const [autoFollow, setAutoFollow] = useState(true)
  const [directionsOpen, setDirectionsOpen] = useState(true)
  const [darkMap, setDarkMap] = useState(false)
  const [environment, setEnvironment] = useState<EnvironmentAnalyzeResponse | null>(null)
  const [agentError, setAgentError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [arrived, setArrived] = useState(false)
  const previousPosition = useRef<LatLng | null>(null)
  const previousTime = useRef<number | null>(null)
  const rerouteAt = useRef(0)
  const agentFetchAt = useRef(0)
  const routedDestination = useRef<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      window.setTimeout(() => setGeoError('GPS is not supported in this browser.'), 0)
      return
    }
    const watch = navigator.geolocation.watchPosition(
      (position) => {
        const next = { lat: position.coords.latitude, lng: position.coords.longitude }
        const now = Date.now()
        setCurrent(next)
        setGeoError(null)
        if (position.coords.speed != null && position.coords.speed >= 0) {
          setSpeed(Math.round(position.coords.speed * 3.6))
        } else if (previousPosition.current && previousTime.current) {
          const meters = haversineMeters(previousPosition.current, next)
          const seconds = Math.max(1, (now - previousTime.current) / 1000)
          setSpeed(Math.round((meters / seconds) * 3.6))
        }
        previousPosition.current = next
        previousTime.current = now
      },
      (error) => setGeoError(error.message || 'Location permission was denied.'),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 1500 },
    )
    return () => navigator.geolocation.clearWatch(watch)
  }, [])

  useEffect(() => {
    if (query.trim().length < 3) {
      window.setTimeout(() => {
        setResults([])
        setSearchError(null)
      }, 0)
      return
    }
    const controller = new AbortController()
    window.setTimeout(() => setSearching(true), 0)
    const timer = window.setTimeout(() => {
      searchNominatim(query, current, controller.signal)
        .then((items) => {
          if (!controller.signal.aborted) {
            setResults(items)
            setSearchError(items.length ? null : 'Destination not found.')
          }
        })
        .catch((error: Error) => !controller.signal.aborted && setSearchError(error.message))
        .finally(() => !controller.signal.aborted && setSearching(false))
    }, 450)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [current, query])

  const calculateRoute = useCallback(async (origin: LatLng, target: LatLng, reroute = false) => {
    setRouteError(null)
    try {
      console.info('[MapPage] Calculating route', { currentLocation: origin, destination: target })
      const nextRoute = await fetchRoute(origin, target)
      setRoute(nextRoute)
      setArrived(false)
      setToast(reroute ? 'Route updated.' : 'Navigation started.')
    } catch (error) {
      console.error('[MapPage] Route calculation exception', error)
      setRouteError(error instanceof Error ? error.message : 'Route calculation failed.')
    }
  }, [])

  useEffect(() => {
    if (!current || !destination) return
    if (routedDestination.current === destination.id) return
    routedDestination.current = destination.id
    window.setTimeout(() => calculateRoute(current, destination), 0)
  }, [calculateRoute, current, destination])

  useEffect(() => {
    if (!current || !destination) return
    if (Date.now() - agentFetchAt.current < 60_000 && environment) return
    agentFetchAt.current = Date.now()
    const payload = { origin: current, destination: { lat: destination.lat, lng: destination.lng }, departureTime: new Date().toISOString() }
    console.info('[MapPage] Backend environment request body', payload)
    analyzeEnvironment(payload)
      .then((data) => {
        console.info('[MapPage] Backend environment response', data)
        setEnvironment(data)
        setAgentError(null)
      })
      .catch((error: Error) => {
        console.error('[MapPage] Backend environment exception', error)
        setAgentError(error.message)
      })
  }, [current, destination, environment])

  const progress = useMemo(() => (current && route ? routeProgress(route.geometry, current) : null), [current, route])
  const remaining = progress?.remaining ?? null
  const progressPercent = progress && progress.total ? Math.min(100, Math.max(0, (progress.completed / progress.total) * 100)) : 0
  const etaSeconds = route && progress ? Math.max(60, (progress.remaining / route.distance) * route.duration + (environment?.traffic.delayMinutes ?? 0) * 60) : null
  const completedPath = route && progress ? route.geometry.slice(0, Math.max(2, progress.closestIndex + 1)) : []
  const upcomingPath = route && progress ? route.geometry.slice(Math.max(0, progress.closestIndex)) : route?.geometry ?? []
  const currentStep = useMemo(() => {
    if (!route || !progress) return null
    let nearest = 0
    route.steps.forEach((step, index) => {
      if (haversineMeters(current ?? step.location, step.location) < haversineMeters(current ?? step.location, route.steps[nearest].location)) nearest = index
    })
    return route.steps[nearest] ?? route.steps[0] ?? null
  }, [current, progress, route])
  const nextStep = route && currentStep ? route.steps[route.steps.indexOf(currentStep) + 1] ?? null : null

  useEffect(() => {
    if (!current || !destination || !route || arrived || !progress) return
    if (haversineMeters(current, destination) <= 25) {
      window.setTimeout(() => {
        setArrived(true)
        setToast('You have arrived.')
      }, 0)
      return
    }
    if (progress.offRoute > 40 && Date.now() - rerouteAt.current > 15_000) {
      rerouteAt.current = Date.now()
      calculateRoute(current, destination, true)
    }
  }, [arrived, calculateRoute, current, destination, progress, route])

  const selectDestination = (result: SearchResult) => {
    if (!isValidCoordinate(result)) {
      setSearchError('Selected destination has invalid coordinates.')
      console.error('[MapPage] Invalid destination selection blocked', result)
      return
    }
    console.info('[MapPage] Destination selected', {
      name: result.name,
      destination: { lat: result.lat, lng: result.lng },
      nominatimCoordinateOrder: 'lat,lon parsed to frontend {lat,lng}',
    })
    setDestination(result)
    setQuery(result.name)
    setResults([])
    setRoute(null)
    setEnvironment(null)
    routedDestination.current = null
  }

  return (
    <div className="relative min-h-[calc(100vh-6rem)] overflow-hidden rounded-xl border border-[#dfe3ea] bg-[#dfe6ee] shadow-sm">
      <MapContainer center={current ? [current.lat, current.lng] : [20.5937, 78.9629]} zoom={current ? 16 : 5} scrollWheelZoom dragging className={`navigation-map ${darkMap ? 'navigation-map-dark' : ''}`}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' maxZoom={19} />
        <MapEvents onUserMove={() => setAutoFollow(false)} />
        <MapFollower position={current} enabled={autoFollow && !arrived} />
        {route && upcomingPath.length > 1 && !arrived && <Polyline positions={upcomingPath.map((p) => [p.lat, p.lng])} pathOptions={{ color: '#ffffff', weight: 10, opacity: 0.95 }} />}
        {route && upcomingPath.length > 1 && !arrived && <Polyline positions={upcomingPath.map((p) => [p.lat, p.lng])} pathOptions={{ color: '#1a73e8', weight: 6, opacity: 0.95 }} />}
        {completedPath.length > 1 && <Polyline positions={completedPath.map((p) => [p.lat, p.lng])} pathOptions={{ color: '#34a853', weight: 6, opacity: 0.95 }} />}
        {route?.steps.filter((_, index) => index > 0 && index % 4 === 0).map((step) => <Marker key={`${step.location.lat}-${step.location.lng}`} position={[step.location.lat, step.location.lng]} icon={waypointIcon} />)}
        {current && <Marker position={[current.lat, current.lng]} icon={userIcon} />}
        {destination && <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}><Popup>{destination.name}</Popup></Marker>}
        <MapControls dark={darkMap} onDarkToggle={() => setDarkMap((value) => !value)} onRecenter={() => setAutoFollow(true)} />
      </MapContainer>

      <SearchBox value={query} results={results} loading={searching} error={searchError} onChange={setQuery} onSelect={selectDestination} />
      <InstructionCard step={arrived ? { instruction: 'You have arrived', distance: 0, duration: 0, name: destination?.name ?? 'Destination', maneuver: { type: 'arrive' }, location: current ?? { lat: 0, lng: 0 } } : currentStep} nextStep={nextStep} etaSeconds={etaSeconds} remaining={remaining} />
      <JourneyPanel speed={speed} remaining={remaining} etaSeconds={etaSeconds} progress={progressPercent} environment={environment} />
      <DirectionsPanel open={directionsOpen} steps={route?.steps ?? []} onToggle={() => setDirectionsOpen((value) => !value)} />
      <AiAssistant environment={environment} error={agentError} />
      <BottomCard speed={speed} remaining={remaining} etaSeconds={etaSeconds} progress={progressPercent} />

      {!autoFollow && current && (
        <button type="button" onClick={() => setAutoFollow(true)} className="absolute left-1/2 top-[178px] z-[907] flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1a73e8] shadow-lg">
          <RotateCcw size={16} /> Re-center
        </button>
      )}
      {(geoError || routeError) && (
        <div className="absolute left-3 right-3 top-[178px] z-[908] mx-auto flex max-w-xl items-center gap-2 rounded-xl border border-[#f5c6c2] bg-white px-4 py-3 text-sm text-[#d93025] shadow-lg">
          <AlertTriangle size={17} /> {geoError || routeError}
        </div>
      )}
      {toast && <Snackbar message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
