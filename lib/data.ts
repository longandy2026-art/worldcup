// Static data module for SportMind AI MVP
// Data is loaded from Supabase in production, these are fallbacks

export interface Match {
  id: number
  date: string
  beijing_time: string
  home_team: string
  away_team: string
  venue: string
  city: string
  stage: string
  group: string
  home_score: number | null
  away_score: number | null
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED'
}

export interface Team {
  rank: number
  name: string
  group: string
  continent: string
  fifa_rank: number | null
  elo_rating: number | null
  total_value: number | null
  player_count: number
  avg_age: number | null
  core_player: string | null
  recent_form: string | null
}

export interface Player {
  id: number
  name: string
  nationality: string
  group: string
  position: string
  age: number | null
  club: string | null
  value: number | null
}

export interface Scorer {
  rank: number
  name: string
  nationality: string
  predicted_goals: number
}

export interface GroupTeam {
  rank: number
  team: string
  points: number
  qualify_prob: number
}

// Empty arrays - data loaded from Supabase
export const MATCHES: Match[] = []
export const TEAMS: Team[] = []
export const PLAYERS: Player[] = []
export const SCORERS: Scorer[] = []
export const GROUPS: Record<string, GroupTeam[]> = {}

export function getMatchById(id: number): Match | undefined {
  return MATCHES.find(m => m.id === id)
}

export function getTeamByName(name: string): Team | undefined {
  return TEAMS.find(t => t.name === name)
}

export function getMatchesByDate(): Record<string, Match[]> {
  const map: Record<string, Match[]> = {}
  MATCHES.forEach(m => {
    const d = m.date || 'Unknown'
    if (!map[d]) map[d] = []
    map[d].push(m)
  })
  return map
}

export function getGroupMatches(group: string): Match[] {
  return MATCHES.filter(m => m.group === group)
}

export function getTeamPlayers(teamName: string): Player[] {
  return PLAYERS.filter(p => p.nationality === teamName)
}

export function getTeamMatches(teamName: string): Match[] {
  return MATCHES.filter(m => m.home_team === teamName || m.away_team === teamName)
}

export const GROUP_ORDER = [
  'Group A','Group B','Group C','Group D',
  'Group E','Group F','Group G','Group H',
  'Group I','Group J','Group K','Group L'
]
