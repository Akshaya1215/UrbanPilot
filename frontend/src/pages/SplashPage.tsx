import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export function SplashPage() {
  return (
    <div className="flex min-h-[88vh] flex-col items-center justify-center overflow-hidden rounded-[36px] border border-white/10 bg-[rgba(8,12,24,0.88)] px-6 py-16 shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:px-10 lg:px-16">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[12%] h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-[-8%] right-[-5%] h-64 w-64 rounded-full bg-violet-500/25 blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 max-w-3xl text-center"
      >
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_55px_rgba(6,182,212,0.2)]">
          <Sparkles size={34} />
        </div>
        <p className="mb-6 text-sm font-semibold uppercase tracking-[0.4em] text-cyan-300">Multimodal Urban Journey Intelligence</p>
        <h1 className="text-5xl font-semibold text-white sm:text-7xl">UrbanPilot AI</h1>
        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
          A premium intelligence layer for faster, safer, and smarter city movement.
        </p>
        <motion.div whileHover={{ scale: 1.03 }} className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-full border border-cyan-400/30 bg-gradient-to-r from-cyan-400/20 via-sky-500/15 to-violet-500/20 px-8 py-4 text-base font-semibold text-white shadow-[0_0_40px_rgba(6,182,212,0.14)]"
          >
            Launch UrbanPilot <ArrowRight size={18} />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
