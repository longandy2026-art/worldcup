import Link from 'next/link'
import type { Match } from '@/lib/data'
import { getTeamByName, getStatusBadge, getStageColor } from '@/lib/utils'
import { Clock, MapPin, ChevronRight } from 'lucide-react'

export function MatchCard({ match }: { match: Match }) {
  const home = getTeamByName(match.home_team)
  const away = getTeamByName(match.away_team)
  const isFinished = match.status === 'FINISHED'
  const isLive = match.status === 'LIVE'

  return (
    <Link href={`/matches/${match.id}/`} className="block">
      <div className="glass rounded-2xl p-5 card-hover relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${getStageColor(match.stage)}`}>
            {match.group}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${getStatusBadge(match.status)}`}>
            {isLive ? 'LIVE' : isFinished ? 'FT' : 'UPCOMING'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 flex items-center justify-center text-lg font-bold text-white mb-2">
              {match.home_team.slice(0, 2)}
            </div>
            <div className="text-sm font-semibold text-white">{match.home_team}</div>
            <div className="text-xs text-slate-500 mt-0.5">Elo {home?.elo_rating || '-'}</div>
          </div>

          <div className="px-4">
            {isFinished || isLive ? (
              <div className="text-2xl font-black text-white tabular-nums">
                {match.home_score} - {match.away_score}
              </div>
            ) : (
              <div className="text-xl font-bold text-slate-500">VS</div>
            )}
            <div className="text-xs text-slate-500 mt-1 text-center">{match.beijing_time}</div>
          </div>

          <div className="flex-1 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 flex items-center justify-center text-lg font-bold text-white mb-2">
              {match.away_team.slice(0, 2)}
            </div>
            <div className="text-sm font-semibold text-white">{match.away_team}</div>
            <div className="text-xs text-slate-500 mt-0.5">Elo {away?.elo_rating || '-'}</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Clock size={12} /> {match.beijing_time}</span>
          <span className="flex items-center gap-1"><MapPin size={12} /> {match.city}</span>
        </div>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700">
          <ChevronRight size={16} />
        </div>
      </div>
    </Link>
  )
}
