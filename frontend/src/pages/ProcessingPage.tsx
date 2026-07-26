import { motion } from 'framer-motion'
import { Activity, Brain, Cpu } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { agentSteps } from '../services/mockData'

export function ProcessingPage() {
  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[36px] border border-cyan-400/15 bg-[rgba(8,12,24,0.86)] p-6 shadow-[0_30px_100px_rgba(6,182,212,0.12)] backdrop-blur-2xl sm:p-10"
      >
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-300">
              <Brain size={16} />
              Agentic AI swarm in motion
            </div>
            <h2 className="text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              The network is reasoning across mobility signals in real time.
            </h2>
            <p className="max-w-xl text-lg leading-8 text-slate-400">
              Each specialist agent contributes a different layer of intelligence, from geospatial context to live fare data.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Live inference', 'Multi-agent coordination', 'Adaptive planning'].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="relative flex min-h-[320px] items-center justify-center rounded-[34px] border border-white/10 bg-[radial-gradient(circle,_rgba(6,182,212,0.16),_transparent_56%)] p-6">
            <div className="absolute inset-0 rounded-[34px] border border-cyan-400/20" />
            <div className="absolute left-[20%] top-[20%] h-20 w-20 rounded-full border border-cyan-400/30 bg-cyan-400/10" />
            <div className="absolute right-[22%] top-[30%] h-24 w-24 rounded-full border border-violet-400/30 bg-violet-400/10" />
            <div className="absolute bottom-[20%] left-[30%] h-20 w-20 rounded-full border border-emerald-400/30 bg-emerald-400/10" />
            <div className="absolute bottom-[18%] right-[24%] h-20 w-20 rounded-full border border-amber-400/30 bg-amber-400/10" />
            <div className="absolute inset-x-8 top-1/2 h-[1px] -translate-y-1/2 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
            <div className="absolute inset-y-8 left-1/2 w-[1px] -translate-x-1/2 bg-gradient-to-b from-transparent via-violet-400/70 to-transparent" />
            <motion.div animate={{ rotate: 360, scale: [1, 1.03, 1] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} className="rounded-full border border-white/10 bg-[rgba(10,15,28,0.8)] p-8 shadow-[0_0_60px_rgba(59,130,246,0.16)]">
              <Cpu size={44} className="text-cyan-300" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-4 md:grid-cols-2">
        {agentSteps.map((agent, index) => (
          <motion.div key={agent.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-semibold text-white">{agent.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{agent.detail}</p>
                </div>
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">
                  {agent.status}
                </div>
              </div>
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
                  <span>Progress</span>
                  <span>{agent.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${agent.progress}%` }} transition={{ duration: 0.8, delay: index * 0.12 }} className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" />
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2 text-sm text-slate-400">
                <Activity size={16} className="text-cyan-300" />
                Live logs synced to the swarm core.
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
