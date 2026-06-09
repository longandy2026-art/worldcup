-- ============================================================
-- SportMind AI MVP — Supabase Schema v3
-- Run in Supabase SQL Editor
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_stats ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 1. Static Data Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    name_cn VARCHAR(50),
    group_letter VARCHAR(2) NOT NULL CHECK (group_letter ~ '^[A-L]$'),
    continent VARCHAR(20),
    fifa_rank INT,
    elo_rating INT NOT NULL DEFAULT 1500,
    total_value_million DECIMAL(10,2),
    player_count INT DEFAULT 26,
    avg_age DECIMAL(4,1),
    core_player VARCHAR(100),
    recent_form VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    match_date DATE NOT NULL,
    kickoff_utc TIMESTAMPTZ NOT NULL,
    home_team_id INT NOT NULL REFERENCES teams(id),
    away_team_id INT NOT NULL REFERENCES teams(id),
    venue VARCHAR(100),
    city VARCHAR(50),
    stage VARCHAR(30) NOT NULL DEFAULT 'Group Stage'
        CHECK (stage IN (
            'Group Stage', 'Round of 32', 'Round of 16',
            'Quarter-Final', 'Semi-Final', 'Third Place', 'Final'
        )),
    group_stage VARCHAR(10),
    home_score INT DEFAULT NULL,
    away_score INT DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'SCHEDULED'
        CHECK (status IN ('SCHEDULED', 'LIVE', 'HT', 'FT', 'POSTPONED', 'CANCELLED')),
    is_finished BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (home_team_id != away_team_id)
);

CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    team_id INT NOT NULL REFERENCES teams(id),
    position VARCHAR(10),
    age INT CHECK (age BETWEEN 16 AND 45),
    club VARCHAR(100),
    value_million DECIMAL(8,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. Dynamic Business Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$'),
    avatar_url VARCHAR(255),
    region VARCHAR(10) DEFAULT 'OVERSEAS' CHECK (region IN ('OVERSEAS', 'CN')),
    total_points INT DEFAULT 0 CHECK (total_points >= 0),
    rank INT DEFAULT 99999,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS predictions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id INT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    predicted_home_score INT NOT NULL CHECK (predicted_home_score BETWEEN 0 AND 15),
    predicted_away_score INT NOT NULL CHECK (predicted_away_score BETWEEN 0 AND 15),
    points_earned INT DEFAULT 0 CHECK (points_earned >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, match_id)
);

CREATE TABLE IF NOT EXISTS ai_reports (
    id BIGSERIAL PRIMARY KEY,
    match_id INT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    region VARCHAR(10) NOT NULL CHECK (region IN ('domestic', 'overseas')),
    content TEXT,
    predicted_score VARCHAR(10),
    confidence_level VARCHAR(10),
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'generating', 'generated', 'failed')),
    error_message TEXT,
    retry_count INT DEFAULT 0 CHECK (retry_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(match_id, region)
);

CREATE TABLE IF NOT EXISTS share_stats (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    match_id INT REFERENCES matches(id) ON DELETE SET NULL,
    region VARCHAR(10),
    share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('wechat', 'twitter', 'whatsapp', 'screenshot')),
    image_key VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. Indexes (Performance)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_matches_kickoff ON matches(kickoff_utc);
CREATE INDEX IF NOT EXISTS idx_matches_stage ON matches(stage, kickoff_utc);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status) WHERE status != 'SCHEDULED';
CREATE INDEX IF NOT EXISTS idx_matches_teams ON matches(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match ON predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id, match_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_status ON ai_reports(status) WHERE status != 'generated';
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);

-- ============================================================
-- 4. Triggers
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_ai_reports_updated_at
    BEFORE UPDATE ON ai_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Prediction deadline check
CREATE OR REPLACE FUNCTION check_prediction_deadline()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM matches WHERE id = NEW.match_id AND kickoff_utc < NOW()
    ) THEN
        RAISE EXCEPTION 'Cannot predict: match has already started';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prediction_deadline
    BEFORE INSERT ON predictions
    FOR EACH ROW EXECUTE FUNCTION check_prediction_deadline();

-- Atomic point increment helper
CREATE OR REPLACE FUNCTION increment_user_points(p_user_id UUID, p_points INT)
RETURNS VOID AS $$
BEGIN
    UPDATE users SET total_points = total_points + p_points WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 5. RLS Policies
-- ============================================================

-- Public read for static data
CREATE POLICY teams_public_read ON teams FOR SELECT USING (true);
CREATE POLICY matches_public_read ON matches FOR SELECT USING (true);
CREATE POLICY players_public_read ON players FOR SELECT USING (true);

-- Predictions: users can only read/write their own
CREATE POLICY predictions_user_own ON predictions
    FOR ALL USING (auth.uid() = user_id);

-- AI reports: public read, system write
CREATE POLICY ai_reports_public_read ON ai_reports FOR SELECT USING (true);

-- Share stats: public read, user write
CREATE POLICY share_stats_public_read ON share_stats FOR SELECT USING (true);
CREATE POLICY share_stats_user_write ON share_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users: own read
CREATE POLICY users_own_read ON users FOR SELECT USING (auth.uid() = id);
