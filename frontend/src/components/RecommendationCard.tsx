import { motion } from 'framer-motion'
import { Bike, Footprints, Sparkles, TrainFront } from 'lucide-react'
import type { TravelImpact } from '../services/environmentService'
import { GlassCard } from './ui/GlassCard'

type RecommendationCardProps = {
  recommendation?: TravelImpact
  loading?: boolean
}

function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-white/10 ${className}`} />
}

export function RecommendationCard({ recommendation, loading = false }: RecommendationCardProps) {
  const transport = recommendation?.recommendedTransport ?? 'Awaiting Route'
  const TransportIcon = transport.toLowerCase().includes('bike') ? Bike : TrainFront

  return (
    <GlassCard className="h-full p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Recommendation</p>
          {loading ? <SkeletonLine className="mt-3 h-8 w-36" /> : <h3 className="mt-2 text-[26px] font-semibold text-white">{transport}</h3>}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
          <Sparkles size={21} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <SkeletonLine className="h-14 w-full rounded-[18px]" />
          <SkeletonLine className="h-20 w-full rounded-[18px]" />
        </div>
      ) : recommendation ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-3 rounded-[22px] border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-200">
            <TransportIcon size={20} />
            <p className="text-3xl font-bold text-white">{recommendation.recommendedTransport}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-center gap-2 text-sm text-slate-400"><Footprints size={15} /> Walking</div>
              <p className="mt-2 text-xl font-bold text-white">{recommendation.walkingComfort}</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-center gap-2 text-sm text-slate-400"><Bike size={15} /> Bike</div>
              <p className="mt-2 text-xl font-bold text-white">{recommendation.bikeComfort}</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-300">{recommendation.reason}</p>
        </motion.div>
      ) : (
        <p className="text-sm leading-6 text-slate-400">UrbanPilot will recommend a mode after checking live route, weather, and traffic.</p>
      )}
    </GlassCard>
  )
}
