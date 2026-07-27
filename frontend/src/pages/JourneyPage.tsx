import { motion } from 'framer-motion'
import { Bike, CheckCircle2, CircleDollarSign, Navigation2, ShieldCheck, TrainFront, Waypoints } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GlassCard } from '../components/ui/GlassCard'

export function JourneyPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Live Journey</p>
          <h1 className="mt-3 text-[40px] font-bold leading-[1.08] text-white sm:text-[56px]">Your route is now under active supervision.</h1>
        </div>
        <GlassCard className="p-5 lg:col-span-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Arrival window</p>
              <p className="mt-1 text-2xl font-bold text-white">09:42 AM</p>
            </div>
            <ShieldCheck className="text-emerald-300" size={24} />
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <GlassCard className="p-5 sm:p-6 lg:col-span-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Route Progress</p>
              <h2 className="mt-2 text-[28px] font-semibold text-white">Live mobility timeline</h2>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">On track</span>
          </div>

          <div className="space-y-4">
            {[
              { title: 'Pickup confirmed', detail: 'Electric bike taxi arrives at Gate 3', time: 'Now', icon: Bike, done: true },
              { title: 'Metro transfer protected', detail: 'Blue line northbound, Platform 4', time: '12 min', icon: TrainFront, done: false },
              { title: 'Destination approach', detail: 'Final walk with low-rain corridor', time: '24 min', icon: Navigation2, done: false },
            ].map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div key={step.title} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }} className="flex items-center gap-4 rounded-[26px] border border-white/10 bg-white/[0.045] p-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${step.done ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'border-cyan-400/25 bg-cyan-400/10 text-cyan-300'}`}>
                    <Icon size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{step.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{step.detail}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-300">{step.time}</span>
                </motion.div>
              )
            })}
          </div>

          <Link to="/map" className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 text-sm font-bold text-white">
            Open Live Map
          </Link>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6 lg:col-span-5">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Fare Breakdown</p>
              <h2 className="mt-2 text-[28px] font-semibold text-white">Transparent cost view</h2>
            </div>
            <CircleDollarSign className="text-violet-300" size={24} />
          </div>

          <div className="space-y-3">
            {[
              ['Rapido first mile', 'Rs. 86', Bike],
              ['Metro Blue line', 'Rs. 56', TrainFront],
              ['Transfer buffer', '2 min', Waypoints],
            ].map(([label, value, Icon]) => {
              const CostIcon = Icon as typeof Bike
              return (
                <div key={label as string} className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-cyan-400/10 p-2 text-cyan-300"><CostIcon size={16} /></div>
                    <p className="font-semibold text-white">{label as string}</p>
                  </div>
                  <p className="font-bold text-white">{value as string}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-5 rounded-[26px] border border-emerald-400/20 bg-emerald-400/10 p-5">
            <div className="flex items-center gap-3 text-emerald-300">
              <CheckCircle2 size={20} />
              <p className="font-semibold">AI protection active</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">UrbanPilot will re-route if metro crowding, pickup ETA, fare surge or weather risk crosses the threshold.</p>
          </div>
        </GlassCard>
      </section>
    </div>
  )
}
