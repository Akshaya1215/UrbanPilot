import { NavLink, Outlet } from 'react-router-dom'
import { Bell, BrainCircuit, Compass, History, LayoutGrid, Map, Navigation, Search, Sparkles, UserRound, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { to: '/', label: 'Home', icon: LayoutGrid },
  { to: '/processing', label: 'Agents', icon: BrainCircuit },
  { to: '/recommendation', label: 'Route', icon: Compass },
  { to: '/compare', label: 'Compare', icon: Navigation },
  { to: '/map', label: 'Live Map', icon: Map },
  { to: '/history', label: 'History', icon: History },
]

export function AppShell() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-slate-100">
      <div className="pointer-events-none fixed inset-0 ambient-grid opacity-60" />
      <div className="pointer-events-none fixed left-[-10%] top-[8%] h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl [animation:slow-drift_12s_ease-in-out_infinite]" />
      <div className="pointer-events-none fixed right-[-8%] top-[16%] h-96 w-96 rounded-full bg-violet-500/20 blur-3xl [animation:slow-drift_14s_ease-in-out_infinite]" />
      <div className="pointer-events-none fixed bottom-[-12%] left-[34%] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl [animation:slow-drift_16s_ease-in-out_infinite]" />

      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed left-0 right-0 top-4 z-30 px-4 sm:px-6"
      >
        <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-full border border-white/10 bg-[#0B1120]/70 px-4 py-3 shadow-[0_20px_80px_rgba(2,8,23,0.42)] backdrop-blur-2xl">
          <NavLink to="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-200 shadow-[0_0_36px_rgba(6,182,212,0.18)]">
              <Zap size={18} />
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold text-white">UrbanPilot AI</p>
              <p className="truncate text-xs text-slate-400">Multi-Agent Mobility OS</p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.045] p-1 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-400/20 to-violet-500/20 text-white shadow-[0_0_28px_rgba(6,182,212,0.18)]'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon size={15} />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <div className="flex justify-end gap-2">
            {[Search, Bell, UserRound].map((Icon, index) => (
              <button
                key={index}
                aria-label={index === 0 ? 'Search' : index === 1 ? 'Notifications' : 'Profile'}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-slate-300 transition hover:border-cyan-400/30 hover:text-white"
              >
                <Icon size={17} />
              </button>
            ))}
          </div>
        </div>
      </motion.header>

      <main className="relative z-10 mx-auto min-h-screen max-w-[1440px] px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <div className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-[#0B1120]/80 p-1 shadow-[0_20px_70px_rgba(2,8,23,0.5)] backdrop-blur-2xl lg:hidden">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className={({ isActive }) =>
                `flex h-10 w-10 items-center justify-center rounded-full transition ${
                  isActive ? 'bg-cyan-400/15 text-cyan-200' : 'text-slate-400'
                }`
              }
            >
              <Icon size={17} />
            </NavLink>
          )
        })}
        <NavLink to="/history" aria-label="History" className={({ isActive }) => `flex h-10 w-10 items-center justify-center rounded-full transition ${isActive ? 'bg-cyan-400/15 text-cyan-200' : 'text-slate-400'}`}>
          <Sparkles size={17} />
        </NavLink>
      </div>
    </div>
  )
}
