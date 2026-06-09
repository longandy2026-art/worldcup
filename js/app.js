// SportMind AI - Static Site App Logic
const SUPABASE_URL = 'https://oswdraakvtcyaiwukflv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zd2RyYWFrdnRjeWFpd3VrZmx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDQ4OTUsImV4cCI6MjA5NjU4MDg5NX0.mn6C2JpvKPJwXbxBL0Vpa-cOmbzhu_UbTVyA1tri7jQ';
const DEEPSEEK_API_KEY = 'sk-91c775ce9e6f497d863665101fa0d293';

let appData = null;

// Load data
async function loadData() {
  if (appData) return appData;
  const res = await fetch('data.json');
  appData = await res.json();
  return appData;
}

// Get team by name
function getTeam(name) {
  return appData.teams.find(t => t.name === name);
}

// Get match by id
function getMatch(id) {
  return appData.matches.find(m => m.id === id);
}

// Render match detail page
async function renderMatchDetail(matchId) {
  await loadData();
  const match = getMatch(matchId);
  if (!match) {
    document.getElementById('match-detail').innerHTML = '<div class="text-center" style="padding:60px;"><h2>Match not found</h2></div>';
    return;
  }

  const home = getTeam(match.home_team);
  const away = getTeam(match.away_team);

  const html = `
    <div class="fade-in">
      <!-- Match Header -->
      <div class="card" style="padding:32px;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <span class="match-stage">${match.group} · ${match.stage}</span>
          <span style="font-size:13px;color:var(--text-muted);">🕐 ${match.beijing_time}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;">
          <div style="flex:1;text-align:center;">
            <div class="match-team-flag" style="width:80px;height:80px;font-size:28px;margin:0 auto 12px;">${match.home_team.slice(0,2)}</div>
            <h2 style="font-size:22px;font-weight:800;">${match.home_team}</h2>
            <p style="font-size:13px;color:var(--text-muted);">FIFA Rank #${home?.fifa_rank || '-'}</p>
          </div>
          <div style="text-align:center;padding:0 24px;">
            <div style="font-size:42px;font-weight:900;font-family:monospace;color:#fff;">${match.home_score ?? '-'} : ${match.away_score ?? '-'}</div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:8px;">${match.beijing_time}</div>
          </div>
          <div style="flex:1;text-align:center;">
            <div class="match-team-flag" style="width:80px;height:80px;font-size:28px;margin:0 auto 12px;">${match.away_team.slice(0,2)}</div>
            <h2 style="font-size:22px;font-weight:800;">${match.away_team}</h2>
            <p style="font-size:13px;color:var(--text-muted);">FIFA Rank #${away?.fifa_rank || '-'}</p>
          </div>
        </div>
        <div style="display:flex;justify-content:center;gap:24px;margin-top:20px;font-size:13px;color:var(--text-muted);">
          <span>📍 ${match.venue}</span>
          <span>🏙️ ${match.city}</span>
        </div>
      </div>

      <!-- Team Stats -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
        ${renderTeamStats(home, 'left')}
        ${renderTeamStats(away, 'right')}
      </div>

      <!-- AI Report -->
      <div class="card ai-report" style="margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="font-size:18px;font-weight:700;display:flex;align-items:center;gap:8px;">✨ AI Match Intelligence</h3>
          <button id="ai-btn" class="btn btn-primary" style="padding:8px 16px;font-size:13px;" onclick="generateAIReport(${matchId}, '${match.home_team}', '${match.away_team}')">
            ✨ Generate Report
          </button>
        </div>
        <div id="ai-content">
          <p style="color:var(--text-muted);font-size:14px;">Click the button above to generate an AI-powered match analysis using DeepSeek V4.</p>
        </div>
      </div>

      <!-- Prediction Form -->
      <div class="card" style="margin-bottom:20px;">
        <h3 style="font-size:18px;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px;">🎯 Make Your Prediction</h3>
        <form id="pred-form" onsubmit="submitPrediction(event, ${matchId}, '${match.home_team}', '${match.away_team}')" style="display:flex;flex-wrap:wrap;align-items:end;gap:12px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:14px;color:var(--text-muted);width:80px;">${match.home_team}</span>
            <input type="number" name="home" min="0" max="20" value="" required style="width:64px;text-align:center;">
          </div>
          <span style="color:var(--text-muted);font-weight:800;">-</span>
          <div style="display:flex;align-items:center;gap:8px;">
            <input type="number" name="away" min="0" max="20" value="" required style="width:64px;text-align:center;">
            <span style="font-size:14px;color:var(--text-muted);width:80px;text-align:right;">${match.away_team}</span>
          </div>
          <button type="submit" class="btn btn-primary" style="padding:10px 20px;font-size:14px;">🎯 Submit</button>
        </form>
        <div id="pred-result" style="margin-top:12px;"></div>
      </div>

      <!-- Share -->
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:48px;">
        <button class="btn btn-secondary" style="padding:8px 16px;font-size:13px;" onclick="shareMatch('${match.home_team}', '${match.away_team}')">🔗 Share</button>
        <button class="btn btn-primary" style="padding:8px 16px;font-size:13px;" onclick="savePoster('${match.home_team}', '${match.away_team}')">💾 Save Poster</button>
      </div>
    </div>
  `;

  document.getElementById('match-detail').innerHTML = html;
}

function renderTeamStats(team, side) {
  if (!team) return '<div class="card">Team data not available</div>';
  const border = side === 'left' ? 'border-left:4px solid var(--primary);' : 'border-right:4px solid var(--accent);';
  return `
    <div class="card" style="${border}padding:20px;">
      <h3 style="font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
        <span style="color:${side === 'left' ? 'var(--primary)' : 'var(--accent)'};">🛡️</span> ${team.name} Profile
      </h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div style="background:rgba(255,255,255,0.02);padding:12px;border-radius:8px;">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">Elo Rating</div>
          <div style="font-size:20px;font-weight:800;color:#fff;">${team.elo_rating}</div>
        </div>
        <div style="background:rgba(255,255,255,0.02);padding:12px;border-radius:8px;">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">Squad Value</div>
          <div style="font-size:20px;font-weight:800;color:#fff;">€${team.total_value}M</div>
        </div>
        <div style="background:rgba(255,255,255,0.02);padding:12px;border-radius:8px;">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">Avg Age</div>
          <div style="font-size:20px;font-weight:800;color:#fff;">${team.avg_age}</div>
        </div>
        <div style="background:rgba(255,255,255,0.02);padding:12px;border-radius:8px;">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">Recent Form</div>
          <div style="font-size:16px;font-weight:700;color:var(--primary);">${team.recent_form}</div>
        </div>
      </div>
      <div style="margin-top:12px;font-size:13px;color:var(--text-muted);">
        <span style="color:var(--text-muted);">Core Player:</span> ${team.core_player}
      </div>
    </div>
  `;
}

// Generate AI Report
async function generateAIReport(matchId, homeTeam, awayTeam) {
  const btn = document.getElementById('ai-btn');
  const content = document.getElementById('ai-content');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width:16px;height:16px;display:inline-block;vertical-align:middle;margin-right:6px;"></span> Analyzing...';
  content.innerHTML = '<div class="ai-loading"><div class="spinner"></div><span>DeepSeek V4 is analyzing team data, form, and tactical matchups...</span></div>';

  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: 'You are SportMind AI, a world-class football tactical analyst. Analyze the upcoming match using data-driven insights. Include: team comparison (Elo, form, squad value), tactical breakdown, score prediction with confidence level. Keep it sharp, professional, and under 600 words.' },
          { role: 'user', content: `Generate an AI match intelligence report for ${homeTeam} vs ${awayTeam} (Match #${matchId}). Use the 2026 World Cup context. Provide specific data points and a score prediction.` }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    const report = json.choices?.[0]?.message?.content || 'Report generation failed.';

    content.innerHTML = `<div class="ai-report-content">${report.replace(/\n/g, '<br>')}</div>`;
    btn.innerHTML = '✨ Regenerate';
    btn.disabled = false;
  } catch (e) {
    content.innerHTML = `<p style="color:#ef4444;">Error: ${e.message}. Please try again later.</p>`;
    btn.innerHTML = '✨ Retry';
    btn.disabled = false;
  }
}

// Submit Prediction
function submitPrediction(e, matchId, homeTeam, awayTeam) {
  e.preventDefault();
  const form = e.target;
  const homeScore = parseInt(form.home.value);
  const awayScore = parseInt(form.away.value);

  if (isNaN(homeScore) || isNaN(awayScore)) return;

  // Store in localStorage (MVP simplified)
  const key = `pred_${matchId}`;
  const predictions = JSON.parse(localStorage.getItem('predictions') || '[]');
  predictions.push({ matchId, homeTeam, awayTeam, homeScore, awayScore, timestamp: Date.now() });
  localStorage.setItem('predictions', JSON.stringify(predictions));
  localStorage.setItem(key, JSON.stringify({ homeScore, awayScore }));

  document.getElementById('pred-result').innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;color:var(--primary);padding:12px;background:rgba(16,185,129,0.1);border-radius:8px;">
      <span>✅</span>
      <span style="font-weight:600;">Prediction submitted! ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}</span>
    </div>
  `;
  form.reset();
}

// Share Match
function shareMatch(home, away) {
  const text = `I just predicted ${home} vs ${away} on SportMind AI! 🏆 Check out the AI match intelligence →`;
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title: 'SportMind AI', text, url });
  } else {
    navigator.clipboard.writeText(text + ' ' + url);
    alert('Link copied to clipboard!');
  }
}

// Save Poster (simple text-based)
function savePoster(home, away) {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0b1120';
  ctx.fillRect(0, 0, 800, 400);

  // Border
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, 760, 360);

  // Title
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.fillText('SPORTMIND AI', 60, 70);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 36px Inter, sans-serif';
  ctx.fillText('2026 WORLD CUP', 60, 110);

  // Teams
  ctx.font = 'bold 48px Inter, sans-serif';
  ctx.fillText(home.slice(0, 3).toUpperCase(), 200, 220);
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('VS', 370, 220);
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(away.slice(0, 3).toUpperCase(), 480, 220);

  // Footer
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px Inter, sans-serif';
  ctx.fillText('AI-Powered Match Intelligence · sportmind.ai', 60, 340);

  // Download
  const link = document.createElement('a');
  link.download = `sportmind-${home}-vs-${away}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

console.log('SportMind AI app loaded');
