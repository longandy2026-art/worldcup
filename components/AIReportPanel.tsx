'use client'

import { useState } from 'react'
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react'

export function AIReportPanel({ matchId, homeTeam, awayTeam }: { matchId: number; homeTeam: string; awayTeam: string }) {
  const [report, setReport] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai-report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, homeTeam, awayTeam, version: 'overseas' }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setReport(data.content)
    } catch (e: any) {
      setError(e.message || 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Sparkles size={18} className="text-amber-400" />
          AI Match Intelligence
        </h3>
        {!report && !loading && (
          <button
            onClick={generate}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <Sparkles size={14} />
            Generate Report
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-slate-400 py-8">
          <Loader2 className="animate-spin" size={18} />
          <span className="text-sm">DeepSeek V4 is analyzing team data, form, and tactical matchups...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg p-3">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {report && (
        <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
          {report}
        </div>
      )}
    </div>
  )
}
