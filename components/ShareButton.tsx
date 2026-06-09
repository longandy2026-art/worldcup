'use client'

import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { Share2, Download } from 'lucide-react'

export function ShareButton({ matchId, homeTeam, awayTeam }: { matchId: number; homeTeam: string; awayTeam: string }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)

  async function generatePoster() {
    if (!cardRef.current) return
    setGenerating(true)
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: '#0b1120', scale: 2 })
      const link = document.createElement('a')
      link.download = `sportmind-match-${matchId}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  function shareText() {
    const text = `I just predicted ${homeTeam} vs ${awayTeam} on SportMind AI! 🏆 Check out the AI match intelligence →`
    if (navigator.share) {
      navigator.share({ title: 'SportMind AI', text, url: window.location.href })
    } else {
      navigator.clipboard.writeText(text + ' ' + window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="space-y-3">
      {/* Hidden poster card for html2canvas */}
      <div ref={cardRef} className="w-[360px] p-6 rounded-2xl bg-gradient-to-br from-[#0b1120] to-[#151e32] border border-slate-800">
        <div className="text-center mb-4">
          <div className="text-xs text-emerald-400 font-bold tracking-wider mb-1">SPORTMIND AI</div>
          <div className="text-lg font-black text-white">2026 WORLD CUP</div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-center flex-1">
            <div className="text-2xl font-black text-white">{homeTeam.slice(0, 3).toUpperCase()}</div>
          </div>
          <div className="text-slate-500 font-bold px-2">VS</div>
          <div className="text-center flex-1">
            <div className="text-2xl font-black text-white">{awayTeam.slice(0, 3).toUpperCase()}</div>
          </div>
        </div>
        <div className="text-center text-xs text-slate-500">
          AI-Powered Match Intelligence · sportmind.ai
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={shareText}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium border border-slate-700 transition-colors flex items-center gap-2"
        >
          <Share2 size={14} />
          Share
        </button>
        <button
          onClick={generatePoster}
          disabled={generating}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Download size={14} />
          {generating ? '...' : 'Save Poster'}
        </button>
      </div>
    </div>
  )
}
