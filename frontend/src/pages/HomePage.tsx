import { motion } from 'framer-motion'
import { ArrowRight, Navigation, Radio, Sparkles } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { JourneyCard } from '../components/ui/JourneyCard'
import { recentTrips, savedPlaces, trafficOverview } from '../services/mockData'

export function HomePage() {
  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[36px] border border-white/10 bg-[rgba(8,12,24,0.82)] p-6 shadow-[0_24px_80px_rgba(2,8,23,0.35)] backdrop-blur-2xl sm:p-10"
      >
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-300">
              <Sparkles size={16} />
              Where are we going today?
            </div>
            <h2 className="max-w-2xl text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              City intelligence, tuned for your next move.
            </h2>
            <p className="max-w-xl text-lg leading-8 text-slate-400">
              Discover routes that balance price, time, comfort and live mobility context in one premium experience.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Cheapest', 'Fastest', 'Balanced'].map((value) => (
                <button key={value} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/30 hover:text-white">
                  {value}
                </button>
              ))}
            </div>
          </div>
          <GlassCard className="p-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Current location</p>
                  <p className="mt-1 font-semibold text-white">North Loop, Sector 12</p>
                </div>
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-2 text-emerald-300">
                  <Radio size={18} />
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Destination</p>
                <p className="mt-1 font-semibold text-white">Skyline Tower, Business District</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Travel preference</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">Balanced</span>
                  <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-sm text-violet-300">Live traffic aware</span>
                </div>
              </div>
              <button className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                Find Best Route <ArrowRight size={16} />
              </button>
            </div>
          </GlassCard>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Recent trips</h3>
            <button className="text-sm text-slate-400">View all</button>
          </div>
          <div className="space-y-3">
            {recentTrips.map((trip) => (
              <JourneyCard key={trip.id} title={trip.title} subtitle={trip.mode} savings={trip.savings} eta={trip.time} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <GlassCard className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Saved places</h3>
              <span className="text-sm text-slate-400">3 pinned</span>
            </div>
            <div className="space-y-3">
              {savedPlaces.map((place) => (
                <div key={place.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-cyan-400/10 p-2 text-cyan-300"><Navigation size={16} /></div>
                    <div>
                      <p className="text-sm font-semibold text-white">{place.label}</p>
                      <p className="text-sm text-slate-400">{place.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Traffic overview</h3>
              <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-sm text-amber-300">Live</div>
            </div>
            <div className="space-y-3">
              {trafficOverview.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-semibold text-white">{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/8">
                    <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>
      </div>
    </div>
  )
}
