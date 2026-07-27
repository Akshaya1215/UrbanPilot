import { motion } from 'framer-motion'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Clock3, Heart, Leaf, Route } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { historyStats, recentTrips, savingsData } from '../services/mockData'

export function HistoryPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">History</p>
          <h1 className="mt-3 text-[40px] font-bold leading-[1.08] text-white sm:text-[56px]">A personal operating log for city movement.</h1>
        </div>
        <GlassCard className="p-5 lg:col-span-4">
          <p className="text-sm text-slate-400">Favorite route</p>
          <p className="mt-2 text-2xl font-bold text-white">North Loop to Skyline</p>
          <p className="mt-1 text-sm text-emerald-300">92% chosen by AI</p>
        </GlassCard>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {historyStats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">{stat.change}</span>
              </div>
              <p className="mt-4 text-4xl font-bold text-white">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-500">{stat.detail}</p>
            </GlassCard>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <GlassCard className="p-5 sm:p-6 lg:col-span-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Savings Chart</p>
              <h2 className="mt-2 text-[28px] font-semibold text-white">Weekly optimization yield</h2>
            </div>
            <Route className="text-cyan-300" size={22} />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={savingsData}>
                <defs>
                  <linearGradient id="savings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#0B1120', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, color: '#F8FAFC' }} />
                <Area type="monotone" dataKey="value" stroke="#06B6D4" fill="url(#savings)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6 lg:col-span-4">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[22px] font-semibold text-white">Recent journeys</h2>
            <Clock3 className="text-violet-300" size={20} />
          </div>
          <div className="space-y-3">
            {recentTrips.map((trip) => (
              <div key={trip.id} className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{trip.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{trip.mode}</p>
                  </div>
                  <span className="text-sm font-bold text-cyan-300">{trip.score}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4">
              <Leaf size={18} className="text-emerald-300" />
              <p className="mt-3 text-sm text-slate-400">Eco preference</p>
              <p className="text-lg font-bold text-white">63%</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4">
              <Heart size={18} className="text-violet-300" />
              <p className="mt-3 text-sm text-slate-400">Comfort avg.</p>
              <p className="text-lg font-bold text-white">87</p>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  )
}
