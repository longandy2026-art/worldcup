import { Trophy, Medal, Crown } from 'lucide-react'

// Static mock data for MVP — will be replaced by API call
const MOCK_LEADERBOARD = [
  { rank: 1, username: 'MessiFan2026', points: 145, correct: 12, streak: 5 },
  { rank: 2, username: 'DataWiz', points: 132, correct: 11, streak: 3 },
  { rank: 3, username: 'FootballAI', points: 128, correct: 10, streak: 4 },
  { rank: 4, username: 'WorldCupKing', points: 119, correct: 9, streak: 2 },
  { rank: 5, username: 'TacticalNerd', points: 115, correct: 9, streak: 1 },
  { rank: 6, username: 'GoalHunter', points: 108, correct: 8, streak: 0 },
  { rank: 7, username: 'EloMaster', points: 102, correct: 8, streak: 2 },
  { rank: 8, username: 'xGExpert', points: 98, correct: 7, streak: 1 },
  { rank: 9, username: 'PenaltyPro', points: 94, correct: 7, streak: 0 },
  { rank: 10, username: 'VARReferee', points: 88, correct: 6, streak: 1 },
]

export default function LeaderboardPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          Global Leaderboard
        </h1>
        <p className="text-slate-500 text-sm">Ranked by prediction accuracy and points earned</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">User</div>
          <div className="col-span-3 text-right">Points</div>
          <div className="col-span-2 text-right">Correct</div>
          <div className="col-span-2 text-right">Streak</div>
        </div>

        {MOCK_LEADERBOARD.map((u, i) => (
          <div
            key={u.username}
            className={`grid grid-cols-12 gap-2 px-4 py-3.5 items-center border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
              i < 3 ? 'bg-slate-800/20' : ''
            }`}
          >
            <div className="col-span-1">
              {i === 0 ? <Crown size={16} className="text-amber-400" /> :
               i === 1 ? <Medal size={16} className="text-slate-300" /> :
               i === 2 ? <Medal size={16} className="text-orange-600" /> :
               <span className="text-slate-500 font-mono text-sm">{u.rank}</span>}
            </div>
            <div className="col-span-4 font-semibold text-white text-sm">{u.username}</div>
            <div className="col-span-3 text-right font-bold text-emerald-400 text-sm">{u.points}</div>
            <div className="col-span-2 text-right text-slate-400 text-sm">{u.correct}</div>
            <div className="col-span-2 text-right">
              {u.streak > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-bold">
                  🔥 {u.streak}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center text-xs text-slate-600">
        Live rankings update after each match. Predict more matches to climb the ladder!
      </div>
    </div>
  )
}
