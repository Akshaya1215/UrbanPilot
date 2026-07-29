import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Bus, CheckCircle2, CloudSun, Gauge, Loader2, MapPinned, Navigation, Route, TrainFront } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MapView } from '../components/map/MapView'
import { RoutePlanner } from '../components/map/RoutePlanner'
import { TravelSummary } from '../components/map/TravelSummary'
import type { OsrmRoute, SearchResult } from '../components/map/types'
import { GlassCard } from '../components/ui/GlassCard'
import {
  analyzeEnvironment,
  type EnvironmentAnalyzeResponse,
  type TravelPreference,
} from '../services/environmentService'
import { useRouteStore } from '../store/routeStore'

const loadingSteps = [
  { label: 'Analyzing Weather', icon: CloudSun },
  { label: 'Analyzing Traffic', icon: Gauge },
  { label: 'Bus Search', icon: Bus },
  { label: 'Train Search', icon: TrainFront },
  { label: 'Metro Search', icon: Navigation },
  { label: 'Fare Comparison', icon: CheckCircle2 },
  { label: 'Journey Optimization', icon: Route },
]

function StatusBanner({ message }: { message: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
      <div className="flex gap-3 rounded-xl border border-[#f5c6c2] bg-[#fce8e6] p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ea4335]/10 text-[#ea4335]">
          <AlertTriangle size={16} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#202124]">Route unavailable</p>
          <p className="mt-0.5 text-sm text-[#5f6368]">{message}</p>
        </div>
      </div>
    </motion.div>
  )
}

function FullScreenLoading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-white/86 px-5 backdrop-blur-xl"
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        className="w-full max-w-xl rounded-2xl border border-[#d2e3fc] bg-white p-6 shadow-[0_24px_90px_rgba(60,64,67,0.18)] sm:p-8"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f0fe] text-[#1a73e8]">
          <Loader2 className="animate-spin" size={30} />
        </div>
        <div className="mt-5 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#1a73e8]">UrbanPilot AI</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#202124]">Preparing your journey options</h2>
        </div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#e8eaed]">
          <motion.div
            className="h-full rounded-full bg-[#1a73e8]"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </div>
        <div className="mt-6 space-y-3">
          {loadingSteps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0.35, x: -8 }}
                animate={{ opacity: [0.35, 1, 0.72], x: 0 }}
                transition={{ delay: index * 0.22, duration: 0.65, repeat: Infinity, repeatDelay: 1.15 }}
                className="flex items-center gap-3 rounded-xl border border-[#e0e0e0] bg-[#f8f9fa] px-4 py-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1a73e8] shadow-sm">
                  <Icon size={17} />
                </div>
                <span className="text-sm font-semibold text-[#202124]">{step.label}</span>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

function minimumDelay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function RoutePreviewOverlay({ destinationName, environment }: { destinationName: string; environment: EnvironmentAnalyzeResponse | null }) {
  const bestRoute = environment?.routes?.[0]
  const transferLabels = bestRoute?.legs
    ?.map((leg) => leg.stationName ?? leg.transport)
    .filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index)
    .slice(0, 4) ?? []

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="pointer-events-none fixed bottom-8 left-1/2 z-[10000] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-xl border border-[#d2e3fc] bg-white/95 p-4 shadow-[0_18px_60px_rgba(60,64,67,0.18)] backdrop-blur"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-[#1a73e8]">Drawing Complete Route</p>
      <div className="mt-3 flex items-center gap-3">
        <span className="h-3 w-3 rounded-full bg-[#34a853]" />
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#e8eaed]">
          <motion.div
            className="h-full rounded-full bg-[#1a73e8]"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3.5, ease: 'easeInOut' }}
          />
        </div>
        <span className="h-3 w-3 rounded-full bg-[#ea4335]" />
      </div>
      <p className="mt-3 text-sm font-semibold text-[#202124]">Origin to {destinationName}</p>
      {bestRoute ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {bestRoute.transportSequence?.map((transport) => (
            <span key={transport} className="rounded-full bg-[#e8f0fe] px-2.5 py-1 text-xs font-semibold text-[#1a73e8]">{transport}</span>
          ))}
          {transferLabels.map((label) => (
            <span key={label} className="rounded-full bg-[#f1f3f4] px-2.5 py-1 text-xs font-semibold text-[#5f6368]">{label}</span>
          ))}
        </div>
      ) : null}
    </motion.div>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const setCurrentTrip = useRouteStore((state) => state.setCurrentTrip)
  const [origin, setOrigin] = useState<SearchResult | null>(null)
  const [destination, setDestination] = useState<SearchResult | null>(null)
  const [route, setRoute] = useState<OsrmRoute | null>(null)
  const [environment, setEnvironment] = useState<EnvironmentAnalyzeResponse | null>(null)
  const [activePreference, setActivePreference] = useState<TravelPreference>('Balanced')
  const [analyzing, setAnalyzing] = useState(false)
  const [previewingRoute, setPreviewingRoute] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRouteReady = async (
    org: SearchResult,
    dest: SearchResult,
    osrmRoute: OsrmRoute,
    preference: TravelPreference,
    departureTime: string,
  ) => {
    setOrigin(org)
    setDestination(dest)
    setRoute(osrmRoute)
    setActivePreference(preference)
    setEnvironment(null)
    setError(null)
    setAnalyzing(true)

    try {
      const [result] = await Promise.all([
        analyzeEnvironment({
          origin: { lat: org.lat, lng: org.lon },
          destination: { lat: dest.lat, lng: dest.lon },
          departureTime: new Date(departureTime).toISOString(),
          travelPreference: preference,
        }),
        minimumDelay(2_000),
      ])
      setEnvironment(result)
      setCurrentTrip({
        origin: org,
        destination: dest,
        route: osrmRoute,
        preference,
        departureTime,
        environment: result,
      })
      setAnalyzing(false)
      setPreviewingRoute(true)
      await minimumDelay(3_500)
      navigate('/recommendation', { state: { fromPlanner: true } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Environmental analysis failed.')
    } finally {
      setAnalyzing(false)
      setPreviewingRoute(false)
    }
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {analyzing && <FullScreenLoading />}
        {previewingRoute && destination && <RoutePreviewOverlay destinationName={destination.display_name} environment={environment} />}
      </AnimatePresence>

      <section className="grid gap-5 lg:grid-cols-12 lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 lg:col-span-5"
        >
          <div>
            <h1 className="text-2xl font-semibold text-[#202124] sm:text-3xl">
              Plan the route the city is giving you now.
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#5f6368]">
              Choose where you are going, when you leave, and how UrbanPilot should prioritize the journey.
            </p>
          </div>

          <RoutePlanner
            analyzing={analyzing || previewingRoute}
            onRouteReady={handleRouteReady}
            onError={(msg) => setError(msg)}
          />

          <GlassCard className="p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fce8e6] text-[#ea4335]">
                <MapPinned size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#202124]">Preference: {activePreference}</p>
                <p className="text-xs text-[#5f6368]">OpenStreetMap, Nominatim, OSRM, UrbanPilot AI</p>
              </div>
            </div>
          </GlassCard>

          <AnimatePresence mode="wait">
            {!analyzing && error && <StatusBanner key="error" message={error} />}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="space-y-4 lg:col-span-7"
        >
          <div className="overflow-hidden rounded-xl border border-[#e0e0e0] shadow-sm">
            <MapView
              origin={origin}
              destination={destination}
              route={route}
              loading={analyzing}
            />
          </div>

          <TravelSummary route={route} environment={environment} loading={analyzing} />
        </motion.div>
      </section>
    </div>
  )
}
