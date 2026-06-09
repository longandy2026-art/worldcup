import Link from 'next/link'
import { MATCHES, TEAMS, SCORERS, GROUP_ORDER, GROUPS } from '@/lib/data'
import { MatchCard } from '@/components/MatchCard'
import { Trophy, Users, Calendar, TrendingUp, Globe, Target } from 'lucide-react'

export default function HomePage() {
  const upcoming = MATCHES.slice(0, 6)
  const topTeams = TEAMS.slice(0, 8)
  const topScorers = SCORERS.slice(0, 5)

  const stats = [
    { label: 'Teams', value: 48, icon: Users },
    { label: 'Matches', value: 104, icon: Calendar },
    { label: 'Players', value: 1248, icon: Trophy },
    { label: 'Groups', value: 12, icon: Globe },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-16">
      {/* Hero */}
      <section className="text-center py-12 md:py-20 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          2026 FIFA World Cup — June 11 ~ July 19
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
          <span className="text-gradient">World Cup</span>
          <br />
          <span className="text-white">Intelligence Platform</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          AI-powered match previews, data-driven predictions, and real-time analytics for all 48 teams and 104 matches.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link href="/matches/" className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors">
            Explore Matches
          </Link>
          <Link href="/teams/" className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold border border-slate-700 transition-colors">
            View Teams
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="glass rounded-2xl p-5 text-center card-hover">
            <s.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Upcoming Matches */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Upcoming Matches
          </h2>
          <Link href="/matches/" className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">
            View all →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcoming.map(m => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </section>

      {/* Top Teams */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Power Rankings
          </h2>
          <Link href="/teams/" className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">
            All teams →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {topTeams.map(t => (
            <Link
              key={t.name}
              href={`/teams/?highlight=${encodeURIComponent(t.name)}`}
              className="glass rounded-xl p-4 card-hover flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-lg">
                {t.name.slice(0, 2)}
              </div>
              <div>
                <div className="font-semibold text-sm text-white">{t.name}</div>
                <div className="text-xs text-slate-500">Elo {t.elo_rating}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Golden Boot */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-amber-400" />
            Golden Boot Predictions
          </h2>
          <div className="space-y-3">
            {topScorers.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-amber-500 text-black' : i === 1 ? 'bg-slate-300 text-black' : i === 2 ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {s.rank}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.nationality}</div>
                </div>
                <div className="text-sm font-bold text-emerald-400">{s.predicted_goals} goals</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-emerald-400" />
            Group Standings (Simulated)
          </h2>
          <div className="space-y-4">
            {GROUP_ORDER.slice(0, 4).map(g => (
              <div key={g}>
                <div className="text-xs font-bold text-slate-500 mb-1.5">{g}</div>
                <div className="space-y-1">
                  {GROUPS[g]?.slice(0, 2).map(t => (
                    <div key={t.team} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{t.team}</span>
                      <span className="text-emerald-400 font-mono">{t.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
