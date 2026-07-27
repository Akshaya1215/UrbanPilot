import { motion } from 'framer-motion'
import { Bike, Bus, Car, Footprints, HeartHandshake, Leaf, Route, TrainFront } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { routeComparison } from '../services/mockData'

const icons = {
  Metro: TrainFront,
  Cab: Car,
  'Rapido + Metro': Bike,
  Bus,
  Walking: Footprints,
}

const accentClasses = {
  cyan: 'from-cyan-400/20 to-cyan-400/5 text-cyan-300',
  violet: 'from-violet-500/20 to-violet-500/5 text-violet-300',
  emerald: 'from-emerald-400/20 to-emerald-400/5 text-emerald-300',
  amber: 'from-amber-400/20 to-amber-400/5 text-amber-300',
  slate: 'from-slate-300/10 to-slate-300/5 text-slate-300',
}

export function ComparePage() {
  return (
    <div className="space-y-8">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Compare Page</p>
          <h1 className="mt-3 text-[40px] font-bold leading-[1.08] text-white sm:text-[56px]">Every mobility mode, priced against intelligence.</h1>
        </div>
        <GlassCard className="p-5 lg:col-span-4">
          <p className="text-sm text-slate-400">Decision model</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-2xl font-bold text-white">Balanced</span>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">Live fares</span>
          </div>
        </GlassCard>
      </motion.section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {routeComparison.map((route, index) => {
          const Icon = icons[route.title as keyof typeof icons] ?? Route
          return (
            <motion.article
              key={route.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              whileHover={{ y: -8 }}
              className={`gradient-border relative min-h-[430px] rounded-[30px] bg-gradient-to-b ${accentClasses[route.accent as keyof typeof accentClasses]} p-px`}
            >
              <div className="flex h-full flex-col rounded-[30px] border border-white/10 bg-[#121826]/80 p-5 shadow-[0_24px_80px_rgba(2,8,23,0.45)] backdrop-blur-2xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055]">
                    <Icon size={20} />
                  </div>
                  {route.recommended ? (
                    <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Best</span>
                  ) : null}
                </div>

                <div className="mt-6">
                  <h2 className="text-[22px] font-semibold text-white">{route.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">AI-scored option for this specific city context.</p>
                </div>

                <div className="mt-6 grid gap-3">
                  {[
                    ['Cost', route.cost],
                    ['ETA', route.eta],
                    ['Walking', route.walking],
                    ['Transfers', route.transfers],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-3">
                      <span className="text-sm text-slate-400">{label}</span>
                      <span className="text-sm font-semibold text-white">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto space-y-3 pt-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-300"><HeartHandshake size={15} /> Comfort</div>
                    <span className="font-bold text-white">{route.comfort}/100</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${route.comfort}%` }} transition={{ duration: 0.9, delay: index * 0.08 }} className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400"><Leaf size={15} className="text-emerald-300" /> {route.carbon}</div>
                </div>
              </div>
            </motion.article>
          )
        })}
      </section>
    </div>
  )
}
