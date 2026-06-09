import Link from 'next/link'
import { TEAMS, GROUP_ORDER, GROUPS } from '@/lib/data'
import { Shield, TrendingUp, Users } from 'lucide-react'

export default function TeamsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <Shield className="w-6 h-6 text-emerald-400" />
        All 48 Teams
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GROUP_ORDER.map(group => {
          const groupTeams = TEAMS.filter(t => t.group === group.slice(-1))
          const sim = GROUPS[group] || []
          return (
            <div key={group} className="glass rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{group}</h2>
              <div className="space-y-3">
                {groupTeams.map(t => {
                  const s = sim.find(x => x.team === t.name)
                  return (
                    <Link
                      key={t.name}
                      href={`/teams/?highlight=${encodeURIComponent(t.name)}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-sm font-bold text-white">
                        {t.name.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{t.name}</div>
                        <div className="text-xs text-slate-500">Elo {t.elo_rating} · €{t.total_value}M</div>
                      </div>
                      {s && (
                        <div className="text-right">
                          <div className="text-xs font-bold text-emerald-400">{s.qualify_prob}%</div>
                          <div className="text-[10px] text-slate-600">qualify</div>
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Power Rankings Table */}
      <div className="mt-12 glass rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          Power Rankings (Top 24)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800">
                <th className="text-left py-2 px-3 font-medium">#</th>
                <th className="text-left py-2 px-3 font-medium">Team</th>
                <th className="text-left py-2 px-3 font-medium">Group</th>
                <th className="text-right py-2 px-3 font-medium">Elo</th>
                <th className="text-right py-2 px-3 font-medium">Value (€M)</th>
                <th className="text-right py-2 px-3 font-medium">FIFA Rank</th>
                <th className="text-left py-2 px-3 font-medium">Form</th>
              </tr>
            </thead>
            <tbody>
              {TEAMS.slice(0, 24).map((t, i) => (
                <tr key={t.name} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 font-mono">{i + 1}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{t.name}</td>
                  <td className="py-2.5 px-3 text-slate-400">{t.group}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-400">{t.elo_rating}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">{t.total_value}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">{t.fifa_rank}</td>
                  <td className="py-2.5 px-3 text-xs text-emerald-400">{t.recent_form}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
