-- ============================================================================
-- WYA!? — Alpha Database Schema (FINAL)
-- ============================================================================
-- 
-- Purpose: Freeze Alpha schemas. No churn.
-- Status: 🔒 LOCKED for Alpha
-- 
-- Constraints:
-- - PostgreSQL-compatible
-- - Explicit tables only
-- - No polymorphic magic
-- - No premature optimization
-- - No future-facing fields
-- - Alpha scope only (no video, payments, marketplace, events, boosts)
--
-- ============================================================================

-- ============================================================================
-- 1. USERS (Identity & Access)
-- ============================================================================
-- 
-- Note: auth_users is a view over neon_auth.user (managed by auth system)
-- This schema assumes auth_users view exists with:
--   - id (VARCHAR/UUID)
--   - email (VARCHAR)
--   - name (VARCHAR)
--   - created_at (TIMESTAMP)
--
-- Age layer enforcement happens at application layer for Alpha
-- (hard-gated layers in beta+)
--
-- ============================================================================

-- ============================================================================
-- 2. PROFILES (User Profile Data)
-- ============================================================================
-- 
-- Purpose: User profile information and customization
-- Relationship: One profile per user (1:1 with auth_users)
--
-- Alpha Notes:
-- - Location stored as city/neighborhood (approximate)
-- - Music player supports Spotify/SoundCloud only
-- - No custom CSS (Alpha OUT)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES auth_users(id) ON DELETE CASCADE,
  
  -- Basic Info
  display_name VARCHAR(50),
  bio TEXT,
  
  -- Media
  avatar_url TEXT,
  banner_url TEXT,
  
  -- Customization (Alpha MVP)
  theme_color VARCHAR(20) DEFAULT '#7A5AF8',
  background_color VARCHAR(20) DEFAULT '#1A1A1E',
  
  -- Music (Spotify/SoundCloud only for Alpha)
  profile_music_url TEXT,
  profile_music_provider VARCHAR(20) CHECK (profile_music_provider IN ('spotify', 'soundcloud')),
  
  -- Privacy Settings
  is_private BOOLEAN DEFAULT false,
  show_online_status BOOLEAN DEFAULT true,
  show_now_playing BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for profile queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON user_profiles(display_name);

-- ============================================================================
-- 3. PROFILE_ROOMS (Profiles as Rooms - MVP)
-- ============================================================================
-- 
-- Purpose: Profile rooms are the "profile as room" concept
-- Relationship: One room per profile (1:1 with user_profiles)
--
-- Alpha Notes:
-- - Limited modules (guestbook, music player)
-- - Drag-drop layout (stored as JSONB)
-- - No marketplace (Alpha OUT)
-- - No custom CSS (Alpha OUT)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profile_rooms (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Layout (stored as JSONB for Alpha MVP)
  -- Structure: { modules: [{ id, type, position: {x, y}, content }] }
  layout JSONB DEFAULT '{"modules": []}'::jsonb,
  
  -- Background customization
  background_url TEXT,
  background_color VARCHAR(20) DEFAULT '#1A1A1E',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profile_rooms_profile_id ON profile_rooms(profile_id);

-- ============================================================================
-- 4. ROOM_MODULES (Profile Room Modules)
-- ============================================================================
-- 
-- Purpose: Individual modules within a profile room
-- Relationship: Many modules per room (N:1 with profile_rooms)
--
-- Alpha Notes:
-- - Limited module types: 'guestbook', 'music', 'text'
-- - No custom modules (Alpha OUT)
-- - No marketplace modules (Alpha OUT)
-- ============================================================================

CREATE TABLE IF NOT EXISTS room_modules (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES profile_rooms(id) ON DELETE CASCADE,
  
  -- Module Type (Alpha MVP only)
  module_type VARCHAR(20) NOT NULL CHECK (module_type IN ('guestbook', 'music', 'text')),
  
  -- Position (for drag-drop layout)
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  
  -- Content (module-specific data)
  content JSONB DEFAULT '{}'::jsonb,
  
  -- Display order
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_room_modules_room_id ON room_modules(room_id);
CREATE INDEX IF NOT EXISTS idx_room_modules_type ON room_modules(module_type);

-- ============================================================================
-- 5. CHATS (Conversations - 1:1 and Group)
-- ============================================================================
-- 
-- Purpose: Chat conversations (1:1 direct messages and small group rooms)
-- Relationship: Many messages per chat (N:1 with messages)
--
-- Alpha Notes:
-- - Small group rooms: 3-10 users (enforced at application layer)
-- - Text-only for Alpha (no video)
-- - No stranger roulette (Alpha OUT)
-- ============================================================================

-- 1:1 Conversations (implicit, no table needed)
-- Group Rooms (explicit table)
CREATE TABLE IF NOT EXISTS chats (
  id SERIAL PRIMARY KEY,
  
  -- Room Info (for group chats only, NULL for 1:1)
  room_name VARCHAR(100),
  description TEXT,
  owner_id VARCHAR(255) REFERENCES auth_users(id) ON DELETE CASCADE,
  
  -- Chat Type
  chat_type VARCHAR(20) NOT NULL CHECK (chat_type IN ('direct', 'group')) DEFAULT 'direct',
  
  -- Visibility (group rooms only)
  is_public BOOLEAN DEFAULT true,
  
  -- Customization (group rooms only)
  background_color VARCHAR(20) DEFAULT '#1A1A1E',
  music_url TEXT,
  music_provider VARCHAR(20) CHECK (music_provider IN ('spotify', 'soundcloud')),
  
  -- Settings (group rooms only)
  max_participants INTEGER DEFAULT 10 CHECK (max_participants <= 10), -- Alpha limit
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Participants (for group chats)
CREATE TABLE IF NOT EXISTS chat_participants (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  
  -- Role (group chats only)
  role VARCHAR(10) DEFAULT 'USER' CHECK (role IN ('OWNR', 'MOD', 'USER')),
  
  -- Status
  is_banned BOOLEAN DEFAULT false,
  
  -- Timestamps
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(chat_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chats_owner ON chats(owner_id);
CREATE INDEX IF NOT EXISTS idx_chats_type ON chats(chat_type);
CREATE INDEX IF NOT EXISTS idx_chat_participants_chat ON chat_participants(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON chat_participants(user_id);

-- ============================================================================
-- 6. MESSAGES (Chat Messages)
-- ============================================================================
-- 
-- Purpose: Messages in chats (1:1 and group)
-- Relationship: Many messages per chat (N:1 with chats)
--
-- Alpha Notes:
-- - Text + image + audio only (no video)
-- - Media stored as URLs (not in DB)
-- - Reactions supported (stored as JSONB)
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  
  -- Message Content
  message_text TEXT,
  message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('text', 'image', 'audio')) DEFAULT 'text',
  
  -- Media (URLs only, not stored in DB)
  media_url TEXT,
  media_metadata JSONB, -- { size, mime_type, duration (for audio) }
  
  -- Reactions (stored as JSONB: { "emoji": ["user_id1", "user_id2"] })
  reactions JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  is_deleted BOOLEAN DEFAULT false,
  read_by JSONB DEFAULT '[]'::jsonb, -- Array of user_ids who read
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for message queries
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);

-- ============================================================================
-- 7. PRESENCE (User Presence - Ephemeral)
-- ============================================================================
-- 
-- Purpose: Track online/typing status
-- Relationship: One presence record per user (1:1 with auth_users)
--
-- Alpha Notes:
-- - Ephemeral (TTL-friendly, cleanup job runs every 60-120s)
-- - Status: online, away, offline
-- - Activity: chatting, browsing, idle
-- - Tracks current room/chat
-- ============================================================================

CREATE TABLE IF NOT EXISTS presence (
  user_id VARCHAR(255) PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  
  -- Status
  status VARCHAR(20) NOT NULL CHECK (status IN ('online', 'away', 'offline')) DEFAULT 'offline',
  
  -- Activity
  activity VARCHAR(50) CHECK (activity IN ('chatting', 'browsing', 'idle')),
  
  -- Current Location
  current_chat_id INTEGER REFERENCES chats(id),
  current_room_id INTEGER REFERENCES profile_rooms(id),
  
  -- Timestamps
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for presence queries
CREATE INDEX IF NOT EXISTS idx_presence_status ON presence(status);
CREATE INDEX IF NOT EXISTS idx_presence_chat ON presence(current_chat_id);
CREATE INDEX IF NOT EXISTS idx_presence_updated ON presence(updated_at);

-- ============================================================================
-- 8. BLOCKS (User Blocking)
-- ============================================================================
-- 
-- Purpose: User blocking relationships
-- Relationship: Many-to-many (users can block multiple users)
--
-- Alpha Notes:
-- - Mutual blocking enforced at application layer
-- - Blocks prevent all interaction
-- ============================================================================

CREATE TABLE IF NOT EXISTS blocks (
  blocker_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  blocked_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id) -- Cannot block self
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks(blocked_id);

-- ============================================================================
-- 9. REPORTS (Safety Reports)
-- ============================================================================
-- 
-- Purpose: User reports for moderation
-- Relationship: Many reports per user/room/message
--
-- Alpha Notes:
-- - Manual review required
-- - Context snapshots preserved (message content, room state)
-- - Fast response > perfection
-- ============================================================================

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  reporter_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  
  -- What is being reported
  reported_user_id VARCHAR(255) REFERENCES auth_users(id),
  reported_chat_id INTEGER REFERENCES chats(id),
  reported_message_id INTEGER REFERENCES messages(id),
  reported_room_id INTEGER REFERENCES profile_rooms(id),
  
  -- Report Details
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN (
    'harassment', 'spam', 'inappropriate', 'abuse', 'scam', 'other'
  )),
  description TEXT NOT NULL,
  
  -- Context Snapshot (preserved at time of report)
  context_snapshot JSONB, -- { message_content, room_state, user_profile, etc. }
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  
  -- Review
  reviewed_by VARCHAR(255) REFERENCES auth_users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for report queries
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- ============================================================================
-- 10. MODERATION_ACTIONS (Moderation Audit Log)
-- ============================================================================
-- 
-- Purpose: Audit log of moderation actions
-- Relationship: Many actions per user/report
--
-- Alpha Notes:
-- - All actions logged (no shadow actions)
-- - Actions: warn, mute, restrict, escalate
-- - Reversible (duration-based)
-- ============================================================================

CREATE TABLE IF NOT EXISTS moderation_actions (
  id SERIAL PRIMARY KEY,
  moderator_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  target_user_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  
  -- Action Details
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('warn', 'mute', 'restrict', 'escalate')),
  reason TEXT NOT NULL,
  
  -- Duration (NULL = permanent, requires escalation)
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Related Report
  report_id INTEGER REFERENCES reports(id),
  
  -- Status
  is_reversed BOOLEAN DEFAULT false,
  reversed_by VARCHAR(255) REFERENCES auth_users(id),
  reversed_at TIMESTAMP WITH TIME ZONE,
  reversal_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_moderation_actions_target ON moderation_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_moderator ON moderation_actions(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_report ON moderation_actions(report_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_expires ON moderation_actions(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- 11. GEO_LOCATIONS (Approximate Location - Privacy-Safe)
-- ============================================================================
-- 
-- Purpose: Approximate location for geo-first discovery
-- Relationship: One location per user (1:1 with auth_users)
--
-- Alpha Notes:
-- - City/neighborhood tier only (no precise coordinates)
-- - Hashed for privacy
-- - Approximate coordinates (rounded to ~1km)
-- ============================================================================

CREATE TABLE IF NOT EXISTS geo_locations (
  user_id VARCHAR(255) PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  
  -- Hashed Location (privacy-safe)
  city_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of city name
  neighborhood_hash VARCHAR(64), -- SHA-256 hash of neighborhood (optional)
  
  -- Approximate Coordinates (rounded to ~1km precision)
  -- Stored as DECIMAL to avoid floating-point precision issues
  latitude DECIMAL(8, 5), -- ~1km precision (0.01 degrees ≈ 1km)
  longitude DECIMAL(9, 5), -- ~1km precision
  
  -- Timestamps
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for geo queries
CREATE INDEX IF NOT EXISTS idx_geo_locations_city ON geo_locations(city_hash);
CREATE INDEX IF NOT EXISTS idx_geo_locations_neighborhood ON geo_locations(neighborhood_hash);
CREATE INDEX IF NOT EXISTS idx_geo_locations_coords ON geo_locations(latitude, longitude);

-- ============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profile_rooms_updated_at ON profile_rooms;
CREATE TRIGGER update_profile_rooms_updated_at
  BEFORE UPDATE ON profile_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_room_modules_updated_at ON room_modules;
CREATE TRIGGER update_room_modules_updated_at
  BEFORE UPDATE ON room_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chats_updated_at ON chats;
CREATE TRIGGER update_chats_updated_at
  BEFORE UPDATE ON chats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_presence_updated_at ON presence;
CREATE TRIGGER update_presence_updated_at
  BEFORE UPDATE ON presence
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ALPHA CONSTRAINTS & VALIDATION
-- ============================================================================

-- Ensure max_participants doesn't exceed Alpha limit
ALTER TABLE chats ADD CONSTRAINT chats_max_participants_alpha CHECK (max_participants <= 10);

-- Ensure message types are Alpha-only (no video)
ALTER TABLE messages ADD CONSTRAINT messages_type_alpha CHECK (message_type IN ('text', 'image', 'audio'));

-- Ensure music providers are Alpha-only (Spotify/SoundCloud)
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_music_provider_alpha CHECK (
  profile_music_provider IS NULL OR profile_music_provider IN ('spotify', 'soundcloud')
);

ALTER TABLE chats ADD CONSTRAINT chats_music_provider_alpha CHECK (
  music_provider IS NULL OR music_provider IN ('spotify', 'soundcloud')
);

-- Ensure module types are Alpha-only
ALTER TABLE room_modules ADD CONSTRAINT room_modules_type_alpha CHECK (
  module_type IN ('guestbook', 'music', 'text')
);

-- ============================================================================
-- DELIBERATELY MISSING (Alpha OUT)
-- ============================================================================
--
-- The following are DELIBERATELY excluded from Alpha schema:
--
-- ❌ Video chat tables (webrtc, video_rooms)
-- ❌ Payment tables (bits, payments, subscriptions)
-- ❌ Marketplace tables (products, transactions)
-- ❌ Events tables (events, event_attendees)
-- ❌ Boosts tables (boosts, boost_purchases)
-- ❌ Custom CSS storage
-- ❌ Advanced analytics tables
-- ❌ Notification preferences (beyond basic)
-- ❌ Friend/follow relationships (not in Alpha scope)
-- ❌ Posts/feed tables (not in Alpha scope)
--
-- These will be added in Beta+ if needed.
--
-- ============================================================================

