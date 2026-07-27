import { motion } from 'framer-motion'
import { Bike, CloudSun, Layers3, LocateFixed, MapPin, Navigation2, TrainFront, Zap } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'

export function MapPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Live Map</p>
          <h1 className="mt-3 text-[40px] font-bold leading-[1.08] text-white sm:text-[56px]">Dark city map with active route intelligence.</h1>
        </div>
        <GlassCard className="p-5 lg:col-span-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Route status</p>
              <p className="mt-1 text-2xl font-bold text-white">On track</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
              <Navigation2 size={20} />
            </div>
          </div>
        </GlassCard>
      </section>

      <GlassCard className="overflow-hidden p-0">
        <div className="relative min-h-[650px] overflow-hidden bg-[linear-gradient(135deg,rgba(8,13,26,0.98),rgba(2,6,23,0.96))]">
          <div className="absolute inset-0 ambient-grid opacity-80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_25%,rgba(6,182,212,0.14),transparent_24%),radial-gradient(circle_at_74%_42%,rgba(139,92,246,0.14),transparent_26%)]" />

          {[18, 31, 45, 59, 73].map((top) => (
            <div key={top} className="absolute left-0 h-px w-full bg-white/[0.035]" style={{ top: `${top}%` }} />
          ))}
          {[12, 25, 39, 52, 68, 84].map((left) => (
            <div key={left} className="absolute top-0 h-full w-px bg-white/[0.035]" style={{ left: `${left}%` }} />
          ))}

          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 650" role="img" aria-label="Animated UrbanPilot route map">
            <defs>
              <linearGradient id="livePath" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="48%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#22C55E" />
              </linearGradient>
            </defs>
            <path d="M95 510 C 210 430, 276 470, 384 362 C 498 246, 602 310, 710 238 C 824 162, 964 190, 1100 116" fill="none" stroke="rgba(6,182,212,0.14)" strokeWidth="30" strokeLinecap="round" />
            <path d="M95 510 C 210 430, 276 470, 384 362 C 498 246, 602 310, 710 238 C 824 162, 964 190, 1100 116" fill="none" stroke="url(#livePath)" strokeWidth="7" strokeLinecap="round" className="route-dash" />
          </svg>

          <motion.div animate={{ x: [0, 260, 520, 820, 980], y: [0, -70, -180, -280, -392] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-[19%] left-[8%] flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/15 text-cyan-200 shadow-[0_0_34px_rgba(6,182,212,0.3)]">
            <TrainFront size={19} />
          </motion.div>
          <motion.div animate={{ x: [0, 140, 270, 410], y: [0, -44, -92, -145] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-[17%] left-[20%] flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/15 text-emerald-200">
            <Bike size={18} />
          </motion.div>

          {[
            { label: 'Origin', top: '76%', left: '8%', icon: LocateFixed, tone: 'cyan' },
            { label: 'Metro', top: '52%', left: '43%', icon: TrainFront, tone: 'violet' },
            { label: 'Destination', top: '16%', left: '88%', icon: MapPin, tone: 'emerald' },
          ].map((pin) => {
            const Icon = pin.icon
            return (
              <div key={pin.label} className="absolute rounded-full border border-white/10 bg-[#121826]/80 p-3 shadow-[0_16px_50px_rgba(2,8,23,0.45)] backdrop-blur-xl" style={{ top: pin.top, left: pin.left }}>
                <Icon size={18} className={pin.tone === 'cyan' ? 'text-cyan-300' : pin.tone === 'violet' ? 'text-violet-300' : 'text-emerald-300'} />
              </div>
            )
          })}

          <div className="absolute left-5 top-5 flex flex-wrap gap-2">
            {[
              ['Traffic', Zap],
              ['Weather', CloudSun],
              ['Layers', Layers3],
            ].map(([label, Icon]) => {
              const LayerIcon = Icon as typeof Zap
              return (
                <button key={label as string} className="flex items-center gap-2 rounded-full border border-white/10 bg-[#121826]/70 px-4 py-2 text-sm font-semibold text-slate-200 backdrop-blur-xl">
                  <LayerIcon size={15} /> {label as string}
                </button>
              )
            })}
          </div>

          <div className="absolute bottom-5 left-5 right-5 grid gap-3 md:grid-cols-4">
            {[
              ['Metro ETA', '4 min'],
              ['Bike pickup', '3 min'],
              ['Traffic', 'Moderate'],
              ['Weather', 'Clear'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[22px] border border-white/10 bg-[#121826]/75 p-4 backdrop-blur-xl">
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-1 text-lg font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
