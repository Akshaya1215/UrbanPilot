import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Sparkles } from 'lucide-react'
import { GlassCard } from './GlassCard'

type JourneyCardProps = {
  title: string
  subtitle: string
  savings: string
  eta: string
  onClick?: () => void
}

export function JourneyCard({ title, subtitle, savings, eta, onClick }: JourneyCardProps) {
  return (
    <motion.button
      whileHover={{ y: -6, scale: 1.01 }}
      onClick={onClick}
      className="w-full text-left"
    >
      <GlassCard className="flex items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 text-cyan-300">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-white">{title}</p>
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-cyan-300" />
              <span>{eta}</span>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 font-medium text-emerald-300">
            {savings}
          </div>
          <ArrowRight size={16} className="text-slate-400" />
        </div>
      </GlassCard>
    </motion.button>
  )
}
