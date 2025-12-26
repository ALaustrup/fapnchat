# WYA!? — Alpha Implementation Status

**Last Updated:** Alpha Launch Preparation
**Status:** 🚧 In Progress

---

## ✅ Completed

### 1. Alpha Scope & Planning
- ✅ `ALPHA_LAUNCH_PLAN.md` - Complete Alpha scope definition
- ✅ `ALPHA_SCHEMA_LOCK.md` - Database schema freeze documentation

### 2. Glass UI Primitives (Phase 1)
All components created in `apps/web/src/components/glass/`:

- ✅ `GlassPanel.jsx` - Core glassmorphism primitive
- ✅ `GlowButton.jsx` - Interactive button with semantic glow
- ✅ `FloatingCard.jsx` - Elevated glass card with depth
- ✅ `PresenceDot.jsx` - Online status indicator with glow
- ✅ `AnimatedBackground.jsx` - Ambient background with slow motion
- ✅ `index.js` - Barrel export for easy imports

**Design System Compliance:**
- Opacity limits enforced (0.1-0.25 for content)
- Blur limits enforced (8px-32px)
- Glow intensity follows semantic rules
- Motion is ambient (30-60s cycles)

---

## 🔧 In Progress

### 3. WebSocket Gateway
**Status:** Structure created, needs server integration

**Created:**
- ✅ `apps/web/src/app/api/ws/chat/route.js` - Route placeholder
- ✅ `apps/web/__create/websocket-gateway.js` - WebSocket handler logic

**Needs:**
- 🔧 Integration into server startup (`__create/index.ts`)
- 🔧 Auth session extraction from WebSocket upgrade
- 🔧 Database integration for message persistence
- 🔧 Testing with real connections

**Implementation Notes:**
- WebSocket server needs to be initialized alongside Hono server
- Upgrade handling must happen before route matching
- Connection management uses Map-based storage (Alpha-appropriate)

---

## 📋 Pending

### 4. Polish 1:1 Chat Experience
**Status:** Not Started

**Tasks:**
- Update `MessagesView.jsx` to use glass UI primitives
- Integrate WebSocket for real-time messaging
- Add typing indicators
- Add presence indicators
- Add message reactions (Alpha MVP)
- Add media support (image + audio only)

**Current State:**
- Basic chat UI exists but uses solid backgrounds
- Polling fallback in place
- Needs glass UI migration

---

### 5. Profile Room MVP
**Status:** Not Started

**Tasks:**
- Create room canvas component
- Implement drag-drop layout (limited modules)
- Add music player integration (Spotify/SoundCloud)
- Add guestbook module
- Save layout to database
- Background theme customization

**Dependencies:**
- Glass UI primitives ✅
- Database schema ✅

---

### 6. Moderation Dashboard
**Status:** Not Started

**Tasks:**
- Create report inbox UI
- Build conversation context viewer
- Implement one-click actions (warn, mute, restrict, escalate)
- Add moderation action logging
- Create operator UI (calm, low-contrast)

**Dependencies:**
- Database migrations for reports/blocks/moderation_actions
- Glass UI primitives ✅

---

### 7. Feature Flags System
**Status:** Not Started

**Tasks:**
- Create env-based feature flag service
- Add flag checks to routes/components
- Document Alpha feature flags

**Alpha Flags Needed:**
- `ALPHA_INVITE_ONLY` - Enable invite-only signup
- `ALPHA_GEO_LIMITED` - Restrict to specific cities
- `ALPHA_MAX_ROOM_SIZE` - Limit room participants (10)
- `ALPHA_MODERATION_MANUAL` - Require manual review

---

### 8. Geo-First Discovery
**Status:** Not Started

**Tasks:**
- Create location hashing service (city/neighborhood)
- Implement distance-first sorting
- Add manual refresh (no infinite feed)
- Age-layer filtering
- Location table migration

**Dependencies:**
- Database migration for locations table
- User location collection (opt-in)

---

## 🗄️ Database Migrations Needed

### High Priority (Alpha Blocking)
1. `presence` table - For online/typing status
2. `reports` table - For safety reports
3. `blocks` table - For user blocking
4. `moderation_actions` table - For moderation audit log
5. `locations` table - For geo-first discovery

**Migration Files Location:**
- `apps/web/src/app/api/{domain}/migrations.sql`

**Status:** Schemas documented in `ALPHA_SCHEMA_LOCK.md`, migrations not yet created

---

## 🎯 Next Immediate Actions

1. **Integrate WebSocket Gateway** (Priority 1)
   - Modify `__create/index.ts` to initialize WebSocket server
   - Test WebSocket connections
   - Add auth session extraction

2. **Create Database Migrations** (Priority 1)
   - Run migrations for missing tables
   - Verify existing schemas match Alpha requirements

3. **Update MessagesView with Glass UI** (Priority 2)
   - Replace solid backgrounds with glass components
   - Integrate WebSocket for real-time updates
   - Add presence and typing indicators

4. **Build Feature Flags** (Priority 2)
   - Simple env-based system
   - Document flags in `.env.example`

5. **Create Moderation Dashboard** (Priority 3)
   - Basic report inbox
   - Context viewer
   - Action buttons

---

## 📊 Alpha Readiness Checklist

- [x] Alpha scope locked
- [x] Schemas documented
- [x] Glass UI primitives created
- [ ] WebSocket gateway integrated
- [ ] Database migrations complete
- [ ] 1:1 chat polished
- [ ] Profile room MVP built
- [ ] Moderation dashboard created
- [ ] Feature flags implemented
- [ ] Geo-discovery implemented
- [ ] Invite-only access enabled
- [ ] Alpha deployment ready

**Current Progress:** ~30% Complete

---

## 🚨 Blockers

1. **WebSocket Integration** - Needs server modification
2. **Database Migrations** - Need to be created and run
3. **Auth Session Extraction** - WebSocket upgrade needs auth

---

## 📝 Notes

- Glass UI components follow design system constraints
- WebSocket gateway uses simple Map-based storage (appropriate for Alpha scale)
- All Alpha OUT features explicitly excluded
- Focus on foundation, not feature completeness

---

**Remember:** Alpha is about perfecting the foundation, not shipping everything.

