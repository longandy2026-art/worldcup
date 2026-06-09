import { createClient } from '@supabase/supabase-js'
import data from '../lib/data.json'

const url = process.env.SUPABASE_URL || 'https://oswdraakvtcyaiwukflv.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(url, key)

async function importData() {
  console.log('Importing teams...')
  const teams = data.teams.map((t: any) => ({
    name: t.name,
    name_cn: t.name,
    group_letter: t.group,
    continent: t.continent,
    fifa_rank: t.fifa_rank,
    elo_rating: t.elo_rating,
    total_value_million: t.total_value,
    player_count: t.player_count || 26,
    avg_age: t.avg_age,
    core_player: t.core_player,
    recent_form: t.recent_form,
  }))

  const { error: teamsError } = await supabase.from('teams').upsert(teams, { onConflict: 'name' })
  if (teamsError) console.error('Teams error:', teamsError)
  else console.log(`✅ ${teams.length} teams imported`)

  console.log('Importing matches...')
  const matches = data.matches.map((m: any) => ({
    id: m.id,
    match_date: m.date,
    kickoff_utc: new Date('2026-06-12T00:00:00Z'), // placeholder
    home_team: m.home_team,
    away_team: m.away_team,
    venue: m.venue,
    city: m.city,
    stage: m.stage,
    group_stage: m.group,
    status: 'SCHEDULED',
    is_finished: false,
  }))

  const { error: matchesError } = await supabase.from('matches').upsert(matches, { onConflict: 'id' })
  if (matchesError) console.error('Matches error:', matchesError)
  else console.log(`✅ ${matches.length} matches imported`)

  console.log('Importing players...')
  const players = data.players.map((p: any) => ({
    id: p.id,
    name: p.name,
    nationality: p.nationality,
    position: p.position,
    age: p.age,
    club: p.club,
    value_million: p.value,
  }))

  const { error: playersError } = await supabase.from('players').upsert(players, { onConflict: 'id' })
  if (playersError) console.error('Players error:', playersError)
  else console.log(`✅ ${players.length} players imported`)

  console.log('Done!')
}

importData().catch(console.error)
