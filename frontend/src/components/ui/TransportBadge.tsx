type TransportBadgeProps = {
  label: string
  tone?: 'cyan' | 'violet' | 'amber' | 'emerald' | 'slate'
}

const tones = {
  cyan: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
  violet: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
  amber: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  emerald: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  slate: 'border-white/10 bg-white/5 text-slate-300',
}

export function TransportBadge({ label, tone = 'slate' }: TransportBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${tones[tone]}`}>
      {label}
    </span>
  )
}
