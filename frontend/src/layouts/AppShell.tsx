import { NavLink, Outlet } from 'react-router-dom'
import { BrainCircuit, Compass, History, LayoutGrid, Map, Navigation, Sparkles, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { to: '/', label: 'Home', icon: LayoutGrid },
  { to: '/processing', label: 'AI Processing', icon: BrainCircuit },
  { to: '/recommendation', label: 'Route', icon: Compass },
  { to: '/compare', label: 'Compare', icon: Navigation },
  { to: '/journey', label: 'Journey', icon: Sparkles },
  { to: '/map', label: 'Live Map', icon: Map },
  { to: '/history', label: 'History', icon: History },
]

export function AppShell() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.15),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.16),_transparent_26%),#050816] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-3 z-20 mb-4 rounded-full border border-white/10 bg-[rgba(10,15,28,0.68)] px-4 py-3 shadow-[0_20px_80px_rgba(2,8,23,0.35)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
                <Zap size={18} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400">UrbanPilot AI</p>
                <p className="text-sm font-semibold text-white">National Mobility OS</p>
              </div>
            </div>
            <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-full px-3 py-2 text-sm font-medium transition-all ${isActive ? 'bg-gradient-to-r from-cyan-400/20 to-violet-500/20 text-white shadow-[0_0_25px_rgba(6,182,212,0.16)]' : 'text-slate-400 hover:text-white'}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </motion.header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
