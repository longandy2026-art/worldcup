import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStageColor(stage: string): string {
  switch (stage) {
    case 'Group Stage': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    case 'Round of 32': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'Round of 16': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    case 'Quarter-Final': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    case 'Semi-Final': return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    case 'Third Place': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    case 'Final': return 'bg-amber-400/20 text-amber-300 border-amber-400/30'
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }
}

export function getStatusBadge(status: string): string {
  switch (status) {
    case 'LIVE': return 'bg-red-500 text-white animate-pulse'
    case 'FINISHED':
    case 'FT': return 'bg-slate-700 text-slate-300'
    case 'HT': return 'bg-yellow-500/20 text-yellow-400'
    default: return 'bg-emerald-500/20 text-emerald-400'
  }
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(isoStr: string): string {
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZoneName: 'short'
  })
}

export function parseScore(str: string): number | null {
  const n = parseInt(str, 10)
  return isNaN(n) ? null : n
}

export function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '…' : str
}
