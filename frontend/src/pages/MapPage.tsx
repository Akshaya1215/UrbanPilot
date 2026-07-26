import { motion } from 'framer-motion'
import { MapPin, Train, Zap } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'

export function MapPage() {
  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[36px] border border-white/10 bg-[rgba(8,12,24,0.82)] p-6 shadow-[0_24px_80px_rgba(2,8,23,0.35)] backdrop-blur-2xl sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Live map</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white">Tracked movement across the city</h2>
          </div>
          <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-300">Synced with live lanes</div>
        </div>
      </motion.section>

      <GlassCard className="overflow-hidden p-0">
        <div className="relative min-h-[540px] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.16),_transparent_24%),linear-gradient(135deg,_rgba(17,25,40,0.95),_rgba(2,6,23,0.94))]">
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:36px_36px]" />
          <motion.div initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4 }} className="absolute left-[12%] top-[24%] h-[2px] w-[66%] origin-left rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-transparent" />
          <motion.div initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6 }} className="absolute left-[28%] top-[40%] h-[2px] w-[42%] origin-left rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-transparent" />
          <div className="absolute left-[18%] top-[22%] rounded-full border border-cyan-400/30 bg-cyan-400/10 p-3 text-cyan-300">
            <MapPin size={18} />
          </div>
          <div className="absolute right-[20%] top-[38%] rounded-full border border-violet-400/30 bg-violet-400/10 p-3 text-violet-300">
            <MapPin size={18} />
          </div>
          <div className="absolute left-[38%] top-[30%] rounded-full border border-emerald-400/30 bg-emerald-400/10 p-3 text-emerald-300">
            <Train size={18} />
          </div>
          <motion.div animate={{ x: [0, 24, 0], y: [0, -14, 0] }} transition={{ duration: 2.6, repeat: Infinity }} className="absolute inset-x-[30%] top-[42%] rounded-full border border-amber-400/30 bg-amber-400/10 p-3 text-amber-300">
            <Zap size={16} />
          </motion.div>
        </div>
      </GlassCard>
    </div>
  )
}
