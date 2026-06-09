// SportMind AI - Frontend App
const API = '/api';

async function apiGet(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Format UTC to local time
function fmtTime(utc) {
  if (!utc) return '';
  const d = new Date(utc);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Status badge HTML
function statusBadge(status) {
  const cls = status === 'LIVE' || status === 'HT' ? 'status-live' : status === 'FT' ? 'status-finished' : 'status-upcoming';
  return `<span class="match-status ${cls}">${status || 'SCHEDULED'}</span>`;
}

// Team flag placeholder
function teamFlag(name) {
  const initials = name ? name.substring(0, 2).toUpperCase() : '??';
  return `<div class="match-team-flag">${initials}</div>`;
}

// Render match card
function matchCard(m) {
  return `
    <a href="/match.html?id=${m.id}" class="card match-card fade-in">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <span class="match-stage">${m.stage || ''}</span>
        ${statusBadge(m.status)}
      </div>
      <div class="match-teams">
        <div class="match-team">
          ${teamFlag(m.home_team)}
          <div class="match-team-name">${m.home_team || 'TBD'}</div>
          ${m.home_elo ? `<div class="match-team-elo">Elo ${m.home_elo}</div>` : ''}
        </div>
        <div class="match-vs">${m.home_score != null ? `${m.home_score} - ${m.away_score}` : 'VS'}</div>
        <div class="match-team">
          ${teamFlag(m.away_team)}
          <div class="match-team-name">${m.away_team || 'TBD'}</div>
          ${m.away_elo ? `<div class="match-team-elo">Elo ${m.away_elo}</div>` : ''}
        </div>
      </div>
      <div class="match-info">
        <span>🕐 ${fmtTime(m.kickoff_utc)}</span>
        <span>📍 ${m.venue || 'TBD'}</span>
      </div>
    </a>`;
}

// Init home page
async function initHome() {
  const grid = document.getElementById('upcoming-matches');
  if (!grid) return;
  try {
    const matches = await apiGet('/matches');
    const upcoming = matches.filter(m => m.status === 'SCHEDULED').slice(0, 12);
    grid.innerHTML = upcoming.map(matchCard).join('');
  } catch (e) {
    grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;padding:40px;">Failed to load matches</p>';
  }
}

// Init matches page
async function initMatches() {
  const container = document.getElementById('all-matches');
  if (!container) return;
  try {
    const matches = await apiGet('/matches');
    const groups = {};
    matches.forEach(m => {
      const g = m.home_group || 'Z';
      if (!groups[g]) groups[g] = [];
      groups[g].push(m);
    });
    let html = '';
    Object.keys(groups).sort().forEach(g => {
      html += `<section class="section fade-in"><h2 style="margin-bottom:16px;">Group ${g}</h2><div class="matches-grid">`;
      groups[g].forEach(m => { html += matchCard(m); });
      html += '</div></section>';
    });
    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px;">Failed to load matches</p>';
  }
}

// Init teams page
async function initTeams() {
  const container = document.getElementById('all-teams');
  if (!container) return;
  try {
    const teams = await apiGet('/teams');
    const groups = {};
    teams.forEach(t => {
      if (!groups[t.group_letter]) groups[t.group_letter] = [];
      groups[t.group_letter].push(t);
    });
    let html = '';
    Object.keys(groups).sort().forEach(g => {
      html += `<div class="card fade-in" style="margin-bottom:16px;"><h3 style="font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:12px;">Group ${g}</h3>`;
      groups[g].forEach(t => {
        html += `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">`;
        html += `<div><span style="font-weight:600;">${t.name}</span> <span style="color:var(--text-muted);font-size:13px;">${t.name_cn || ''}</span></div>`;
        html += `<div style="display:flex;gap:16px;font-size:13px;color:var(--text-muted);">`;
        html += `<span>FIFA #${t.fifa_rank || '-'}</span>`;
        html += `<span>Elo ${t.elo_rating}</span>`;
        html += `<span>€${(t.total_value_million / 1000).toFixed(1)}B</span>`;
        html += `</div></div>`;
      });
      html += `</div>`;
    });
    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px;">Failed to load teams</p>';
  }
}

// Init match detail
async function initMatchDetail() {
  const container = document.getElementById('match-detail');
  if (!container) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { container.innerHTML = '<div style="text-align:center;padding:60px;"><h2>No match ID</h2></div>'; return; }
  try {
    const m = await apiGet(`/matches/${id}`);
    container.innerHTML = `
      <div class="fade-in">
        <div class="card" style="padding:32px;margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <span class="match-stage">${m.stage}</span>
            ${statusBadge(m.status)}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;">
            <div style="flex:1;text-align:center;">
              ${teamFlag(m.home_team)}
              <h2 style="font-size:22px;font-weight:800;margin-top:8px;">${m.home_team}</h2>
              <p style="font-size:13px;color:var(--text-muted);">FIFA #${m.home_fifa_rank || '-'} · Elo ${m.home_elo}</p>
            </div>
            <div style="text-align:center;padding:0 24px;">
              <div style="font-size:42px;font-weight:900;font-family:monospace;">${m.home_score ?? '-'} : ${m.away_score ?? '-'}</div>
              <div style="font-size:14px;color:var(--text-muted);margin-top:8px;">${fmtTime(m.kickoff_utc)}</div>
            </div>
            <div style="flex:1;text-align:center;">
              ${teamFlag(m.away_team)}
              <h2 style="font-size:22px;font-weight:800;margin-top:8px;">${m.away_team}</h2>
              <p style="font-size:13px;color:var(--text-muted);">FIFA #${m.away_fifa_rank || '-'} · Elo ${m.away_elo}</p>
            </div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
          ${teamStatsCard(m.home_team, m.home_value, m.home_elo, m.home_fifa_rank)}
          ${teamStatsCard(m.away_team, m.away_value, m.away_elo, m.away_fifa_rank)}
        </div>
        <div class="card" style="margin-bottom:20px;">
          <h3 style="font-size:18px;font-weight:700;margin-bottom:12px;">✨ AI Match Intelligence</h3>
          <div id="ai-content"><p style="color:var(--text-muted);">AI analysis will appear here once generated.</p></div>
        </div>
      </div>`;
    // Load AI report
    try {
      const ai = await apiGet(`/ai/${id}`);
      document.getElementById('ai-content').innerHTML = `<div style="line-height:1.8;">${ai.report_text.replace(/\n/g, '<br>')}</div>`;
    } catch (e) { /* no report yet */ }
  } catch (e) {
    container.innerHTML = '<div style="text-align:center;padding:60px;"><h2>Match not found</h2></div>';
  }
}

function teamStatsCard(name, value, elo, rank) {
  return `<div class="card"><h4 style="font-weight:700;margin-bottom:12px;">${name}</h4>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div style="background:rgba(255,255,255,0.02);padding:12px;border-radius:8px;">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">FIFA Rank</div>
        <div style="font-size:20px;font-weight:800;">#${rank || '-'}</div>
      </div>
      <div style="background:rgba(255,255,255,0.02);padding:12px;border-radius:8px;">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">Elo Rating</div>
        <div style="font-size:20px;font-weight:800;">${elo || '-'}</div>
      </div>
      <div style="background:rgba(255,255,255,0.02);padding:12px;border-radius:8px;">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">Squad Value</div>
        <div style="font-size:20px;font-weight:800;">€${value ? (value/1000).toFixed(1) : '-'}B</div>
      </div>
    </div></div>`;
}

// Init leaderboard
async function initLeaderboard() {
  const tbody = document.querySelector('#leaderboard-table tbody');
  if (!tbody) return;
  try {
    const data = await apiGet('/leaderboard');
    tbody.innerHTML = data.map(u => `
      <tr>
        <td style="font-weight:700;color:var(--text-muted);">#${u.rank}</td>
        <td style="font-weight:600;">${u.display_name}</td>
        <td style="font-weight:700;color:var(--primary);">${u.total_points}</td>
        <td style="color:var(--text-muted);">${u.correct_predictions || 0}</td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:40px;">No data yet. Be the first to predict!</td></tr>';
  }
}

// Auto-init based on page
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('upcoming-matches')) initHome();
  if (document.getElementById('all-matches')) initMatches();
  if (document.getElementById('all-teams')) initTeams();
  if (document.getElementById('match-detail')) initMatchDetail();
  if (document.getElementById('leaderboard-table')) initLeaderboard();
});
