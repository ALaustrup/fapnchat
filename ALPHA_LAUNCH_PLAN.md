# WYA!? — Alpha Launch Plan

## Alpha Definition (what "alpha" means)

Alpha is not:

- Feature complete
- Public
- Polished
- Scaled

Alpha is:

- Architecturally correct
- Culturally aligned
- Safe by default
- Fun enough to feel "different"
- Small enough to fix fast

**Alpha success criterion:**

50–200 real users can meaningfully connect, customize, chat, and feel the WYA!? vibe without the system breaking or drifting.

---

## 1. Alpha scope lock (critical)

We intentionally exclude most things for Alpha.

### ✅ Alpha IN

These must exist and work beautifully:

- **Accounts & age layers**
  - Signup + login
  - Age verification (soft for now, hard-gated layers)
  - Age-segmented discovery

- **Geo-first discovery (simplified)**
  - Approximate location (city / neighborhood tier)
  - Distance-first sorting
  - Manual refresh, not infinite feed

- **Profiles as rooms (MVP)**
  - Room canvas
  - Avatar + name + status
  - Background theme + color
  - Music player (Spotify/SoundCloud only)
  - Guestbook
  - Drag-and-drop layout (limited)

- **1:1 chat (core magic)**
  - Real-time messaging
  - Presence (online / typing)
  - Reactions
  - Media (image + audio only)
  - Glass UI + motion polish

- **Small group rooms (text-only for alpha)**
  - 3–10 users
  - Presence list
  - Reactions

- **Basic moderation tools**
  - Block / report
  - Soft AI scanning (keyword + pattern)
  - Manual moderation dashboard
  - Age isolation enforced

- **Observability**
  - Logs
  - Metrics
  - Error tracking
  - Feature flags

### ❌ Alpha OUT (explicitly delayed)

These stay off until beta:

- Video chat
- Stranger chat roulette
- Marketplace
- Paid subscriptions
- Custom CSS
- Advanced boosts
- Events
- TURN/SFU infrastructure
- Heavy WebGL effects

**This is non-negotiable. Alpha collapses if we ignore this.**

---

## 2. Server-side Alpha architecture (what runs where)

You already have the correct base. We harden it.

### Runtime services (Alpha)

| Service | Status |
|---------|--------|
| React Router SSR | ✅ already running |
| Hono API | ✅ |
| PostgreSQL (Neon) | ✅ |
| WebSockets (chat + presence) | 🔧 implement |
| Nginx | ✅ |
| PM2 | ✅ |
| CDN | ❌ not needed yet |

### Add for Alpha

- **WebSocket gateway**
  - `/ws/chat`
  - `/ws/presence`

- **Feature flag service**
  - Env-based for now

- **Moderation queue**
  - Simple DB-backed table

- **Geo bucketing**
  - City / neighborhood hash only

**No microservices yet. Monolith stays.**

---

## 3. Data model freeze (Alpha schemas)

You must freeze schemas now to avoid thrash.

### Core tables (Alpha)

- `users`
- `profiles`
- `rooms` (profile rooms)
- `room_modules`
- `chats`
- `messages`
- `presence`
- `reports`
- `blocks`
- `moderation_actions`
- `locations` (hashed, approximate)

**No migrations after Alpha unless critical.**

---

## 4. Client contract (Alpha)

### Client guarantees

App must work with:

- No animations
- Slow network
- Reconnects
- Offline read-only mode
- Graceful degradation

### Client responsibilities

- Never assume presence is accurate
- Never trust local age
- Never render unsafe content optimistically
- Always respect server authority

---

## 5. UI implementation strategy (practical)

You do not build the entire glass universe at once.

### Phase 1 — Static glass primitives

Build once, reuse everywhere:

- `<GlassPanel>`
- `<GlowButton>`
- `<FloatingCard>`
- `<PresenceDot>`
- `<AnimatedBackground>`

These become your UI atoms.

### Phase 2 — Chat experience polish

This is the emotional core:

- Message motion
- Grouping
- Glow
- Presence
- Typing feedback

**Chat must feel alive even with 2 people.**

### Phase 3 — Profile room MVP

- One canvas
- Limited modules
- Drag-drop
- Save layout
- Music toggle

No marketplace. No templates yet.

---

## 6. Safety before scale (Alpha rules)

Alpha moderation rules are strict:

- Manual review > automation
- Fast response > perfection
- Over-blocking > under-blocking
- Human override always available

### Alpha moderation tooling

- Report inbox
- Conversation context viewer
- One-click actions:
  - Warn
  - Mute
  - Temporary restrict
  - Escalate

**No shadow actions. Everything visible.**

---

## 7. Alpha rollout plan (server → users)

### Step 1 — Internal Alpha (week 1)

- You + trusted testers
- 10–20 users
- Break everything
- Instrument logs

### Step 2 — Closed Alpha (week 2–3)

- Invite-only
- 50–100 users
- Geography-limited
- Daily feedback loop

### Step 3 — Expanded Alpha (week 4)

- 200–500 users
- Still invite-only
- Stress discovery + chat
- Begin cultural drift monitoring

**No public signup yet.**

---

## 8. Alpha success metrics (not vanity)

We do not measure:

- DAU
- Time on site
- Scroll depth

We do measure:

- Conversations per user
- Replies per conversation
- Mutual connections
- Profile customization rate
- Safety incidents resolved <24h
- "Felt different" qualitative feedback

**If these are strong, scale is possible.**

---

## 9. Immediate next actions (concrete)

Here's what we do next, in order:

1. ✅ Freeze Alpha scope (done above)
2. 🔧 Lock schemas
3. 🔧 Implement WebSocket layer
4. 🔧 Ship glass UI primitives
5. 🔧 Polish 1:1 chat
6. 🔧 Ship profile room MVP
7. 🔧 Add moderation dashboard
8. 🔧 Enable invite-only access
9. 🔧 Deploy Alpha tag to server
10. 🔧 Begin internal testing

---

## Final truth

You've already done the hardest part:  
**defining something worth building.**

**Now the work is discipline, not imagination.**

