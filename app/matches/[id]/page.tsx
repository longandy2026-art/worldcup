import { notFound } from 'next/navigation'
import { getMatchById, getTeamByName, TEAMS } from '@/lib/data'
import { getStageColor } from '@/lib/utils'
import { AIReportPanel } from '@/components/AIReportPanel'
import { PredictionForm } from '@/components/PredictionForm'
import { ShareButton } from '@/components/ShareButton'
import { Calendar, MapPin, Clock, TrendingUp, Users, Shield } from 'lucide-react'

interface Props {
  params: { id: string }
}

export function generateStaticParams() {
  return Array.from({ length: 104 }, (_, i) => ({ id: String(i + 1) }))
}

export default function MatchDetailPage({ params }: Props) {
  const id = parseInt(params.id)
  const match = getMatchById(id)
  if (!match) return notFound()

  const home = getTeamByName(match.home_team)
  const away = getTeamByName(match.away_team)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="glass rounded-2xl p-6 md:p-10 mb-6">
        <div className="flex items-center justify-between mb-6">
          <span className={`text-xs font-bold px-3 py-1 rounded-md border ${getStageColor(match.stage)}`}>
            {match.group} · {match.stage}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar size={12} /> {match.beijing_time}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-3xl font-black text-white mb-3">
              {match.home_team.slice(0, 2)}
            </div>
            <h2 className="text-xl font-bold text-white">{match.home_team}</h2>
            <p className="text-sm text-slate-500 mt-1">FIFA Rank #{home?.fifa_rank || '-'}</p>
          </div>

          <div className="text-center px-6">
            <div className="text-4xl md:text-5xl font-black text-white tabular-nums">
              {match.home_score ?? '-'} : {match.away_score ?? '-'}
            </div>
            <div className="text-sm text-slate-500 mt-2 font-mono">{match.beijing_time}</div>
          </div>

          <div className="flex-1 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-3xl font-black text-white mb-3">
              {match.away_team.slice(0, 2)}
            </div>
            <h2 className="text-xl font-bold text-white">{match.away_team}</h2>
            <p className="text-sm text-slate-500 mt-1">FIFA Rank #{away?.fifa_rank || '-'}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-slate-400">
          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-emerald-400" /> {match.venue}</span>
          <span className="flex items-center gap-1.5"><Clock size={14} className="text-emerald-400" /> {match.city}</span>
        </div>
      </div>

      {/* Team Stats Comparison */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {[home, away].filter(Boolean).map((team, idx) => (
          <div key={team!.name} className={`glass rounded-xl p-5 ${idx === 0 ? 'border-l-4 border-l-emerald-500' : 'border-r-4 border-r-amber-500'}`}>
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Shield size={16} className={idx === 0 ? 'text-emerald-400' : 'text-amber-400'} />
              {team!.name} Profile
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-slate-500 text-xs mb-1">Elo Rating</div>
                <div className="text-white font-bold text-lg">{team!.elo_rating}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-slate-500 text-xs mb-1">Squad Value</div>
                <div className="text-white font-bold text-lg">€{team!.total_value}M</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-slate-500 text-xs mb-1">Avg Age</div>
                <div className="text-white font-bold text-lg">{team!.avg_age}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-slate-500 text-xs mb-1">Recent Form</div>
                <div className="text-emerald-400 font-bold text-lg">{team!.recent_form}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              <span className="text-slate-500">Core Player:</span> {team!.core_player}
            </div>
          </div>
        ))}
      </div>

      {/* AI Report */}
      <AIReportPanel matchId={id} homeTeam={match.home_team} awayTeam={match.away_team} />

      {/* Prediction */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-400" />
          Make Your Prediction
        </h3>
        <PredictionForm matchId={id} homeTeam={match.home_team} awayTeam={match.away_team} />
      </div>

      {/* Share */}
      <div className="flex justify-end">
        <ShareButton matchId={id} homeTeam={match.home_team} awayTeam={match.away_team} />
      </div>
    </div>
  )
}
