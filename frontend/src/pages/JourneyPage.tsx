import { motion } from 'framer-motion'
import { Route, Train, Waypoints } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { TransportBadge } from '../components/ui/TransportBadge'

export function JourneyPage() {
  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[36px] border border-white/10 bg-[rgba(8,12,24,0.82)] p-6 shadow-[0_24px_80px_rgba(2,8,23,0.35)] backdrop-blur-2xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Journey overview</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white">Live journey intelligence</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <TransportBadge label="Live" tone="cyan" />
            <TransportBadge label="ETA synced" tone="violet" />
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Route progress</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Live mobility timeline</h3>
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">On track</div>
          </div>

          <div className="mt-6 space-y-4">
            {[
              { title: 'Pickup confirmed', detail: 'Your vehicle is 2 min away', time: 'Now' },
              { title: 'Metro transfer', detail: 'Northbound line · Platform 4', time: '12 min' },
              { title: 'Arrival window', detail: 'Destination approach in 4 min', time: '24 min' },
            ].map((step) => (
              <div key={step.title} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[15px] font-semibold text-white">{step.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{step.detail}</p>
                  </div>
                  <span className="text-sm text-slate-400">{step.time}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Fare breakdown</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Transparent cost view</h3>
            </div>
            <div className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-sm text-violet-300">Premium</div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-cyan-400/10 p-2 text-cyan-300"><Train size={16} /></div>
                  <div>
                    <p className="text-[15px] font-semibold text-white">Metro</p>
                    <p className="text-sm text-slate-400">Northbound</p>
                  </div>
                </div>
                <p className="font-semibold text-white">₹56</p>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-violet-400/10 p-2 text-violet-300"><Route size={16} /></div>
                  <div>
                    <p className="text-[15px] font-semibold text-white">Rapido</p>
                    <p className="text-sm text-slate-400">Shared ride</p>
                  </div>
                </div>
                <p className="font-semibold text-white">₹86</p>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-amber-400/10 p-2 text-amber-300"><Waypoints size={16} /></div>
                  <div>
                    <p className="text-[15px] font-semibold text-white">Transfers</p>
                    <p className="text-sm text-slate-400">1 interchange</p>
                  </div>
                </div>
                <p className="font-semibold text-white">2 min</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
