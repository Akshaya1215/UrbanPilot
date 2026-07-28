import { motion } from 'framer-motion'
import { CloudRain, Droplets, Thermometer, Wind } from 'lucide-react'
import type { WeatherImpact } from '../services/environmentService'
import { GlassCard } from './ui/GlassCard'

type WeatherCardProps = {
  weather?: WeatherImpact
  loading?: boolean
}

function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-white/10 ${className}`} />
}

export function WeatherCard({ weather, loading = false }: WeatherCardProps) {
  return (
    <GlassCard className="h-full p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Weather</p>
          {loading ? <SkeletonLine className="mt-3 h-7 w-28" /> : <h3 className="mt-2 text-[24px] font-semibold text-white">{weather?.condition ?? 'Ready'}</h3>}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
          <CloudRain size={21} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <SkeletonLine className="h-14 w-full rounded-[18px]" />
          <SkeletonLine className="h-14 w-full rounded-[18px]" />
        </div>
      ) : weather ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-center gap-2 text-sm text-slate-400"><Thermometer size={15} /> Temperature</div>
              <p className="mt-2 text-2xl font-bold text-white">{weather.temperature} C</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-center gap-2 text-sm text-slate-400"><Droplets size={15} /> Humidity</div>
              <p className="mt-2 text-2xl font-bold text-white">{weather.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-[20px] border border-white/10 bg-white/[0.045] p-4">
            <div className="flex items-center gap-2 text-sm text-slate-400"><Wind size={15} /> Wind</div>
            <p className="font-bold text-white">{weather.windSpeed} km/h</p>
          </div>
          <p className="text-sm leading-6 text-slate-400">{weather.description ?? weather.condition}</p>
        </motion.div>
      ) : (
        <p className="text-sm leading-6 text-slate-400">Plan a route to load live weather near your starting point.</p>
      )}
    </GlassCard>
  )
}
