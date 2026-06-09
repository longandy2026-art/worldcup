import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client (service role key) — only for server-side API routes
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false } }
)

// ============================================================
// TypeScript types
// ============================================================

export interface Team {
  id: number
  name: string
  name_cn?: string
  group_letter: string
  continent?: string
  fifa_rank?: number
  elo_rating: number
  total_value_million?: number
  player_count?: number
  avg_age?: number
  core_player?: string
  recent_form?: string
  created_at: string
}

export interface Match {
  id: number
  match_date: string
  kickoff_utc: string
  home_team_id: number
  away_team_id: number
  venue?: string
  city?: string
  stage: string
  group_stage?: string
  home_score: number | null
  away_score: number | null
  status: string
  is_finished: boolean
  created_at: string
  updated_at: string
}

export interface Player {
  id: number
  name: string
  team_id: number
  position?: string
  age?: number
  club?: string
  value_million?: number
  created_at: string
}

export interface User {
  id: string
  username?: string
  avatar_url?: string
  region?: string
  total_points: number
  rank: number
  is_premium: boolean
  created_at: string
}

export interface Prediction {
  id: number
  user_id: string
  match_id: number
  predicted_home_score: number
  predicted_away_score: number
  points_earned: number
  created_at: string
}

export interface AIReport {
  id: number
  match_id: number
  region: string
  content: string
  predicted_score?: string
  confidence_level?: string
  status: string
  error_message?: string
  retry_count: number
  created_at: string
  updated_at: string
}

export interface ShareStat {
  id: number
  user_id?: string
  match_id?: number
  region?: string
  share_type: string
  image_key?: string
  created_at: string
}

// ============================================================
// Enriched data types for frontend display
// ============================================================

export interface EnrichedMatch extends Match {
  home_team_name: string
  away_team_name: string
  home_team_elo: number
  away_team_elo: number
}

// ============================================================
// Helper functions
// ============================================================

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

export function cn(...inputs: import('clsx').ClassValue[]) {
  return import('tailwind-merge').then(m => m.twMerge(import('clsx').clsx(...inputs)))
}
