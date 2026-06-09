// SportMind AI - Hono API (Cloudflare Pages Functions)
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/cloudflare-pages';

type Bindings = {
  DB: D1Database;
  CACHE: KVNamespace;
  R2_STORE: R2Bucket;
  SCORING_QUEUE: Queue;
  AI_REPORT_QUEUE: Queue;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use('*', cors());

app.get('/api/health', (c) => c.json({ ok: true, time: new Date().toISOString() }));

// === TEAMS ===
app.get('/api/teams', async (c) => {
  const cacheKey = 'teams:all';
  const cached = await c.env.CACHE.get(cacheKey, 'json');
  if (cached) return c.json(cached);

  const { results } = await c.env.DB.prepare(
    `SELECT id, name, name_cn, group_letter, fifa_rank, elo_rating, 
            total_value_million, avg_age, core_player, recent_form 
     FROM teams ORDER BY group_letter, fifa_rank`
  ).all();
  await c.env.CACHE.put(cacheKey, JSON.stringify(results), { expirationTtl: 3600 });
  return c.json(results);
});

app.get('/api/teams/:id', async (c) => {
  const id = c.req.param('id');
  const team = await c.env.DB.prepare('SELECT * FROM teams WHERE id = ?').bind(id).first();
  return team ? c.json(team) : c.json({ error: 'not found' }, 404);
});

// === MATCHES ===
app.get('/api/matches', async (c) => {
  const stage = c.req.query('stage');
  const group = c.req.query('group');
  const cacheKey = `matches:${stage || 'all'}:${group || 'all'}`;
  const cached = await c.env.CACHE.get(cacheKey, 'json');
  if (cached) return c.json(cached);

  let sql = `SELECT m.id, m.match_date, m.kickoff_utc, m.stage, m.status, m.home_score, m.away_score, 
                    m.is_finished, m.venue, t1.name as home_team, t1.elo_rating as home_elo, 
                    t2.name as away_team, t2.elo_rating as away_elo
             FROM matches m 
             LEFT JOIN teams t1 ON m.home_team_id = t1.id 
             LEFT JOIN teams t2 ON m.away_team_id = t2.id WHERE 1=1`;
  const params: any[] = [];
  if (stage) { sql += ' AND m.stage = ?'; params.push(stage); }
  if (group) { sql += ' AND t1.group_letter = ?'; params.push(group); }
  sql += ' ORDER BY m.kickoff_utc ASC';

  const { results } = await c.env.DB.prepare(sql).bind(...params).all();
  await c.env.CACHE.put(cacheKey, JSON.stringify(results), { expirationTtl: 300 });
  return c.json(results);
});

app.get('/api/matches/live', async (c) => {
  const cached = await c.env.CACHE.get('matches:live', 'json');
  if (cached) return c.json(cached);
  const { results } = await c.env.DB.prepare(
    `SELECT m.*, t1.name as home_team, t2.name as away_team 
     FROM matches m LEFT JOIN teams t1 ON m.home_team_id = t1.id 
     LEFT JOIN teams t2 ON m.away_team_id = t2.id 
     WHERE m.status IN ('LIVE','HT') ORDER BY m.kickoff_utc`
  ).all();
  await c.env.CACHE.put('matches:live', JSON.stringify(results), { expirationTtl: 30 });
  return c.json(results);
});

app.get('/api/matches/:id', async (c) => {
  const id = c.req.param('id');
  const cached = await c.env.CACHE.get(`match:${id}`, 'json');
  if (cached) return c.json(cached);
  const match = await c.env.DB.prepare(
    `SELECT m.*, t1.name as home_team, t1.elo_rating as home_elo, t1.fifa_rank as home_fifa_rank,
            t1.total_value_million as home_value, t2.name as away_team, t2.elo_rating as away_elo,
            t2.fifa_rank as away_fifa_rank, t2.total_value_million as away_value
     FROM matches m LEFT JOIN teams t1 ON m.home_team_id = t1.id 
     LEFT JOIN teams t2 ON m.away_team_id = t2.id WHERE m.id = ?`
  ).bind(id).first();
  if (!match) return c.json({ error: 'not found' }, 404);
  await c.env.CACHE.put(`match:${id}`, JSON.stringify(match), { expirationTtl: 30 });
  return c.json(match);
});

// === LEADERBOARD ===
app.get('/api/leaderboard', async (c) => {
  const cached = await c.env.CACHE.get('leaderboard:top_100', 'json');
  if (cached) return c.json(cached);
  const { results } = await c.env.DB.prepare(
    `SELECT u.id, u.display_name, us.total_points, us.correct_predictions, 
            DENSE_RANK() OVER (ORDER BY us.total_points DESC) as rank
     FROM users u JOIN user_scores us ON u.id = us.user_id 
     ORDER BY us.total_points DESC LIMIT 100`
  ).all();
  await c.env.CACHE.put('leaderboard:top_100', JSON.stringify(results), { expirationTtl: 300 });
  return c.json(results);
});

// === PREDICTIONS ===
app.post('/api/predictions', async (c) => {
  const { user_id, match_id, home_score, away_score } = await c.req.json();
  const match = await c.env.DB.prepare('SELECT kickoff_utc FROM matches WHERE id = ?').bind(match_id).first() as any;
  if (!match) return c.json({ error: 'match not found' }, 404);
  const deadline = new Date(new Date(match.kickoff_utc).getTime() - 5 * 60000);
  if (new Date() > deadline) return c.json({ error: 'prediction closed' }, 403);
  try {
    await c.env.DB.prepare(
      'INSERT INTO predictions (user_id, match_id, home_score, away_score) VALUES (?, ?, ?, ?)'
    ).bind(user_id, match_id, home_score, away_score).run();
    return c.json({ success: true });
  } catch (e: any) {
    if (e + '' .includes('UNIQUE')) return c.json({ error: 'already predicted' }, 409);
    throw e;
  }
});

// === AI REPORT ===
app.get('/api/ai/:matchId', async (c) => {
  const matchId = c.req.param('matchId');
  const cached = await c.env.CACHE.get(`ai_report:${matchId}`, 'json');
  if (cached) return c.json(cached);
  const report = await c.env.DB.prepare(
    'SELECT * FROM ai_reports WHERE match_id = ? ORDER BY created_at DESC LIMIT 1'
  ).bind(matchId).first();
  if (report) await c.env.CACHE.put(`ai_report:${matchId}`, JSON.stringify(report), { expirationTtl: 3600 });
  return report ? c.json(report) : c.json({ error: 'no report yet' }, 404);
});

app.all('*', (c) => c.json({ error: 'not found' }, 404));

export const onRequest = handle(app);
