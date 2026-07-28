import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle2, MapPinned, Sparkles } from 'lucide-react'
import { MapView } from '../components/map/MapView'
import { RoutePlanner, type TravelPreference } from '../components/map/RoutePlanner'
import { TravelSummary } from '../components/map/TravelSummary'
import type { OsrmRoute, SearchResult } from '../components/map/types'
import { WeatherCard } from '../components/WeatherCard'
import { TrafficCard } from '../components/TrafficCard'
import { RecommendationCard } from '../components/RecommendationCard'
import { GlassCard } from '../components/ui/GlassCard'
import { analyzeEnvironment, type EnvironmentAnalyzeResponse } from '../services/environmentService'

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
      <section className="grid gap-6 lg:grid-cols-12 lg:items-start">

        {/* ── Left panel ── */}
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
            <h1 className="text-[42px] font-bold leading-[1.04] text-white sm:text-[56px] lg:text-[60px]">
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

        {/* ── Right panel ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.08 }}
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

      {/* ── Bottom intelligence cards ── */}
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
    </div>
  )
}
