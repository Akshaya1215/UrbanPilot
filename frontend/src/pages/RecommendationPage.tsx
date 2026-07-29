import type { ElementType, ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Bike,
  Bus,
  Car,
  CloudSun,
  Coins,
  Footprints,
  Gauge,
  Leaf,
  MapPinned,
  Route,
  ShieldCheck,
  Sparkles,
  TrainFront,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { GlassCard } from '../components/ui/GlassCard'
import type { BackendRouteOption } from '../services/environmentService'
import { useRouteStore } from '../store/routeStore'

type DisplayRoute = BackendRouteOption & {
  id: string
  transport: string
  modes: string[]
  title: string
  icon: ElementType
  recommended: boolean
}

const bookingFallbacks = [
  { match: /bus/i, url: 'https://www.redbus.in' },
  { match: /train|rail/i, url: 'https://www.irctc.co.in/' },
  { match: /cab|taxi|car/i, url: 'https://www.uber.com/in/en/' },
  { match: /rapido|bike taxi/i, url: 'https://www.rapido.bike/' },
  { match: /metro/i, url: 'https://chennaimetrorail.org/' },
]

const iconMatchers: Array<{ match: RegExp; icon: ElementType }> = [
  { match: /bus/i, icon: Bus },
  { match: /train|rail|metro/i, icon: TrainFront },
  { match: /cab|taxi|car/i, icon: Car },
  { match: /rapido|bike|cycle/i, icon: Bike },
  { match: /walk/i, icon: Footprints },
]

function asText(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && 'status' in value) {
    const status = (value as { status?: unknown }).status
    return typeof status === 'string' && status.trim() ? status : null
  }
  return null
}

function valueOrUnavailable(value: unknown): string {
  return asText(value) ?? ''
}

function formatMeters(meters?: number) {
  if (typeof meters !== 'number' || !Number.isFinite(meters)) return null
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`
}

function formatMinutes(seconds?: number) {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds)) return null
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

function formatRouteMinutes(value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return `${Math.round(value)} min`
}

function formatKilograms(value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return `${value.toFixed(1)} kg CO2`
}

function splitModes(transport: string) {
  const parts = transport.split(/\s*(?:->|,|\+|then)\s*/i).filter(Boolean)
  return parts.length ? parts : [transport]
}

function titleFromRoute(route: BackendRouteOption, fallbackTransport: string) {
  return route.journeyType ?? route.transport ?? fallbackTransport
}

function iconFor(transport: string) {
  return iconMatchers.find((item) => item.match.test(transport))?.icon ?? Route
}

function bookingUrlFor(route: DisplayRoute, tripBookingUrl?: string) {
  if (route.bookingUrl) return route.bookingUrl
  if (tripBookingUrl) return tripBookingUrl
  return bookingFallbacks.find((item) => item.match.test(route.transport))?.url ?? 'https://www.google.com/search?q=public+transport+booking+India'
}

function routeField(route: BackendRouteOption, keys: Array<keyof BackendRouteOption>, fallback?: string | null) {
  for (const key of keys) {
    const value = asText(route[key])
    if (value) return value
  }
  return fallback ?? null
}

function createDisplayRoutes(
  backendRoutes: BackendRouteOption[] | undefined,
  recommendedTransport: string,
): DisplayRoute[] {
  const sourceRoutes = backendRoutes?.length
    ? backendRoutes
    : [{ transport: recommendedTransport }]

  return sourceRoutes.map((route, index) => {
    const transport = route.transport ?? route.journeyType ?? recommendedTransport
    const modes = route.transportSequence?.length ? route.transportSequence : splitModes(transport)
    return {
      ...route,
      id: route.id ?? `${transport}-${index}`,
      transport,
      modes,
      title: titleFromRoute(route, transport),
      icon: iconFor(transport),
      recommended: route.recommended ?? (index === 0 || transport.toLowerCase() === recommendedTransport.toLowerCase()),
    }
  })
}

function Metric({ label, value, icon: Icon }: { label: string; value: ReactNode; icon: ElementType }) {
  return (
    <div className="rounded-lg border border-[#e0e0e0] bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-[#5f6368]">
        <Icon size={14} /> {label}
      </div>
      <div className="text-sm font-semibold text-[#202124]">{value}</div>
    </div>
  )
}

function ModeRail({ modes }: { modes: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {modes.map((mode, index) => (
        <span key={`${mode}-${index}`} className="rounded-full border border-[#d2e3fc] bg-[#f8fbff] px-3 py-1.5 text-xs font-semibold text-[#1a73e8]">
          {mode}
        </span>
      ))}
    </div>
  )
}

function routeDetails(
  route: DisplayRoute,
  weatherImpact: string,
  trafficImpact: string,
  mapDistance: string,
  mapTravelTime: string,
) {
  return [
    { label: 'Transport', icon: Route, value: route.transport },
    { label: 'ETA', icon: BadgeCheck, value: routeField(route, ['eta', 'etaMinutes'], formatRouteMinutes(route.etaMinutes)) },
    { label: 'Distance', icon: MapPinned, value: routeField(route, ['distance', 'distanceMeters'], formatMeters(route.distanceMeters) ?? mapDistance) },
    { label: 'Travel Time', icon: Route, value: routeField(route, ['travelTime'], mapTravelTime) },
    { label: 'Fare', icon: Coins, value: routeField(route, ['fare', 'totalFare']) },
    { label: 'Weather', icon: CloudSun, value: routeField(route, ['weather', 'weatherImpact'], weatherImpact) },
    { label: 'Traffic', icon: Gauge, value: routeField(route, ['traffic', 'trafficImpact'], trafficImpact) },
    { label: 'Walking Distance', icon: Footprints, value: routeField(route, ['walkingDistance', 'walkingDistanceMeters'], formatMeters(route.walkingDistanceMeters)) },
    { label: 'Carbon', icon: Leaf, value: routeField(route, ['carbon', 'carbonEmissionKg'], formatKilograms(route.carbonEmissionKg)) },
    { label: 'Comfort', icon: ShieldCheck, value: routeField(route, ['comfort', 'comfortScore']) },
    { label: 'Availability', icon: ShieldCheck, value: routeField(route, ['availability']) },
    { label: 'Overall Score', icon: Sparkles, value: routeField(route, ['overallScore', 'score']) },
    { label: 'Journey Type', icon: TrainFront, value: route.journeyType },
  ]
}

function compactDetails(
  route: DisplayRoute,
  weatherImpact: string,
  trafficImpact: string,
  mapDistance: string,
  mapTravelTime: string,
) {
  return routeDetails(route, weatherImpact, trafficImpact, mapDistance, mapTravelTime).filter((detail) => asText(detail.value))
}

function formatLegTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function JourneyTimeline({ route }: { route: DisplayRoute }) {
  if (!route.legs?.length) return null
  return (
    <div className="mt-5 rounded-lg border border-[#e0e0e0] bg-[#f8f9fa] p-4">
      <p className="text-xs font-semibold uppercase text-[#5f6368]">Detailed Journey Timeline</p>
      <div className="mt-4 space-y-4">
        {route.legs.map((leg, index) => (
          <div key={`${route.id}-leg-${index}`} className="grid gap-3 border-l-2 border-[#d2e3fc] pl-4 sm:grid-cols-[150px_1fr]">
            <div>
              <p className="text-sm font-semibold text-[#202124]">{leg.transport}</p>
              <p className="text-xs text-[#5f6368]">{formatLegTime(leg.departureTime)} to {formatLegTime(leg.arrivalTime)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-[#202124]">{leg.instruction}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-[#5f6368]">
                <span>{leg.durationMinutes} min</span>
                <span>{formatMeters(leg.distanceMeters)}</span>
                {leg.waitingTimeMinutes ? <span>Wait {leg.waitingTimeMinutes} min</span> : null}
                {leg.stationName ? <span>{leg.stationName}</span> : null}
                {leg.busNumber ? <span>Bus {leg.busNumber}</span> : null}
                {leg.trainNumber ? <span>Train {leg.trainNumber}</span> : null}
                {leg.metroLine ? <span>{leg.metroLine}</span> : null}
                {leg.fare > 0 ? <span>₹{leg.fare}</span> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecommendationRouteCard({
  route,
  weatherImpact,
  trafficImpact,
  mapDistance,
  mapTravelTime,
  bookingUrl,
}: {
  route: DisplayRoute
  weatherImpact: string
  trafficImpact: string
  mapDistance: string
  mapTravelTime: string
  bookingUrl: string
}) {
  const Icon = route.icon
  const details = compactDetails(route, weatherImpact, trafficImpact, mapDistance, mapTravelTime)

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border bg-white p-5 shadow-sm ${route.recommended ? 'border-[#34a853] ring-2 ring-[#34a853]/15' : 'border-[#e0e0e0]'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8f0fe] text-[#1a73e8]">
          <Icon size={20} />
        </div>
        {route.recommended ? <span className="rounded-full bg-[#e6f4ea] px-3 py-1 text-xs font-semibold text-[#188038]">Best Route</span> : null}
      </div>
      <h3 className="mt-4 text-xl font-semibold text-[#202124]">{route.title}</h3>
      <div className="mt-3">
        <ModeRail modes={route.modes} />
      </div>
      {route.reason ? <p className="mt-4 text-sm leading-6 text-[#5f6368]">{route.reason}</p> : null}
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {details.map((detail) => (
          <Metric key={detail.label} label={detail.label} icon={detail.icon} value={valueOrUnavailable(detail.value)} />
        ))}
      </div>
      <JourneyTimeline route={route} />
      <a
        href={bookingUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#202124] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3c4043]"
      >
        Book Now <ArrowUpRight size={16} />
      </a>
    </motion.article>
  )
}

export function RecommendationPage() {
  const trip = useRouteStore((state) => state.currentTrip)

  if (!trip) {
    return (
      <div className="mx-auto max-w-3xl">
        <GlassCard className="p-6 sm:p-8">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fef7e0] text-[#b06000]">
              <AlertTriangle size={21} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase text-[#5f6368]">No trip selected</p>
              <h1 className="mt-2 text-2xl font-semibold text-[#202124]">Plan a route first</h1>
              <p className="mt-2 text-sm leading-6 text-[#5f6368]">
                Start with an origin, destination, departure time, and travel preference to see journey options.
              </p>
              <Link to="/" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1a73e8] px-5 py-2.5 text-sm font-semibold text-white">
                Open Trip Planner <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </GlassCard>
      </div>
    )
  }

  const { environment } = trip
  const recommendedTransport = environment.travelImpact.recommendedTransport
  const routes = createDisplayRoutes(environment.routes, recommendedTransport)
  const best = routes.find((route) => route.recommended) ?? routes[0]
  const BestIcon = best.icon
  const weatherImpact = environment.weather.rain
    ? `${environment.weather.condition}, rain expected`
    : environment.weather.condition
  const trafficImpact = `${environment.traffic.level}, ${environment.traffic.delayMinutes} min delay`
  const mapDistance = formatMeters(trip.route.distanceMeters) ?? ''
  const mapTravelTime = formatMinutes(trip.route.durationSeconds) ?? ''
  const bestBookingUrl = bookingUrlFor(best, environment.bookingUrl)

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-8">
          <div className="h-full rounded-lg border border-[#d2e3fc] bg-white p-6 shadow-[0_18px_60px_rgba(60,64,67,0.14)] sm:p-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ceead6] bg-[#e6f4ea] px-3 py-1.5 text-sm font-semibold text-[#188038]">
              <BadgeCheck size={16} />
              Best Recommendation
            </div>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-[#5f6368]">Journey Options</p>
                <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#202124] sm:text-5xl">{best.title}</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-[#5f6368]">{best.reason ?? environment.travelImpact.reason}</p>
              </div>
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#e8f0fe] text-[#1a73e8]">
                <BestIcon size={28} />
              </div>
            </div>
            <div className="mt-6">
              <ModeRail modes={best.modes} />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {compactDetails(best, weatherImpact, trafficImpact, mapDistance, mapTravelTime).map((detail) => (
                <Metric key={detail.label} label={detail.label} icon={detail.icon} value={valueOrUnavailable(detail.value)} />
              ))}
            </div>
            <JourneyTimeline route={best} />
            <a
              href={bestBookingUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1a73e8] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1557b0]"
            >
              Book Now <ArrowUpRight size={16} />
            </a>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="lg:col-span-4">
          <GlassCard className="h-full p-5">
            <p className="text-sm font-semibold uppercase text-[#5f6368]">Booking</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#202124]">Ready when you are</h2>
            <div className="mt-5 space-y-4">
              <Metric label="Origin" icon={MapPinned} value={trip.origin.display_name} />
              <Metric label="Destination" icon={Route} value={trip.destination.display_name} />
              <Metric label="Preference" icon={Sparkles} value={trip.preference} />
              <Metric label="Departure" icon={BadgeCheck} value={new Date(trip.departureTime).toLocaleString()} />
            </div>
          </GlassCard>
        </motion.div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase text-[#5f6368]">Alternative Routes</p>
          <h2 className="mt-1 text-2xl font-semibold text-[#202124]">Compare your travel choices</h2>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {routes.map((route) => (
            <RecommendationRouteCard
              key={route.id}
              route={route}
              weatherImpact={weatherImpact}
              trafficImpact={trafficImpact}
              mapDistance={mapDistance}
              mapTravelTime={mapTravelTime}
              bookingUrl={bookingUrlFor(route, environment.bookingUrl)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase text-[#5f6368]">Comparison</p>
          <h2 className="mt-1 text-2xl font-semibold text-[#202124]">Route details at a glance</h2>
        </div>
        <div className="overflow-hidden rounded-lg border border-[#e0e0e0] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1040px] w-full border-collapse text-left text-sm">
              <thead className="bg-[#f8f9fa] text-xs uppercase text-[#5f6368]">
                <tr>
                  {['Route', 'ETA', 'Distance', 'Travel Time', 'Fare', 'Walking', 'Weather', 'Traffic', 'Comfort', 'Carbon', 'Availability', 'Overall Score'].map((heading) => (
                    <th key={heading} className="border-b border-[#e0e0e0] px-4 py-3 font-semibold">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr key={route.id} className={route.recommended ? 'bg-[#e6f4ea]' : 'bg-white'}>
                    <td className="border-b border-[#e0e0e0] px-4 py-3 font-semibold text-[#202124]">{route.title}</td>
                    <td className="border-b border-[#e0e0e0] px-4 py-3">{valueOrUnavailable(routeField(route, ['eta', 'etaMinutes'], formatRouteMinutes(route.etaMinutes)))}</td>
                    <td className="border-b border-[#e0e0e0] px-4 py-3">{valueOrUnavailable(routeField(route, ['distance', 'distanceMeters'], formatMeters(route.distanceMeters) ?? mapDistance))}</td>
                    <td className="border-b border-[#e0e0e0] px-4 py-3">{valueOrUnavailable(routeField(route, ['travelTime'], mapTravelTime))}</td>
                    <td className="border-b border-[#e0e0e0] px-4 py-3">{valueOrUnavailable(routeField(route, ['fare', 'totalFare']))}</td>
                    <td className="border-b border-[#e0e0e0] px-4 py-3">{valueOrUnavailable(routeField(route, ['walkingDistance', 'walkingDistanceMeters'], formatMeters(route.walkingDistanceMeters)))}</td>
                    <td className="border-b border-[#e0e0e0] px-4 py-3">{valueOrUnavailable(routeField(route, ['weather', 'weatherImpact'], weatherImpact))}</td>
                    <td className="border-b border-[#e0e0e0] px-4 py-3">{valueOrUnavailable(routeField(route, ['traffic', 'trafficImpact'], trafficImpact))}</td>
                    <td className="border-b border-[#e0e0e0] px-4 py-3">{valueOrUnavailable(routeField(route, ['comfort', 'comfortScore']))}</td>
                    <td className="border-b border-[#e0e0e0] px-4 py-3">{valueOrUnavailable(routeField(route, ['carbon', 'carbonEmissionKg'], formatKilograms(route.carbonEmissionKg)))}</td>
                    <td className="border-b border-[#e0e0e0] px-4 py-3">{valueOrUnavailable(routeField(route, ['availability']))}</td>
                    <td className="border-b border-[#e0e0e0] px-4 py-3">{valueOrUnavailable(routeField(route, ['overallScore', 'score']))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
