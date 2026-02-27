-- Multiplayer Blackjack için Supabase SQL Tabloları
-- Bu SQL kodunu Supabase SQL Editor'de çalıştırın

-- 1. rooms tablosu (Oyun odaları)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  creator_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  current_turn INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. players tablosu (Oyuncular)
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  hand JSONB DEFAULT '[]',
  score INTEGER DEFAULT 0,
  is_stand BOOLEAN DEFAULT FALSE,
  is_bust BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. game_state tablosu (Oyun durumu)
CREATE TABLE IF NOT EXISTS game_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE UNIQUE,
  dealer_hand JSONB DEFAULT '[]',
  dealer_score INTEGER DEFAULT 0,
  dealer_stand BOOLEAN DEFAULT FALSE,
  deck JSONB DEFAULT '[]',
  current_player_index INTEGER DEFAULT 0,
  game_phase TEXT DEFAULT 'dealing' CHECK (game_phase IN ('dealing', 'player_turns', 'dealer_turn', 'finished')),
  ai_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler (Performans için)
CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_game_state_room_id ON game_state(room_id);
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);

-- Otomatik updated_at güncellemesi için trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_game_state_updated_at BEFORE UPDATE ON game_state
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Politikaları
-- Tüm kullanıcılar okuyabilir
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on rooms" ON rooms FOR UPDATE USING (true);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on players" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on players" ON players FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on players" ON players FOR DELETE USING (true);

ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on game_state" ON game_state FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on game_state" ON game_state FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on game_state" ON game_state FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on game_state" ON game_state FOR DELETE USING (true);

-- NOT: Realtime özelliğine artık ihtiyaç YOK
-- Uygulama her 2 saniyede bir otomatik olarak verileri günceller (polling)
