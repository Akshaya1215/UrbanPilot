import { motion } from 'framer-motion'
import { HeartHandshake } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { routeComparison } from '../services/mockData'

export function ComparePage() {
  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[36px] border border-white/10 bg-[rgba(8,12,24,0.82)] p-6 shadow-[0_24px_80px_rgba(2,8,23,0.35)] backdrop-blur-2xl sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Route comparison</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white">Choose the right movement profile</h2>
          </div>
          <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-300">Live pricing context</div>
        </div>
      </motion.section>

      <div className="grid gap-5 lg:grid-cols-2">
        {routeComparison.map((route, index) => (
          <motion.div key={route.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }} whileHover={{ y: -6, scale: 1.01 }}>
            <GlassCard className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[17px] font-semibold text-white">{route.title}</p>
                  <p className="mt-1 text-sm text-slate-400">Adaptive travel recommendation</p>
                </div>
                {route.recommended ? (
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">Recommended</div>
                ) : null}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Cost</p>
                  <p className="mt-1 text-xl font-semibold text-white">{route.cost}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">ETA</p>
                  <p className="mt-1 text-xl font-semibold text-white">{route.eta}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Walking distance</p>
                  <p className="mt-1 text-xl font-semibold text-white">{route.walking}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Transfers</p>
                  <p className="mt-1 text-xl font-semibold text-white">{route.transfers}</p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <HeartHandshake size={16} className="text-violet-300" />
                  <span>Comfort score</span>
                </div>
                <div className="text-xl font-semibold text-white">{route.comfort}/100</div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
