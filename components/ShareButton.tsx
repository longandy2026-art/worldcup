'use client'

import { Share2 } from 'lucide-react'

export function ShareButton({ matchId, homeTeam, awayTeam }: { matchId: number; homeTeam: string; awayTeam: string }) {
  async function shareText() {
    const text = 
    if (navigator.share) {
      try {
        await navigator.share({ title: 'SportMind AI', text, url: window.location.href })
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(text + ' ' + window.location.href)
      } catch {
        // Fallback
        const ta = document.createElement('textarea')
        ta.value = text + ' ' + window.location.href
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
    }
  }

  return (
    <div className="flex gap-2 justify-end">
      <button
        onClick={shareText}
        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium border border-slate-700 transition-colors flex items-center gap-2"
      >
        <Share2 size={14} />
        Share
      </button>
    </div>
  )
}
