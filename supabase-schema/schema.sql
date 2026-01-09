-- ═══════════════════════════════════════════════════════════════
-- SNAKEPILL - DATABASE SCHEMA
-- Execute este script no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════════════════

-- Players (usuarios que conectaram wallet)
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT,
    total_points INT DEFAULT 0,
    total_playtime_seconds INT DEFAULT 0,
    games_played INT DEFAULT 0,
    highest_score INT DEFAULT 0,
    current_skin TEXT DEFAULT 'classic',
    owned_skins TEXT[] DEFAULT ARRAY['classic'],
    is_eligible BOOLEAN DEFAULT FALSE,
    eligible_since TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Sessions (cada partida)
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id),
    wallet_address TEXT,
    score INT DEFAULT 0,
    playtime_seconds INT DEFAULT 0,
    pills_eaten INT DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    game_over_reason TEXT -- 'wall', 'self', 'quit'
);

-- Leaderboard (top scores)
CREATE TABLE IF NOT EXISTS leaderboard (
    id SERIAL PRIMARY KEY,
    player_id UUID REFERENCES players(id),
    wallet_address TEXT NOT NULL,
    username TEXT,
    score INT NOT NULL,
    playtime_seconds INT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donates
CREATE TABLE IF NOT EXISTS donates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL,
    amount_sol DECIMAL(20, 9) NOT NULL,
    tx_signature TEXT UNIQUE,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skins disponiveis
CREATE TABLE IF NOT EXISTS skins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cost_points INT NOT NULL,
    description TEXT,
    color_primary TEXT,
    color_secondary TEXT,
    is_animated BOOLEAN DEFAULT FALSE
);

-- Eligible players (para distribuicao de taxas)
CREATE TABLE IF NOT EXISTS eligible_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) UNIQUE,
    wallet_address TEXT UNIQUE NOT NULL,
    holding_usd DECIMAL(20, 2),
    total_playtime_seconds INT,
    became_eligible_at TIMESTAMPTZ DEFAULT NOW(),
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Tax distributions (historico de pagamentos)
CREATE TABLE IF NOT EXISTS tax_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_tax_sol DECIMAL(20, 9) NOT NULL,
    distribution_amount_sol DECIMAL(20, 9) NOT NULL,
    eligible_count INT NOT NULL,
    per_player_sol DECIMAL(20, 9) NOT NULL,
    tx_signatures TEXT[],
    distributed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Online players (presenca em tempo real)
CREATE TABLE IF NOT EXISTS online_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT,
    session_id TEXT UNIQUE NOT NULL,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    is_playing BOOLEAN DEFAULT FALSE
);

-- System status
CREATE TABLE IF NOT EXISTS system_status (
    id INT PRIMARY KEY DEFAULT 1,
    total_players INT DEFAULT 0,
    total_games INT DEFAULT 0,
    total_eligible INT DEFAULT 0,
    total_distributed_sol DECIMAL(20, 9) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default system status
INSERT INTO system_status (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- INSERT SKINS PADRAO
-- ═══════════════════════════════════════════════════════════════

INSERT INTO skins (id, name, cost_points, description, color_primary, color_secondary, is_animated) VALUES
('classic', 'Classic', 0, 'Verde Nokia original', '#4ade80', '#22c55e', false),
('neon', 'Neon', 500, 'Azul brilhante', '#22d3ee', '#0891b2', false),
('gold', 'Gold', 1000, 'Dourado metalico', '#fbbf24', '#f59e0b', false),
('fire', 'Fire', 2000, 'Vermelho ardente', '#ef4444', '#dc2626', false),
('rainbow', 'Rainbow', 5000, 'Arco-iris animado', '#a855f7', '#ec4899', true),
('diamond', 'Diamond', 10000, 'Diamante brilhante', '#f0f9ff', '#e0f2fe', true)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- INDICES
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_players_wallet ON players(wallet_address);
CREATE INDEX IF NOT EXISTS idx_players_points ON players(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_players_playtime ON players(total_playtime_seconds DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_donates_amount ON donates(amount_sol DESC);
CREATE INDEX IF NOT EXISTS idx_eligible_active ON eligible_players(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_online_lastseen ON online_players(last_seen);
CREATE INDEX IF NOT EXISTS idx_game_sessions_player ON game_sessions(player_id);

-- ═══════════════════════════════════════════════════════════════
-- HABILITAR REALTIME (CRITICO!)
-- ═══════════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE leaderboard;
ALTER PUBLICATION supabase_realtime ADD TABLE donates;
ALTER PUBLICATION supabase_realtime ADD TABLE online_players;
ALTER PUBLICATION supabase_realtime ADD TABLE system_status;
ALTER PUBLICATION supabase_realtime ADD TABLE eligible_players;
ALTER PUBLICATION supabase_realtime ADD TABLE skins;

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Limpar players offline (mais de 2 minutos sem ping)
CREATE OR REPLACE FUNCTION cleanup_offline_players()
RETURNS void AS $$
BEGIN
    DELETE FROM online_players
    WHERE last_seen < NOW() - INTERVAL '2 minutes';
END;
$$ LANGUAGE plpgsql;

-- Atualizar estatisticas do sistema
CREATE OR REPLACE FUNCTION update_system_stats()
RETURNS void AS $$
BEGIN
    UPDATE system_status SET
        total_players = (SELECT COUNT(*) FROM players),
        total_games = (SELECT COUNT(*) FROM game_sessions),
        total_eligible = (SELECT COUNT(*) FROM eligible_players WHERE is_active = TRUE),
        updated_at = NOW()
    WHERE id = 1;
END;
$$ LANGUAGE plpgsql;

-- Atualizar total distribuido
CREATE OR REPLACE FUNCTION update_total_distributed(amount DECIMAL)
RETURNS void AS $$
BEGIN
    UPDATE system_status SET
        total_distributed_sol = total_distributed_sol + amount,
        updated_at = NOW()
    WHERE id = 1;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE donates ENABLE ROW LEVEL SECURITY;
ALTER TABLE skins ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligible_players ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON donates FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON skins FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON online_players FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON system_status FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON eligible_players FOR SELECT USING (true);

-- Service role has full access (for the bot)
CREATE POLICY "Service role full access" ON players FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON game_sessions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON leaderboard FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON donates FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON online_players FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON system_status FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON eligible_players FOR ALL USING (auth.role() = 'service_role');
