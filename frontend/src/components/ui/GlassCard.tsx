import type { ReactNode } from 'react'

type GlassCardProps = {
  children: ReactNode
  className?: string
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={`rounded-[28px] border border-white/10 bg-[rgba(17,25,40,0.72)]/80 shadow-[0_20px_80px_rgba(2,8,23,0.45)] backdrop-blur-2xl ${className}`}>
      {children}
    </div>
  )
}
