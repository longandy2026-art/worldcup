// Cloudflare Worker: Score Sync Cron
// Deploy separately to Workers with Cron trigger: */10 * * * *
// This worker scrapes Wikipedia for 2026 World Cup scores and updates Supabase

export default {
  async fetch(request, env, ctx) {
    return await handleSync(env)
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(handleSync(env))
  },
}

async function handleSync(env) {
  const SUPABASE_URL = env.SUPABASE_URL
  const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

  try {
    // 1. Fetch Wikipedia page
    const wikiRes = await fetch('https://en.wikipedia.org/wiki/2026_FIFA_World_Cup', {
      headers: { 'User-Agent': 'SportMind-AI/1.0' },
      cf: { cacheTtl: 60 },
    })
    const html = await wikiRes.text()

    // 2. Parse scores from HTML tables
    // Wikipedia uses en-dash (–) between scores
    const updates = parseScoresFromHTML(html)

    if (updates.length === 0) {
      return new Response(JSON.stringify({ message: 'No new scores found', updated: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 3. Update Supabase for each match
    let updatedCount = 0
    for (const u of updates) {
      // Find match by team names (fuzzy)
      const { data: rows } = await supabaseQuery(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'matches', {
        select: 'id',
        home_team: `ilike.*${u.home}*`,
        away_team: `ilike.*${u.away}*`,
        is_finished: 'eq.false',
        limit: 1,
      })

      if (rows && rows.length > 0) {
        const matchId = rows[0].id
        await supabaseUpdate(SUPABASE_URL, SUPABASE_SERVICE_KEY, 'matches', matchId, {
          home_score: u.homeScore,
          away_score: u.awayScore,
          status: 'FINISHED',
          is_finished: true,
        })
        updatedCount++
      }
    }

    return new Response(JSON.stringify({ success: true, updated: updatedCount, matches: updates }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

function parseScoresFromHTML(html) {
  const updates = []
  // Match rows in Wikipedia group tables
  // Example: <tr>...<td>Team A</td><td>2–1</td><td>Team B</td>...</tr>
  const rowRegex = /<tr[^>]*>[\s\S]*?<td[^>]*>([^<]{2,40})<\/td>[\s\S]*?<td[^>]*>(\d+)[–\-](\d+)<\/td>[\s\S]*?<td[^>]*>([^<]{2,40})<\/td>[\s\S]*?<\/tr>/g

  let m
  while ((m = rowRegex.exec(html)) !== null) {
    updates.push({
      home: cleanText(m[1]),
      away: cleanText(m[4]),
      homeScore: parseInt(m[2]),
      awayScore: parseInt(m[3]),
    })
  }

  // Deduplicate
  const seen = new Set()
  return updates.filter(u => {
    const key = `${u.home}|${u.away}|${u.homeScore}|${u.awayScore}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function cleanText(str) {
  return str.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
}

// Supabase REST helpers
async function supabaseQuery(url, key, table, params) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => search.set(k, String(v)))
  const res = await fetch(`${url}/rest/v1/${table}?${search}`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
    },
  })
  return res.json()
}

async function supabaseUpdate(url, key, table, id, data) {
  await fetch(`${url}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(data),
  })
}
