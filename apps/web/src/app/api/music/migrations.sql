-- Music Integration Database Schema
-- Run these migrations in your Neon database

-- User music service connections (Spotify, etc.)
CREATE TABLE IF NOT EXISTS user_music_connections (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL, -- 'spotify', 'soundcloud'
  provider_user_id VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- User's saved/favorite music tracks
CREATE TABLE IF NOT EXISTS user_saved_music (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL, -- 'spotify', 'soundcloud'
  track_url TEXT NOT NULL,
  track_data JSONB, -- Store track metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider, track_url)
);

-- User's currently playing / "Now Playing" status
CREATE TABLE IF NOT EXISTS user_now_playing (
  user_id VARCHAR(255) PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  provider VARCHAR(20),
  track_name VARCHAR(255),
  artist_name VARCHAR(255),
  album_name VARCHAR(255),
  artwork_url TEXT,
  track_url TEXT,
  is_playing BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_music_connections_user ON user_music_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_music_user ON user_saved_music(user_id);
CREATE INDEX IF NOT EXISTS idx_now_playing_updated ON user_now_playing(updated_at);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_music_connections_updated_at ON user_music_connections;
CREATE TRIGGER update_music_connections_updated_at
  BEFORE UPDATE ON user_music_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

