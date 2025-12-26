# WYA!? — Alpha Database Schema (FINAL)

**Status:** 🔒 LOCKED for Alpha  
**Purpose:** Freeze Alpha schemas. No churn.

---

## Schema Overview

This document defines the **FINAL** Alpha database schema for WYA!?. All tables, relationships, constraints, and indexes are explicitly defined with **no polymorphic magic**, **no premature optimization**, and **no future-facing fields**.

---

## Core Principles

1. **Explicit tables only** — No polymorphic "junk" tables
2. **Alpha scope only** — No video, payments, marketplace, events, boosts
3. **Privacy-safe geo** — Approximate location (city/neighborhood hash)
4. **Age layer enforcement** — At schema level where possible
5. **Ephemeral presence** — TTL-friendly structure
6. **Context preservation** — Reports preserve snapshots

---

## Table Relationships

```
auth_users (view, managed by auth system)
  ├── user_profiles (1:1)
  │     └── profile_rooms (1:1)
  │           └── room_modules (N:1)
  │
  ├── chats (N:1 owner)
  │     ├── chat_participants (N:1)
  │     └── messages (N:1)
  │
  ├── presence (1:1)
  ├── blocks (N:M via blocker/blocked)
  ├── reports (N:1 reporter, N:1 reported_user)
  ├── moderation_actions (N:1 moderator, N:1 target)
  └── geo_locations (1:1)
```

---

## Tables

### 1. `user_profiles`

**Purpose:** User profile information and customization

**Key Fields:**
- `user_id` — References `auth_users(id)` (1:1)
- `display_name` — User's display name
- `bio` — Profile bio
- `avatar_url` — Avatar image URL
- `banner_url` — Banner image URL
- `theme_color` — Profile theme color (default: '#7A5AF8')
- `profile_music_url` — Music player URL
- `profile_music_provider` — 'spotify' | 'soundcloud' (Alpha only)

**Alpha Constraints:**
- Music provider limited to Spotify/SoundCloud
- No custom CSS storage

**Indexes:**
- `idx_user_profiles_user_id` — Fast user lookup
- `idx_user_profiles_display_name` — Search by name

---

### 2. `profile_rooms`

**Purpose:** Profile rooms (profiles as rooms concept)

**Key Fields:**
- `profile_id` — References `user_profiles(id)` (1:1)
- `layout` — JSONB layout data (modules, positions)
- `background_url` — Background image URL
- `background_color` — Background color

**Alpha Constraints:**
- Limited modules (guestbook, music, text)
- No marketplace modules
- No custom CSS

**Indexes:**
- `idx_profile_rooms_profile_id` — Fast profile lookup

---

### 3. `room_modules`

**Purpose:** Individual modules within profile rooms

**Key Fields:**
- `room_id` — References `profile_rooms(id)` (N:1)
- `module_type` — 'guestbook' | 'music' | 'text' (Alpha only)
- `position_x`, `position_y` — Drag-drop positions
- `content` — JSONB module-specific content
- `display_order` — Display order

**Alpha Constraints:**
- Module types limited to Alpha scope
- No custom modules

**Indexes:**
- `idx_room_modules_room_id` — Fast room lookup
- `idx_room_modules_type` — Filter by type

---

### 4. `chats`

**Purpose:** Chat conversations (1:1 and group)

**Key Fields:**
- `chat_type` — 'direct' | 'group'
- `room_name` — Group room name (NULL for 1:1)
- `owner_id` — Room owner (NULL for 1:1)
- `is_public` — Public/private (group only)
- `max_participants` — Max users (Alpha limit: 10)
- `music_url`, `music_provider` — Room music (group only)

**Alpha Constraints:**
- Max participants: 10 (enforced at schema level)
- Text-only (no video)
- Music provider: Spotify/SoundCloud only

**Indexes:**
- `idx_chats_owner` — Find rooms by owner
- `idx_chats_type` — Filter by type

---

### 5. `chat_participants`

**Purpose:** Group chat participants

**Key Fields:**
- `chat_id` — References `chats(id)` (N:1)
- `user_id` — References `auth_users(id)` (N:1)
- `role` — 'OWNR' | 'MOD' | 'USER'
- `is_banned` — Ban status

**Alpha Constraints:**
- Roles limited to Alpha scope (no AGENT)

**Indexes:**
- `idx_chat_participants_chat` — Find participants
- `idx_chat_participants_user` — Find user's chats

---

### 6. `messages`

**Purpose:** Chat messages (1:1 and group)

**Key Fields:**
- `chat_id` — References `chats(id)` (N:1)
- `sender_id` — References `auth_users(id)` (N:1)
- `message_text` — Message content
- `message_type` — 'text' | 'image' | 'audio' (Alpha only)
- `media_url` — Media URL (not stored in DB)
- `media_metadata` — JSONB media info
- `reactions` — JSONB reactions
- `read_by` — JSONB array of user_ids who read

**Alpha Constraints:**
- Message types: text, image, audio only (no video)
- Media stored as URLs (not in DB)

**Indexes:**
- `idx_messages_chat_id` — Fast chat message lookup
- `idx_messages_sender_id` — Find user's messages
- `idx_messages_created_at` — Chronological ordering
- `idx_messages_type` — Filter by type

---

### 7. `presence`

**Purpose:** User presence (online/typing status)

**Key Fields:**
- `user_id` — References `auth_users(id)` (1:1, PRIMARY KEY)
- `status` — 'online' | 'away' | 'offline'
- `activity` — 'chatting' | 'browsing' | 'idle'
- `current_chat_id` — Current chat (if any)
- `current_room_id` — Current room (if any)
- `last_seen_at` — Last activity timestamp
- `updated_at` — Last update timestamp

**Alpha Constraints:**
- Ephemeral (TTL-friendly, cleanup job every 60-120s)
- No historical storage

**Indexes:**
- `idx_presence_status` — Find online users
- `idx_presence_chat` — Find users in chat
- `idx_presence_updated` — Cleanup old entries

---

### 8. `blocks`

**Purpose:** User blocking relationships

**Key Fields:**
- `blocker_id` — References `auth_users(id)` (N:1)
- `blocked_id` — References `auth_users(id)` (N:1)
- `created_at` — Block timestamp

**Alpha Constraints:**
- Mutual blocking enforced at application layer
- Cannot block self (CHECK constraint)

**Indexes:**
- `idx_blocks_blocker` — Find who user blocked
- `idx_blocks_blocked` — Find who blocked user

---

### 9. `reports`

**Purpose:** Safety reports for moderation

**Key Fields:**
- `reporter_id` — References `auth_users(id)` (N:1)
- `reported_user_id` — Reported user (if applicable)
- `reported_chat_id` — Reported chat (if applicable)
- `reported_message_id` — Reported message (if applicable)
- `reported_room_id` — Reported room (if applicable)
- `report_type` — 'harassment' | 'spam' | 'inappropriate' | 'abuse' | 'scam' | 'other'
- `description` — Report description
- `context_snapshot` — JSONB preserved context
- `status` — 'pending' | 'reviewing' | 'resolved' | 'dismissed'
- `reviewed_by` — Moderator who reviewed
- `review_notes` — Review notes

**Alpha Constraints:**
- Manual review required
- Context snapshots preserved

**Indexes:**
- `idx_reports_status` — Find pending reports
- `idx_reports_reporter` — Find user's reports
- `idx_reports_reported_user` — Find reports about user
- `idx_reports_created_at` — Chronological ordering

---

### 10. `moderation_actions`

**Purpose:** Moderation audit log

**Key Fields:**
- `moderator_id` — References `auth_users(id)` (N:1)
- `target_user_id` — References `auth_users(id)` (N:1)
- `action_type` — 'warn' | 'mute' | 'restrict' | 'escalate'
- `reason` — Action reason
- `duration_minutes` — Duration (NULL = permanent)
- `expires_at` — Expiration timestamp
- `report_id` — Related report (if any)
- `is_reversed` — Reversal status
- `reversed_by` — Who reversed (if reversed)
- `reversal_reason` — Reversal reason

**Alpha Constraints:**
- All actions logged (no shadow actions)
- Reversible (duration-based)

**Indexes:**
- `idx_moderation_actions_target` — Find user's actions
- `idx_moderation_actions_moderator` — Find moderator's actions
- `idx_moderation_actions_report` — Find report's actions
- `idx_moderation_actions_expires` — Find expiring actions

---

### 11. `geo_locations`

**Purpose:** Approximate location for geo-first discovery

**Key Fields:**
- `user_id` — References `auth_users(id)` (1:1, PRIMARY KEY)
- `city_hash` — SHA-256 hash of city name
- `neighborhood_hash` — SHA-256 hash of neighborhood (optional)
- `latitude` — Approximate latitude (~1km precision)
- `longitude` — Approximate longitude (~1km precision)
- `updated_at` — Last update timestamp

**Alpha Constraints:**
- City/neighborhood tier only (no precise coordinates)
- Hashed for privacy
- Approximate coordinates (rounded to ~1km)

**Indexes:**
- `idx_geo_locations_city` — Find users by city
- `idx_geo_locations_neighborhood` — Find users by neighborhood
- `idx_geo_locations_coords` — Distance queries

---

## Alpha Constraints (Schema-Level)

### Enforced via CHECK Constraints

1. **Max Participants:** `chats.max_participants <= 10`
2. **Message Types:** `messages.message_type IN ('text', 'image', 'audio')`
3. **Music Providers:** `user_profiles.profile_music_provider IN ('spotify', 'soundcloud')`
4. **Module Types:** `room_modules.module_type IN ('guestbook', 'music', 'text')`
5. **Block Self:** `blocks.blocker_id != blocks.blocked_id`

### Enforced at Application Layer

1. **Age Layers** — Soft for Alpha, hard-gated in Beta+
2. **Mutual Blocking** — Application logic
3. **Group Size Limits** — Application validation (schema supports up to 10)

---

## Indexes Summary

**High-Priority Indexes (Alpha Queries):**
- User lookups: `user_profiles.user_id`, `presence.user_id`
- Chat queries: `messages.chat_id`, `chat_participants.chat_id`
- Presence queries: `presence.status`, `presence.updated_at`
- Report queries: `reports.status`, `reports.created_at`
- Geo queries: `geo_locations.city_hash`, `geo_locations(latitude, longitude)`

**All indexes are Alpha-optimized** — No premature optimization for scale.

---

## Deliberately Missing (Alpha OUT)

The following are **DELIBERATELY excluded** from Alpha schema:

❌ **Video Chat**
- `webrtc_sessions`
- `video_rooms`
- `video_participants`

❌ **Payments**
- `bits` (currency)
- `payments`
- `subscriptions`

❌ **Marketplace**
- `products`
- `transactions`
- `marketplace_items`

❌ **Events**
- `events`
- `event_attendees`
- `event_invites`

❌ **Boosts**
- `boosts`
- `boost_purchases`

❌ **Advanced Features**
- Custom CSS storage
- Advanced analytics
- Notification preferences (beyond basic)
- Friend/follow relationships (not in Alpha scope)
- Posts/feed tables (not in Alpha scope)

**These will be added in Beta+ if needed.**

---

## Migration Notes

### Existing Tables to Migrate

1. **`user_profiles`** — Already exists, verify schema matches
2. **`chat_rooms`** → **`chats`** — Rename and restructure
3. **`chat_room_members`** → **`chat_participants`** — Rename
4. **`chat_room_messages`** → **`messages`** — Consolidate with private_messages
5. **`private_messages`** → **`messages`** — Merge into unified messages table

### New Tables to Create

1. **`profile_rooms`** — New
2. **`room_modules`** — New
3. **`presence`** — New
4. **`blocks`** — New
5. **`reports`** — New
6. **`moderation_actions`** — New
7. **`geo_locations`** — New

---

## Usage Guidelines

### Alpha Schema Rules

1. **No migrations after Alpha** unless critical (security, data loss)
2. **All new tables** must be documented here before implementation
3. **Breaking changes** require Alpha reset approval
4. **Schema drift** must be caught in CI/CD

### Query Patterns (Alpha)

**Common Queries:**
- Get user profile: `SELECT * FROM user_profiles WHERE user_id = ?`
- Get chat messages: `SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC`
- Get online users: `SELECT * FROM presence WHERE status = 'online'`
- Get pending reports: `SELECT * FROM reports WHERE status = 'pending' ORDER BY created_at DESC`
- Find nearby users: `SELECT * FROM geo_locations WHERE city_hash = ?`

**All queries are Alpha-optimized** — Simple, explicit, no premature optimization.

---

## Relationship Diagram

```
auth_users (view)
  │
  ├─→ user_profiles (1:1)
  │     └─→ profile_rooms (1:1)
  │           └─→ room_modules (N:1)
  │
  ├─→ chats (N:1 owner)
  │     ├─→ chat_participants (N:1)
  │     └─→ messages (N:1)
  │
  ├─→ presence (1:1)
  ├─→ blocks (N:M)
  ├─→ reports (N:1 reporter, N:1 reported)
  ├─→ moderation_actions (N:1 moderator, N:1 target)
  └─→ geo_locations (1:1)
```

---

## Final Notes

**This schema is LOCKED for Alpha.**

- ✅ Explicit tables only
- ✅ No polymorphic magic
- ✅ No premature optimization
- ✅ No future-facing fields
- ✅ Alpha scope only

**Changes require:**
1. Alpha reset approval
2. Migration plan
3. Schema documentation update

**Remember:** Perfect the foundation, not shipping everything.

