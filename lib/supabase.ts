import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder') && supabaseAnonKey && !supabaseAnonKey.includes('placeholder')

// Safe client — returns a proxy that throws on usage if not configured,
// but doesn't crash during module import (build-time safe)
function createSafeClient(url: string, key: string, options?: any): SupabaseClient {
  if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
    // Return a proxy that throws on actual usage but is safe to import
    return new Proxy({} as SupabaseClient, {
      get(_, prop) {
        return () => {
          throw new Error(`Supabase not configured. Missing env vars. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.`)
        }
      }
    }) as SupabaseClient
  }
  return createClient(url, key, options)
}

// Browser/client-side Supabase client
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createSafeClient(supabaseUrl, supabaseAnonKey)

// Server-side admin client (service role key) — only for server-side API routes
export const supabaseAdmin = isConfigured
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  : createSafeClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

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
