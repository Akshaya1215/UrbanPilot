import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  MapPin,
  MapPinned,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { MapView } from '../components/map/MapView'
import { RoutePlanner, type TravelPreference } from '../components/map/RoutePlanner'
import { TravelSummary } from '../components/map/TravelSummary'
import type { OsrmRoute, SearchResult } from '../components/map/types'
import { RecommendationCard } from '../components/RecommendationCard'
import { TrafficCard } from '../components/TrafficCard'
import { GlassCard } from '../components/ui/GlassCard'
import { JourneyCard } from '../components/ui/JourneyCard'
import { WeatherCard } from '../components/WeatherCard'
import { analyzeEnvironment, type EnvironmentAnalyzeResponse } from '../services/environmentService'
import { recentTrips, savedPlaces, trafficOverview } from '../services/mockData'

// ─── Animated status banner (error / success) ─────────────────────────────────

function StatusBanner({ type, message }: { type: 'error' | 'success'; message: string }) {
  const isError = type === 'error'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
    >
      <GlassCard
        className={`p-4 ${isError ? 'border-rose-400/20 bg-rose-400/[0.04]' : 'border-emerald-400/20 bg-emerald-400/[0.04]'}`}
      >
        <div className="flex gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
              isError
                ? 'border-rose-400/25 bg-rose-400/10 text-rose-300'
                : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
            }`}
          >
            {isError ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {isError ? 'Route intelligence unavailable' : 'Analysis complete'}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-400">{message}</p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function HomePage() {
  const [origin, setOrigin] = useState<SearchResult | null>(null)
  const [destination, setDestination] = useState<SearchResult | null>(null)
  const [route, setRoute] = useState<OsrmRoute | null>(null)
  const [environment, setEnvironment] = useState<EnvironmentAnalyzeResponse | null>(null)
  const [activePreference, setActivePreference] = useState<TravelPreference>('Balanced')
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleRouteReady = async (
    org: SearchResult,
    dest: SearchResult,
    osrmRoute: OsrmRoute,
    preference: TravelPreference,
    departureTime: string,
  ) => {
    // Commit map state immediately so the route draws while backend loads
    setOrigin(org)
    setDestination(dest)
    setRoute(osrmRoute)
    setActivePreference(preference)
    setEnvironment(null)
    setError(null)
    setSuccessMsg(null)
    setAnalyzing(true)

    try {
      const result = await analyzeEnvironment({
        origin: { lat: org.lat, lng: org.lon },
        destination: { lat: dest.lat, lng: dest.lon },
        departureTime: new Date(departureTime).toISOString(),
      })
      setEnvironment(result)
      setSuccessMsg(`Route analyzed — ${result.recommendation.recommendedTransport} recommended.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Environmental analysis failed.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-8">

      {/* ── Section 1: Live route planner — OSM map + OSRM + backend AI ── */}
      <section className="grid gap-6 lg:grid-cols-12 lg:items-start">

        {/* Left panel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 lg:col-span-5"
        >
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-300">
              <Sparkles size={16} />
              Live multimodal routing
            </div>
            <h1 className="text-[36px] font-bold leading-[1.08] text-white sm:text-[44px] lg:text-[48px]">
              Plan the route the city is giving you now.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-400">
              Search real places via OpenStreetMap, calculate live driving directions, then let UrbanPilot score the route with weather, traffic, and transport intelligence.
            </p>
          </div>

          <RoutePlanner
            analyzing={analyzing}
            onRouteReady={handleRouteReady}
            onError={(msg) => { setError(msg); setSuccessMsg(null) }}
          />

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/25 bg-violet-400/10 text-violet-300">
                <MapPinned size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Preference: {activePreference}</p>
                <p className="text-sm text-slate-400">
                  Powered by OpenStreetMap · Nominatim · OSRM · UrbanPilot AI
                </p>
              </div>
            </div>
          </GlassCard>

          <AnimatePresence mode="wait">
            {error && <StatusBanner key="error" type="error" message={error} />}
            {!error && successMsg && <StatusBanner key="success" type="success" message={successMsg} />}
          </AnimatePresence>
        </motion.div>

        {/* Right panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.06 }}
          className="space-y-5 lg:col-span-7"
        >
          <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[#0B1120]/70 shadow-[0_32px_120px_rgba(2,8,23,0.48)] backdrop-blur-2xl">
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

      {/* ── Section 2: Live backend intelligence cards (conditional) ── */}
      <AnimatePresence>
        {(analyzing || environment) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="grid gap-6 lg:grid-cols-3"
          >
            <WeatherCard weather={environment?.weather} loading={analyzing} />
            <TrafficCard traffic={environment?.traffic} loading={analyzing} />
            <RecommendationCard recommendation={environment?.recommendation} loading={analyzing} />
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Section 3: Dashboard — recent journeys + pinned places + traffic ── */}
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Memory Layer</p>
              <h2 className="mt-2 text-[34px] font-semibold text-white sm:text-[40px]">Recent intelligent journeys</h2>
            </div>
            <Link to="/history" className="hidden text-sm font-semibold text-cyan-300 sm:block">
              View history
            </Link>
          </div>
          <div className="space-y-3">
            {recentTrips.map((trip) => (
              <JourneyCard key={trip.id} title={trip.title} subtitle={trip.mode} savings={trip.savings} eta={trip.time} />
            ))}
          </div>
        </div>

        <div className="space-y-5 lg:col-span-5">
          <GlassCard className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[22px] font-semibold text-white">Pinned locations</h3>
              <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-sm text-slate-400">
                3 active
              </span>
            </div>
            <div className="space-y-3">
              {savedPlaces.map((place) => (
                <div key={place.id} className="flex items-center justify-between rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-cyan-400/10 p-2 text-cyan-300">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{place.label}</p>
                      <p className="text-sm text-slate-400">{place.detail}</p>
                    </div>
                  </div>
                  <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300 sm:block">
                    {place.signal}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-[22px] font-semibold text-white">Traffic intelligence</h3>
              <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-sm text-amber-300">
                Live
              </span>
            </div>
            <div className="space-y-4">
              {trafficOverview.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-semibold text-white">{item.value}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/8">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 0.9 }}
                      className="h-2.5 rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-emerald-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

    </div>
  )
}
