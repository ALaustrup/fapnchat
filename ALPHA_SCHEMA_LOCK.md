# WYA!? — Alpha Schema Lock

## Purpose

This document freezes database schemas for Alpha. No migrations after Alpha unless critical.

**Last Updated:** Alpha Launch
**Status:** 🔒 LOCKED

---

## Core Tables (Alpha)

### 1. `auth_users` (Identity & Access)
**Source:** Auth system (existing)
**Purpose:** User authentication and identity

**Key Fields:**
- `id` (VARCHAR/UUID) - Primary key
- `email` (VARCHAR) - Unique identifier
- `created_at` (TIMESTAMP)

**Alpha Notes:**
- Age layer verification soft for Alpha
- Age-segmented discovery enforced at application layer

---

### 2. `user_profiles` (Profile Data)
**Source:** `apps/web/src/app/api/profile/migrations.sql`
**Purpose:** User profile information and customization

**Key Fields:**
- `id` (SERIAL) - Primary key
- `user_id` (VARCHAR) - References auth_users(id)
- `display_name` (VARCHAR(50))
- `bio` (TEXT)
- `avatar_url` (TEXT)
- `banner_url` (TEXT)
- `theme_color` (VARCHAR(20)) - Default '#7A5AF8'
- `profile_music_url` (TEXT)
- `profile_music_provider` (VARCHAR(20)) - 'spotify' | 'soundcloud'
- `location` (VARCHAR(100)) - City/neighborhood tier
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Alpha Notes:**
- Location stored as city/neighborhood (approximate)
- Music player supports Spotify/SoundCloud only

---

### 3. `chat_rooms` (Group Rooms)
**Source:** `apps/web/src/app/api/chatrooms/migrations.sql`
**Purpose:** Small group text rooms (3-10 users for Alpha)

**Key Fields:**
- `id` (SERIAL) - Primary key
- `room_name` (VARCHAR(100))
- `description` (TEXT)
- `owner_id` (VARCHAR) - References auth_users(id)
- `is_public` (BOOLEAN) - Default true
- `background_color` (VARCHAR(20)) - Default '#1A1A1E'
- `music_url` (TEXT)
- `music_provider` (VARCHAR(20))
- `max_participants` (INTEGER) - Default 50, Alpha limit: 10
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Alpha Notes:**
- Text-only for Alpha (no video)
- Max participants enforced at application layer (10 for Alpha)

---

### 4. `chat_room_members` (Room Membership)
**Source:** `apps/web/src/app/api/chatrooms/migrations.sql`
**Purpose:** Track room membership and roles

**Key Fields:**
- `id` (SERIAL) - Primary key
- `room_id` (INTEGER) - References chat_rooms(id)
- `user_id` (VARCHAR) - References auth_users(id)
- `role` (VARCHAR(10)) - 'OWNR' | 'MOD' | 'AGENT' | 'USER'
- `is_banned` (BOOLEAN) - Default false
- `joined_at` (TIMESTAMP)
- `last_seen_at` (TIMESTAMP)

**Alpha Notes:**
- Basic moderation roles (OWNR, MOD, USER)
- AGENT role reserved for future

---

### 5. `chat_room_messages` (Group Room Messages)
**Source:** `apps/web/src/app/api/chatrooms/migrations.sql`
**Purpose:** Messages in group rooms

**Key Fields:**
- `id` (SERIAL) - Primary key
- `room_id` (INTEGER) - References chat_rooms(id)
- `user_id` (VARCHAR) - References auth_users(id)
- `message` (TEXT)
- `media_url` (TEXT) - Image/audio only for Alpha
- `created_at` (TIMESTAMP)

**Alpha Notes:**
- Media limited to image + audio
- No video attachments

---

### 6. `private_messages` (1:1 Chat)
**Source:** Existing implementation
**Purpose:** Direct messages between users

**Key Fields:**
- `id` (SERIAL) - Primary key
- `sender_id` (VARCHAR) - References auth_users(id)
- `recipient_id` (VARCHAR) - References auth_users(id)
- `message` (TEXT)
- `media_url` (TEXT) - Image/audio only for Alpha
- `created_at` (TIMESTAMP)

**Alpha Notes:**
- Core Alpha feature
- Real-time via WebSocket

---

### 7. `presence` (User Presence - Ephemeral)
**Status:** 🔧 TO BE IMPLEMENTED
**Purpose:** Track online/typing status

**Proposed Schema:**
```sql
CREATE TABLE IF NOT EXISTS presence (
  user_id VARCHAR(255) PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('online', 'away', 'offline')),
  activity VARCHAR(50), -- 'chatting', 'browsing', 'idle'
  room_id INTEGER REFERENCES chat_rooms(id),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_presence_status ON presence(status);
CREATE INDEX idx_presence_room ON presence(room_id);
```

**Alpha Notes:**
- Ephemeral (TTL 60-120s in production)
- For Alpha, stored in DB with cleanup job

---

### 8. `reports` (Safety Reports)
**Status:** 🔧 TO BE IMPLEMENTED
**Purpose:** User reports for moderation

**Proposed Schema:**
```sql
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  reporter_id VARCHAR(255) NOT NULL REFERENCES auth_users(id),
  reported_user_id VARCHAR(255) REFERENCES auth_users(id),
  reported_room_id INTEGER REFERENCES chat_rooms(id),
  reported_message_id INTEGER REFERENCES chat_room_messages(id),
  report_type VARCHAR(50) NOT NULL, -- 'harassment', 'spam', 'inappropriate', etc.
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by VARCHAR(255) REFERENCES auth_users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_reported_user ON reports(reported_user_id);
```

**Alpha Notes:**
- Manual review required
- Fast response > perfection

---

### 9. `blocks` (User Blocks)
**Status:** 🔧 TO BE IMPLEMENTED
**Purpose:** User blocking relationships

**Proposed Schema:**
```sql
CREATE TABLE IF NOT EXISTS blocks (
  blocker_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  blocked_id VARCHAR(255) NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id)
);

CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON blocks(blocked_id);
```

**Alpha Notes:**
- Mutual blocking enforced at application layer

---

### 10. `moderation_actions` (Moderation Log)
**Status:** 🔧 TO BE IMPLEMENTED
**Purpose:** Audit log of moderation actions

**Proposed Schema:**
```sql
CREATE TABLE IF NOT EXISTS moderation_actions (
  id SERIAL PRIMARY KEY,
  moderator_id VARCHAR(255) NOT NULL REFERENCES auth_users(id),
  target_user_id VARCHAR(255) REFERENCES auth_users(id),
  action_type VARCHAR(50) NOT NULL, -- 'warn', 'mute', 'restrict', 'escalate'
  reason TEXT NOT NULL,
  duration_minutes INTEGER, -- NULL for permanent
  report_id INTEGER REFERENCES reports(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_moderation_target ON moderation_actions(target_user_id);
CREATE INDEX idx_moderation_moderator ON moderation_actions(moderator_id);
```

**Alpha Notes:**
- All actions logged
- No shadow actions

---

### 11. `locations` (Geo Bucketing)
**Status:** 🔧 TO BE IMPLEMENTED
**Purpose:** Approximate location for geo-first discovery

**Proposed Schema:**
```sql
CREATE TABLE IF NOT EXISTS locations (
  user_id VARCHAR(255) PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  city_hash VARCHAR(64) NOT NULL, -- Hashed city name
  neighborhood_hash VARCHAR(64), -- Hashed neighborhood (optional)
  latitude DECIMAL(10, 8), -- Approximate only
  longitude DECIMAL(11, 8), -- Approximate only
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_locations_city ON locations(city_hash);
CREATE INDEX idx_locations_neighborhood ON locations(neighborhood_hash);
```

**Alpha Notes:**
- City/neighborhood tier only
- No precise coordinates stored
- Hashed for privacy

---

## Alpha Schema Rules

1. **No migrations after Alpha** unless critical (security, data loss)
2. **All new tables** must be documented here before implementation
3. **Breaking changes** require Alpha reset approval
4. **Schema drift** must be caught in CI/CD

---

## Migration Status

- ✅ `user_profiles` - Migrated
- ✅ `chat_rooms` - Migrated
- ✅ `chat_room_members` - Migrated
- ✅ `chat_room_messages` - Migrated
- ✅ `private_messages` - Exists (verify schema)
- 🔧 `presence` - Needs migration
- 🔧 `reports` - Needs migration
- 🔧 `blocks` - Needs migration
- 🔧 `moderation_actions` - Needs migration
- 🔧 `locations` - Needs migration

---

## Next Steps

1. Verify `private_messages` schema matches Alpha requirements
2. Create migrations for missing tables
3. Add indexes for Alpha query patterns
4. Document any existing tables not listed here

