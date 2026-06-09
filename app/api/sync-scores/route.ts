import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Wikipedia 2026 World Cup match results scraper
// This runs as a Cloudflare Pages Function (or Worker Cron)
export async function POST() {
  try {
    // Fetch Wikipedia page
    const wikiRes = await fetch('https://en.wikipedia.org/wiki/2026_FIFA_World_Cup', {
      headers: { 'User-Agent': 'SportMind-AI/1.0 (research bot)' },
    })
    const html = await wikiRes.text()

    // Simple regex extraction for match scores (Wikipedia tables)
    // Format: Team A 2–1 Team B (en-dash or hyphen)
    const scoreRegex = /<td[^>]*>\s*([^<]{3,50})\s*<\/td>\s*<td[^>]*>\s*(\d+)[–\-](\d+)\s*<\/td>\s*<td[^>]*>\s*([^<]{3,50})\s*<\/td>/g

    const updates: Array<{ home: string; away: string; homeScore: number; awayScore: number }> = []
    let match
    while ((match = scoreRegex.exec(html)) !== null) {
      updates.push({
        home: match[1].trim(),
        away: match[4].trim(),
        homeScore: parseInt(match[2]),
        awayScore: parseInt(match[3]),
      })
    }

    // Fallback: if no regex matches, try a broader search for known team names + scores
    if (updates.length === 0) {
      // For MVP, return empty and log
      return NextResponse.json({ message: 'No finished matches found on Wikipedia yet', updates: [] })
    }

    // Update Supabase matches table
    for (const u of updates) {
      const { data: matchRows } = await supabaseAdmin
        .from('matches')
        .select('id')
        .ilike('home_team', `%${u.home}%`)
        .ilike('away_team', `%${u.away}%`)
        .eq('is_finished', false)
        .limit(1)

      if (matchRows && matchRows.length > 0) {
        const matchId = matchRows[0].id
        await supabaseAdmin
          .from('matches')
          .update({
            home_score: u.homeScore,
            away_score: u.awayScore,
            status: 'FINISHED',
            is_finished: true,
          })
          .eq('id', matchId)

        // Trigger points settlement
        await settlePoints(matchId, u.homeScore, u.awayScore)
      }
    }

    return NextResponse.json({ success: true, updated: updates.length, updates })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

async function settlePoints(matchId: number, homeScore: number, awayScore: number) {
  const { data: predictions } = await supabaseAdmin
    .from('predictions')
    .select('*')
    .eq('match_id', matchId)
    .eq('points_earned', 0)

  if (!predictions) return

  for (const p of predictions) {
    const ph = p.predicted_home_score
    const pa = p.predicted_away_score
    let points = 0

    if (ph === homeScore && pa === awayScore) {
      points = 10 // Exact score
    } else if ((ph - pa) === (homeScore - awayScore)) {
      points = 5 // Correct goal difference
    } else if (Math.sign(ph - pa) === Math.sign(homeScore - awayScore)) {
      points = 3 // Correct result
    }

    if (points > 0) {
      await supabaseAdmin
        .from('predictions')
        .update({ points_earned: points })
        .eq('id', p.id)

      // Update user total_points
      await supabaseAdmin.rpc('increment_user_points', {
        user_id: p.user_id,
        points,
      })
    }
  }
}
