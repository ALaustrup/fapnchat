-- Enhanced Chat Rooms System with Hierarchy
-- Run these migrations in your Neon database

-- Drop old tables if needed (careful in production!)
-- DROP TABLE IF EXISTS chat_room_messages;
-- DROP TABLE IF EXISTS chat_rooms;

-- Enhanced chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id SERIAL PRIMARY KEY,
  room_name VARCHAR(100) NOT NULL,
  description TEXT,
  owner_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  
  -- Visibility
  is_public BOOLEAN DEFAULT true,
  password_hash TEXT, -- For private rooms
  
  -- Customization
  background_url TEXT,
  background_color VARCHAR(20) DEFAULT '#1A1A1E',
  music_url TEXT,
  music_provider VARCHAR(20), -- 'spotify', 'soundcloud', 'custom'
  
  -- Settings
  webcam_enabled BOOLEAN DEFAULT true,
  max_participants INTEGER DEFAULT 50,
  slow_mode_seconds INTEGER DEFAULT 0,
  
  -- Stats
  participant_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room members with roles
CREATE TABLE IF NOT EXISTS chat_room_members (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  role VARCHAR(10) NOT NULL DEFAULT 'USER' CHECK (role IN ('OWNR', 'MOD', 'AGENT', 'USER')),
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  ban_expires_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Enhanced chat messages
CREATE TABLE IF NOT EXISTS chat_room_messages (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'tip', 'system'
  metadata JSONB, -- For tips, images, etc.
  is_deleted BOOLEAN DEFAULT false,
  deleted_by VARCHAR(255) REFERENCES auth_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room invites for private rooms
CREATE TABLE IF NOT EXISTS chat_room_invites (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  invite_code VARCHAR(20) NOT NULL UNIQUE,
  created_by VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  max_uses INTEGER,
  use_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_rooms_owner ON chat_rooms(owner_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_public ON chat_rooms(is_public);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_room ON chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user ON chat_room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_messages_room ON chat_room_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_messages_created ON chat_room_messages(created_at DESC);

-- Update trigger for chat_rooms
DROP TRIGGER IF EXISTS update_chat_rooms_updated_at ON chat_rooms;
CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

