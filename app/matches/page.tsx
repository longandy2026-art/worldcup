import { supabaseAdmin } from '@/lib/supabase'
import { MatchCard } from '@/components/MatchCard'
import { CalendarDays, Filter } from 'lucide-react'

export default async function MatchesPage({ searchParams }: { searchParams?: { stage?: string; date?: string } }) {
  const { data: matches } = await supabaseAdmin
    .from('matches')
    .select(`
      id, match_date, kickoff_utc, home_team_id, away_team_id,
      venue, city, stage, group_stage, home_score, away_score, status, is_finished,
      home_team:teams!home_team_id(name, elo_rating),
      away_team:teams!away_team_id(name, elo_rating)
    `)
    .order('kickoff_utc', { ascending: true })

  // Transform to enriched format
  const enrichedMatches = matches?.map(m => ({
    id: m.id,
    match_date: m.match_date,
    kickoff_utc: m.kickoff_utc,
    home_team: (m as any).home_team?.name || '?',
    away_team: (m as any).away_team?.name || '?',
    home_team_elo: (m as any).home_team?.elo_rating || 0,
    away_team_elo: (m as any).away_team?.elo_rating || 0,
    venue: m.venue,
    city: m.city,
    stage: m.stage,
    group_stage: m.group_stage,
    home_score: m.home_score,
    away_score: m.away_score,
    status: m.status,
    is_finished: m.is_finished,
    beijing_time: m.kickoff_utc ? new Date(new Date(m.kickoff_utc).getTime() + 8*60*60*1000).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : '',
  })) || []

  // Group by date
  const byDate: Record<string, typeof enrichedMatches> = {}
  enrichedMatches.forEach(m => {
    const dateKey = m.match_date || 'Unknown'
    if (!byDate[dateKey]) byDate[dateKey] = []
    byDate[dateKey].push(m)
  })
  const dates = Object.keys(byDate)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-emerald-400" />
          All Matches
        </h1>
        <div className="text-sm text-slate-500">
          {enrichedMatches.length} matches · 12 groups
        </div>
      </div>

      {dates.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p>No match data loaded yet. Import data via Supabase.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {dates.map(date => (
            <section key={date}>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter size={14} />
                {date}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {byDate[date].map(m => (
                  <MatchCard key={m.id} match={m as any} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
