import { motion } from 'framer-motion'

type TimelineItem = {
  title: string
  subtitle: string
  duration: string
  icon: string
}

type TimelineProps = {
  items: TimelineItem[]
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          className="flex items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-4"
        >
          <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-sm text-cyan-300">
            {item.icon.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-semibold text-white">{item.title}</p>
              <span className="text-sm text-slate-400">{item.duration}</span>
            </div>
            <p className="mt-1 text-sm text-slate-400">{item.subtitle}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
