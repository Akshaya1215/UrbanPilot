import { motion } from 'framer-motion'
import { Bike, Footprints, TrainFront } from 'lucide-react'

type TimelineItem = {
  title: string
  subtitle: string
  duration: string
  icon: string
  distance?: string
}

type TimelineProps = {
  items: TimelineItem[]
}

export function Timeline({ items }: TimelineProps) {
  const iconMap = {
    walk: Footprints,
    bike: Bike,
    train: TrainFront,
  }

  return (
    <div className="relative space-y-4">
      <div className="absolute bottom-8 left-5 top-8 w-px bg-gradient-to-b from-cyan-400 via-violet-500 to-emerald-400" />
      {items.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          className="relative flex items-start gap-4 rounded-[26px] border border-white/10 bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        >
          <div className="z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/25 bg-[#0B1120] text-cyan-300 shadow-[0_0_28px_rgba(6,182,212,0.16)]">
            {(() => {
              const Icon = iconMap[item.icon as keyof typeof iconMap] ?? Footprints
              return <Icon size={18} />
            })()}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-semibold text-white">{item.title}</p>
              <span className="text-sm text-slate-400">{item.duration}</span>
            </div>
            <p className="mt-1 text-sm text-slate-400">{item.subtitle}</p>
            {item.distance ? <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{item.distance}</p> : null}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
