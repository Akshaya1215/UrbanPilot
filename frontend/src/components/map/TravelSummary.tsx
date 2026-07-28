import { motion } from 'framer-motion'
import { Bike, Clock3, Footprints, Gauge, MapPin, Route, Sparkles, Thermometer, Timer, TriangleAlert } from 'lucide-react'
import type { EnvironmentAnalyzeResponse } from '../../services/environmentService'
import { GlassCard } from '../ui/GlassCard'
import type { OsrmRoute } from './types'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-white/10 ${className}`} />
}

function StatTile({ label, value, icon: Icon, tone, loading }: {
  label: string
  value?: string
  icon: React.ElementType
  tone: string
  loading: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          {loading
            ? <Skeleton className="mt-3 h-7 w-24" />
            : <p className="mt-2 text-2xl font-bold text-white">{value ?? '—'}</p>}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${tone}`}>
          <Icon size={18} />
        </div>
      </div>
    </motion.div>
  )
}

type TravelSummaryProps = {
  route: OsrmRoute | null
  environment: EnvironmentAnalyzeResponse | null
  loading: boolean
}

function formatDuration(seconds: number) {
  const m = Math.round(seconds / 60)
  if (m < 60) return `${m} min`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

function formatDistance(meters: number) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`
}

export function TravelSummary({ route, environment, loading }: TravelSummaryProps) {
  const stats = [
    {
      label: 'ETA',
      value: route ? formatDuration(route.durationSeconds) : undefined,
      icon: Clock3,
      tone: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/20',
    },
    {
      label: 'Distance',
      value: route ? formatDistance(route.distanceMeters) : undefined,
      icon: Route,
      tone: 'text-violet-300 bg-violet-400/10 border-violet-400/20',
    },
    {
      label: 'Temperature',
      value: environment ? `${environment.weather.temperature}°C` : undefined,
      icon: Thermometer,
      tone: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
    },
    {
      label: 'Delay',
      value: environment ? `${environment.traffic.delayMinutes} min` : undefined,
      icon: Timer,
      tone: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
    },
    {
      label: 'Avg Speed',
      value: environment ? `${environment.traffic.averageSpeed} km/h` : undefined,
      icon: Gauge,
      tone: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
    },
    {
      label: 'Incidents',
      value: environment ? String(environment.traffic.roadIncidents?.length ?? 0) : undefined,
      icon: TriangleAlert,
      tone: 'text-rose-300 bg-rose-400/10 border-rose-400/20',
    },
  ]

  return (
    <div className="space-y-5">
      <GlassCard className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Live Route Summary</p>
            <h2 className="mt-2 text-[26px] font-semibold text-white">Best route intelligence</h2>
          </div>
          <MapPin className="text-cyan-300" size={22} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((s) => (
            <StatTile key={s.label} label={s.label} value={s.value} icon={s.icon} tone={s.tone} loading={loading} />
          ))}
        </div>
      </GlassCard>

      {(loading || environment) && (
        <GlassCard className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Recommendation</p>
              {loading
                ? <Skeleton className="mt-3 h-8 w-40" />
                : <h2 className="mt-2 text-[26px] font-semibold text-white">{environment?.recommendation.recommendedTransport}</h2>}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
              <Sparkles size={20} />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full rounded-[18px]" />
              <Skeleton className="h-14 w-full rounded-[18px]" />
            </div>
          ) : environment ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400"><Footprints size={15} /> Walking Comfort</div>
                  <p className="mt-2 text-xl font-bold text-white">{environment.recommendation.walkingComfort}</p>
                </div>
                <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400"><Bike size={15} /> Bike Comfort</div>
                  <p className="mt-2 text-xl font-bold text-white">{environment.recommendation.bikeComfort}</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-300">{environment.recommendation.reason}</p>
            </motion.div>
          ) : null}
        </GlassCard>
      )}
    </div>
  )
}
