'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Target, CheckCircle } from 'lucide-react'

export function PredictionForm({ matchId, homeTeam, awayTeam }: { matchId: number; homeTeam: string; awayTeam: string }) {
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const h = parseInt(homeScore)
    const a = parseInt(awayScore)
    if (isNaN(h) || isNaN(a)) return

    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        alert('Please sign in first')
        return
      }
      const res = await fetch('/api/predictions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          match_id: matchId,
          predicted_home_score: h,
          predicted_away_score: a,
        }),
      })
      if (res.ok) setSubmitted(true)
      else {
        const err = await res.json()
        alert(err.error || 'Failed to submit')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 py-2">
        <CheckCircle size={18} />
        <span className="font-medium">Prediction submitted! Good luck.</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400 w-20">{homeTeam}</span>
        <input
          type="number"
          min={0}
          max={20}
          value={homeScore}
          onChange={e => setHomeScore(e.target.value)}
          className="w-16 h-10 rounded-lg bg-slate-800 border border-slate-700 text-center text-white font-bold focus:border-emerald-500 focus:outline-none"
          required
        />
      </div>
      <span className="text-slate-500 font-bold">-</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={20}
          value={awayScore}
          onChange={e => setAwayScore(e.target.value)}
          className="w-16 h-10 rounded-lg bg-slate-800 border border-slate-700 text-center text-white font-bold focus:border-emerald-500 focus:outline-none"
          required
        />
        <span className="text-sm text-slate-400 w-20 text-right">{awayTeam}</span>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="h-10 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center gap-2"
      >
        <Target size={14} />
        {submitting ? '...' : 'Submit'}
      </button>
    </form>
  )
}
