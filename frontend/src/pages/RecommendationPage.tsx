import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Clock3, Coins, MapPin, Route } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { Timeline } from '../components/ui/Timeline'
import { journeyTimeline } from '../services/mockData'

export function RecommendationPage() {
  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[36px] border border-white/10 bg-[rgba(8,12,24,0.82)] p-6 shadow-[0_24px_80px_rgba(2,8,23,0.35)] backdrop-blur-2xl sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">
              <BadgeCheck size={16} />
              Best route selected
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Route intelligence</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">Rapido + Metro</h2>
            </div>
            <p className="max-w-xl text-lg leading-8 text-slate-400">
              This route avoids congestion, reduces walking distance and preserves a comfortable commute profile.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-semibold text-white">
                Book Now <ArrowRight size={16} />
              </button>
              <button className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300">Share route</button>
            </div>
          </div>
          <GlassCard className="p-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="text-sm text-slate-400">ETA</p>
                  <p className="mt-1 text-2xl font-semibold text-white">26 min</p>
                </div>
                <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300"><Clock3 size={18} /></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Total fare</p>
                  <p className="mt-2 text-xl font-semibold text-white">₹142</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Money saved</p>
                  <p className="mt-2 text-xl font-semibold text-white">₹182</p>
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Time saved</p>
                    <p className="mt-1 text-xl font-semibold text-white">+8 min</p>
                  </div>
                  <div className="rounded-2xl bg-violet-400/10 p-3 text-violet-300"><Route size={18} /></div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Journey flow</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Vertical timeline</h3>
            </div>
            <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">Optimal</div>
          </div>
          <div className="mt-5"><Timeline items={journeyTimeline} /></div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400">AI explanation</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Why this route wins</h3>
            </div>
            <div className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-sm text-violet-300">Explainable</div>
          </div>
          <div className="mt-5 space-y-4 text-slate-300">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-[15px] leading-7">
                “We recommend this route because it avoids heavy traffic, reduces walking distance and saves ₹182.”
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-cyan-300"><MapPin size={16} /> Live path confidence</div>
                <p className="text-sm text-slate-400">92% confidence based on current signal density.</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-violet-300"><Coins size={16} /> Value score</div>
                <p className="text-sm text-slate-400">Balanced fare-to-time efficiency with premium comfort.</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
