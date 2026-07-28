import { motion } from 'framer-motion'
import { Gauge, Timer, TriangleAlert } from 'lucide-react'
import type { TrafficImpact } from '../services/environmentService'
import { GlassCard } from './ui/GlassCard'

type TrafficCardProps = {
  traffic?: TrafficImpact
  loading?: boolean
}

function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-white/10 ${className}`} />
}

export function TrafficCard({ traffic, loading = false }: TrafficCardProps) {
  return (
    <GlassCard className="h-full p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Traffic</p>
          {loading ? <SkeletonLine className="mt-3 h-7 w-24" /> : <h3 className="mt-2 text-[24px] font-semibold text-white">{traffic?.level ?? 'Standby'}</h3>}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
          <Gauge size={21} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <SkeletonLine className="h-14 w-full rounded-[18px]" />
          <SkeletonLine className="h-14 w-full rounded-[18px]" />
        </div>
      ) : traffic ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-center gap-2 text-sm text-slate-400"><Timer size={15} /> Delay</div>
              <p className="mt-2 text-2xl font-bold text-white">{traffic.delayMinutes} min</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-center gap-2 text-sm text-slate-400"><Gauge size={15} /> Avg Speed</div>
              <p className="mt-2 text-2xl font-bold text-white">{traffic.averageSpeed} km/h</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-[20px] border border-white/10 bg-white/[0.045] p-4">
            <div className="flex items-center gap-2 text-sm text-slate-400"><TriangleAlert size={15} /> Incidents</div>
            <p className="font-bold text-white">{traffic.roadIncidents?.length ?? 0}</p>
          </div>
        </motion.div>
      ) : (
        <p className="text-sm leading-6 text-slate-400">Live congestion, delay, and incident signals appear after route search.</p>
      )}
    </GlassCard>
  )
}
