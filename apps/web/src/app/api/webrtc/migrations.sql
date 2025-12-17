-- WebRTC Signaling Database Schema
-- Run these migrations in your Neon database

-- Signaling messages for WebRTC
CREATE TABLE IF NOT EXISTS webrtc_signals (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL,
  sender_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  target_user_id VARCHAR(255) REFERENCES auth_users(id) ON DELETE CASCADE,
  signal_type VARCHAR(20) NOT NULL, -- 'offer', 'answer', 'ice-candidate', 'join', 'leave'
  signal_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-cleanup old signals (keep last 5 minutes)
CREATE INDEX IF NOT EXISTS idx_webrtc_signals_room ON webrtc_signals(room_id);
CREATE INDEX IF NOT EXISTS idx_webrtc_signals_created ON webrtc_signals(created_at);

-- Function to clean old signals
CREATE OR REPLACE FUNCTION cleanup_old_signals() RETURNS void AS $$
BEGIN
  DELETE FROM webrtc_signals WHERE created_at < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Video room participants (active users in video rooms)
CREATE TABLE IF NOT EXISTS video_room_participants (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL,
  user_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  is_streaming BOOLEAN DEFAULT false,
  video_enabled BOOLEAN DEFAULT true,
  audio_enabled BOOLEAN DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_video_participants_room ON video_room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_video_participants_heartbeat ON video_room_participants(last_heartbeat);

