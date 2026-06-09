-- SportMind AI D1 Database Schema (SQLite)

CREATE TABLE teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    name_cn TEXT,
    group_letter TEXT NOT NULL,
    fifa_rank INTEGER,
    elo_rating INTEGER NOT NULL DEFAULT 1500,
    total_value_million REAL,
    avg_age REAL,
    core_player TEXT,
    recent_form TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_teams_group ON teams(group_letter);

CREATE TABLE matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_date TEXT NOT NULL,
    kickoff_utc TEXT NOT NULL,
    home_team_id INTEGER REFERENCES teams(id),
    away_team_id INTEGER REFERENCES teams(id),
    venue TEXT,
    stage TEXT NOT NULL DEFAULT 'Group Stage',
    home_score INTEGER DEFAULT NULL,
    away_score INTEGER DEFAULT NULL,
    status TEXT DEFAULT 'SCHEDULED',
    score_source TEXT DEFAULT NULL,
    is_finished INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_matches_date ON matches(kickoff_utc);
CREATE INDEX idx_matches_stage ON matches(stage, kickoff_utc);
CREATE INDEX idx_matches_status ON matches(status);

CREATE TABLE players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    team_id INTEGER NOT NULL REFERENCES teams(id),
    position TEXT,
    age INTEGER,
    club TEXT,
    value_million REAL,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_players_team ON players(team_id);

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    preferred_lang TEXT DEFAULT 'en',
    created_at TEXT DEFAULT (datetime('now')),
    last_login_at TEXT
);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    refresh_token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);

CREATE TABLE predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id),
    match_id INTEGER NOT NULL REFERENCES matches(id),
    home_score INTEGER NOT NULL CHECK (home_score >= 0),
    away_score INTEGER NOT NULL CHECK (away_score >= 0),
    points INTEGER DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, match_id)
);
CREATE INDEX idx_prediction_user ON predictions(user_id);
CREATE INDEX idx_prediction_match ON predictions(match_id);

CREATE TABLE user_scores (
    user_id TEXT PRIMARY KEY REFERENCES users(id),
    total_points INTEGER DEFAULT 0,
    correct_predictions INTEGER DEFAULT 0,
    perfect_predictions INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE ai_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL REFERENCES matches(id),
    report_type TEXT NOT NULL,
    model_used TEXT NOT NULL,
    report_text TEXT NOT NULL,
    confidence_score REAL,
    retry_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(match_id, report_type)
);

CREATE TABLE score_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL REFERENCES matches(id),
    home_score INTEGER NOT NULL,
    away_score INTEGER NOT NULL,
    minute INTEGER,
    source TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_snapshot_match ON score_snapshots(match_id, created_at);

CREATE TABLE crawler_heartbeat (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    last_success_at TEXT NOT NULL,
    last_error_at TEXT,
    last_error_message TEXT,
    consecutive_failures INTEGER DEFAULT 0
);

CREATE TABLE admin_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    payload TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_admin_logs_time ON admin_logs(created_at);

CREATE TABLE share_images (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    r2_key TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inviter_id TEXT NOT NULL,
    invited_id TEXT NOT NULL,
    reward_points INTEGER DEFAULT 10,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(invited_id)
);

CREATE TABLE badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id),
    badge_type TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, badge_type)
);
