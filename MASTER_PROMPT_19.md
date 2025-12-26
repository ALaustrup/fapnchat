# MASTER PROMPT 19
## CUSTOMIZATION EDITOR & SAFETY MODEL

**SYSTEM MODE**: EDITOR & SAFETY ARCHITECT

Design the room customization editor for WYA!? that enables creativity while enforcing safety.

---

## Input

- Full "Profiles as virtual rooms" specification (MASTER_PROMPT_14)
- Room Engine & Module System (MASTER_PROMPT_18)
- Product Governance Framework
- The 4 Sacred Invariants

---

## Architectural Truths

### Why Customization Must Be Reversible

**Psychological Safety**:
- Users must feel safe to experiment
- Mistakes must be recoverable
- Creativity requires trial and error
- **Consequence**: Version history is essential, not optional

**Moderation Safety**:
- Moderation must operate without destroying personality
- Safety must exist without sterilization
- **Consequence**: Sandboxing prevents abuse without killing creativity

---

## The Constraints That Must Never Break

### Constraint #1: Customization Must Be Reversible
- ✅ **REQUIRED**: Version history (all changes tracked)
- ✅ **REQUIRED**: Undo, rollback, recover
- ✅ **REQUIRED**: Auto-save (don't lose work)
- **Rationale**: Creativity requires psychological safety

### Constraint #2: Music is Ambient, Never Hijacking
- ✅ **REQUIRED**: Autoplay off (always)
- ✅ **REQUIRED**: Volume capped (maximum 70%)
- ✅ **REQUIRED**: One source at a time (only one music player)
- ✅ **REQUIRED**: Always-visible mute (controls always visible)

### Constraint #3: Discovery Never Forces Exposure
- ✅ **REQUIRED**: Public default, but friends-only, private, age-restricted, strict mode are first-class
- **Rationale**: Protects vulnerable users, preserves trust

### Constraint #4: Customization Must Be Sandboxed
- ✅ **REQUIRED**: No JavaScript (CSS only for power-users)
- ✅ **REQUIRED**: Content moderation (all user content reviewed)
- ✅ **REQUIRED**: Age-gated features (advanced features require age)
- **Rationale**: Prevents 90% of security disasters while preserving creativity

---

## Define

### 1. Editor Modes

#### **View Mode** (Default, Visitors)

**Purpose**: View room as visitors see it

**Capabilities**:
- ✅ View all modules (as configured)
- ✅ Interact with interactive modules (guestbook, polls, etc.)
- ✅ Play media (user-initiated, autoplay off)
- ❌ **FORBIDDEN**: Modify room (read-only)

**Performance**:
- Full room performance (all modules loaded)
- Media on-demand (user-initiated)

**UI Indicators**:
- No edit controls visible
- Full room experience
- Visitor perspective

---

#### **Edit Mode** (Owner, Customization)

**Purpose**: Customize room layout, modules, content

**Capabilities**:
- ✅ Add/remove modules
- ✅ Rearrange modules (drag-and-drop)
- ✅ Edit module content (text, images, etc.)
- ✅ Configure module settings (permissions, visibility)
- ✅ Change room settings (privacy, music, theme)
- ❌ **FORBIDDEN**: Breaking room structure (must maintain frame)

**Performance**:
- Editor overhead (preview, controls)
- Real-time preview (live updates)
- Performance warnings (approaching budget)

**UI Indicators**:
- Edit controls visible (toolbar, module controls)
- Preview mode (see changes live)
- Save indicators (auto-save status, version history)

---

#### **Preview Mode** (Testing Changes)

**Purpose**: Preview changes before saving

**Capabilities**:
- ✅ See changes as visitors will see them
- ✅ Test interactions (guestbook, polls, etc.)
- ✅ Test media playback (music, video)
- ✅ Test performance (load time, memory)
- ❌ **FORBIDDEN**: Making changes (read-only preview)

**Performance**:
- Full room performance (all modules loaded)
- Performance monitoring (warnings, budgets)

**UI Indicators**:
- Preview overlay (shows "Preview" badge)
- Exit preview button (return to edit)
- Performance indicators (load time, memory usage)

---

### 2. Permission Checks Per Customization Level

#### **Level 1: Aesthetic Freedom** (All Users)

**Allowed**:
- ✅ Change background (images, gradients, colors)
- ✅ Change theme colors (accent colors, glow colors)
- ✅ Change fonts (from allowed font list)
- ✅ Change text styling (sizes, weights, colors)

**Permission Checks**:
- ✅ **REQUIRED**: User authenticated (logged in)
- ✅ **REQUIRED**: Content moderation (background images reviewed)
- ❌ **FORBIDDEN**: Age gate (available to all ages)
- ❌ **FORBIDDEN**: Subscription gate (available to all users)

**Constraints**:
- Background images must be moderated (reviewed before visible)
- Fonts limited to allowed list (security, performance)
- Colors limited to safe palette (accessibility, contrast)

---

#### **Level 2: Spatial Control** (Age 13+)

**Allowed**:
- ✅ Rearrange modules (drag-and-drop)
- ✅ Resize modules (within limits)
- ✅ Create custom layouts (grid, freeform)
- ✅ Add/remove module slots

**Permission Checks**:
- ✅ **REQUIRED**: User authenticated (logged in)
- ✅ **REQUIRED**: Age 13+ (age gate)
- ✅ **REQUIRED**: Performance budget (max modules enforced)
- ❌ **FORBIDDEN**: Subscription gate (available to free users)

**Constraints**:
- Maximum modules enforced (performance budget)
- Module sizes limited (prevent abuse)
- Layouts must be valid (no overlapping, breaking structure)

---

#### **Level 3: Media Expression** (Age 16+)

**Allowed**:
- ✅ Add music player (Spotify, SoundCloud)
- ✅ Add video player (YouTube, Vimeo)
- ✅ Add photo galleries (uploaded images)
- ✅ Add media widgets (embeds, iframes)

**Permission Checks**:
- ✅ **REQUIRED**: User authenticated (logged in)
- ✅ **REQUIRED**: Age 16+ (age gate)
- ✅ **REQUIRED**: Content moderation (uploaded media reviewed)
- ✅ **REQUIRED**: Media budget (one source at a time)
- ❌ **FORBIDDEN**: Subscription gate (available to free users)

**Constraints**:
- One media source at a time (always)
- Autoplay off (always)
- Volume capped (maximum 70%)
- Always-visible mute (controls always visible)
- Uploaded media moderated (reviewed before visible)

---

#### **Level 4: Power-User Extension** (Age 18+, Subscription)

**Allowed**:
- ✅ CSS sandbox (custom CSS, no JavaScript)
- ✅ Advanced animations (custom keyframes)
- ✅ Templates (create, share, use)
- ✅ Marketplace (buy/sell templates, modules)

**Permission Checks**:
- ✅ **REQUIRED**: User authenticated (logged in)
- ✅ **REQUIRED**: Age 18+ (age gate)
- ✅ **REQUIRED**: Subscription (premium tier)
- ✅ **REQUIRED**: Trust score (minimum trust required)
- ✅ **REQUIRED**: Sandboxing (CSS only, no JavaScript)

**Constraints**:
- No JavaScript (CSS only, prevents 90% of security disasters)
- CSS sandboxed (limited selectors, no external resources)
- Advanced animations limited (performance budget)
- Templates moderated (reviewed before public)
- Marketplace transactions (payment processing)

---

### 3. Content Moderation Flow

#### **Moderation Tiers**

**Automatic Moderation** (Immediate):
```typescript
// Content: Text, images, URLs
// Method: Automated scanning (AI, keyword filters)
// Action: Auto-approve (safe) or flag (suspicious)
// Performance: Immediate (no delay)
```

**Human Moderation** (Review Queue):
```typescript
// Content: Flagged content, power-user CSS
// Method: Human reviewers
// Action: Approve, reject, or request changes
// Performance: 24-48 hours (review queue)
```

**Community Moderation** (Reports):
```typescript
// Content: Reported content
// Method: Community reports + human review
// Action: Review, take action (remove, warn, ban)
// Performance: 24-48 hours (review queue)
```

#### **Moderation Flow**

**Upload Flow**:
1. User uploads content (image, text, CSS)
2. Automatic moderation scans (immediate)
3. If safe → Auto-approve (visible immediately)
4. If suspicious → Flag for review (hidden until approved)
5. Human reviewer reviews (24-48 hours)
6. If approved → Content visible
7. If rejected → User notified, content removed

**Report Flow**:
1. User reports content (abuse, inappropriate)
2. Content flagged for review (hidden if severe)
3. Human reviewer reviews (24-48 hours)
4. If violation → Content removed, user warned/banned
5. If false report → Content restored, reporter warned

**Moderation Rules**:
- ✅ **REQUIRED**: All user content reviewed (automatic or human)
- ✅ **REQUIRED**: Flagged content hidden until approved
- ✅ **REQUIRED**: Users notified of moderation actions
- ✅ **REQUIRED**: Appeal process (users can contest)
- ❌ **FORBIDDEN**: Auto-rejecting without review
- ❌ **FORBIDDEN**: Silent moderation (users must be notified)

---

### 4. Rollback and Recovery

#### **Version History System**

**Version Storage**:
```typescript
interface RoomVersion {
  id: string
  timestamp: number
  changes: Change[]
  snapshot: RoomState // Full room state snapshot
  autoSave: boolean // Auto-save or manual save
}
```

**Version Limits**:
- **Free Users**: Last 10 versions (30 days retention)
- **Premium Users**: Last 50 versions (90 days retention)
- **Power-Users**: Last 100 versions (180 days retention)

**Version Operations**:
- ✅ **View History**: See all versions (timeline, preview)
- ✅ **Restore Version**: Restore any version (undo changes)
- ✅ **Compare Versions**: See what changed (diff view)
- ✅ **Create Snapshot**: Manual save point (before major changes)

#### **Rollback Flow**

**Undo Last Change**:
1. User clicks "Undo" (toolbar, keyboard shortcut)
2. Last change reverted (immediate)
3. Version history updated (new version created)
4. Auto-save triggered (save reverted state)

**Restore Version**:
1. User opens version history (timeline view)
2. User selects version to restore (preview available)
3. User confirms restore (warning: will lose current changes)
4. Room restored to selected version (immediate)
5. New version created (current state saved as "before restore")

**Recovery Flow**:
1. User reports issue (room broken, lost changes)
2. Support accesses version history (all versions available)
3. Support restores working version (or helps user restore)
4. Issue resolved (user can continue editing)

**Rollback Rules**:
- ✅ **REQUIRED**: All changes tracked (version history)
- ✅ **REQUIRED**: Undo available (last change)
- ✅ **REQUIRED**: Restore available (any version)
- ✅ **REQUIRED**: Auto-save (don't lose work)
- ✅ **REQUIRED**: Manual save (create snapshots)
- ❌ **FORBIDDEN**: Losing changes (must be recoverable)
- ❌ **FORBIDDEN**: Limited undo (must support full history)

---

### 5. Abuse Prevention Without Killing Creativity

#### **Abuse Prevention Mechanisms**

**Sandboxing** (Technical):
```typescript
// CSS Sandbox: Limited selectors, no external resources
// No JavaScript: Prevents 90% of security disasters
// Content Moderation: All user content reviewed
// Performance Budgets: Prevent resource abuse
```

**Rate Limiting** (Behavioral):
```typescript
// Upload Limits: Max uploads per day (prevents spam)
// Change Limits: Max changes per hour (prevents abuse)
// Report Limits: Max reports per day (prevents false reports)
```

**Trust System** (Social):
```typescript
// Trust Score: Based on behavior, reports, moderation
// Trust Tiers: Low, Medium, High (affects permissions)
// Trust Decay: Trust decreases with violations
// Trust Recovery: Trust increases with good behavior
```

**Age Gating** (Safety):
```typescript
// Age Verification: Required for age-gated features
// Age Restrictions: Features limited by age
// Parental Controls: Parents can restrict children's access
```

#### **Abuse Prevention Without Killing Creativity**

**Allowed**:
- ✅ Creative expression (within bounds)
- ✅ Personalization (deep customization)
- ✅ Experimentation (trial and error)
- ✅ Innovation (new ideas, templates)

**Prevented**:
- ❌ Security exploits (sandboxing, no JavaScript)
- ❌ Resource abuse (performance budgets, rate limits)
- ❌ Inappropriate content (moderation, age gates)
- ❌ Harassment (reporting, trust system)

**Balance**:
- ✅ **REQUIRED**: Safety without sterilization
- ✅ **REQUIRED**: Moderation without destroying personality
- ✅ **REQUIRED**: Constraints that enable creativity (not kill it)
- ❌ **FORBIDDEN**: Over-moderation (killing creativity)
- ❌ **FORBIDDEN**: Under-moderation (allowing abuse)

---

## Output Requirements

### Editor System Architecture

**Core Systems**:
1. **Editor Manager** (modes, state, transitions)
2. **Permission System** (age gates, subscriptions, trust)
3. **Version History** (storage, restore, recovery)
4. **Content Moderation** (automatic, human, community)
5. **Abuse Prevention** (sandboxing, rate limiting, trust)

### Editor Modes Specification

**Modes**:
- View Mode (visitors, read-only)
- Edit Mode (owner, customization)
- Preview Mode (testing changes)

**Mode Transitions**:
- View → Edit (owner only)
- Edit → Preview (testing)
- Preview → Edit (return to edit)
- Edit → View (save changes)

### Permission System Specification

**Customization Levels**:
- Level 1: Aesthetic Freedom (all users)
- Level 2: Spatial Control (age 13+)
- Level 3: Media Expression (age 16+)
- Level 4: Power-User Extension (age 18+, subscription)

**Permission Checks**:
- Authentication (logged in)
- Age gates (minimum age)
- Subscriptions (premium tier)
- Trust scores (minimum trust)
- Content moderation (reviewed)

### Content Moderation System

**Moderation Tiers**:
- Automatic moderation (immediate, AI)
- Human moderation (24-48 hours, review queue)
- Community moderation (reports, human review)

**Moderation Flow**:
- Upload flow (automatic → human if flagged)
- Report flow (community reports → human review)
- Appeal process (users can contest)

### Version History System

**Version Storage**:
- Version limits (by user tier)
- Version operations (view, restore, compare, snapshot)
- Rollback flow (undo, restore, recovery)

**Recovery**:
- Undo last change (immediate)
- Restore version (any version)
- Recovery flow (support-assisted)

### Abuse Prevention System

**Mechanisms**:
- Sandboxing (CSS only, no JavaScript)
- Rate limiting (uploads, changes, reports)
- Trust system (behavior-based, tiered)
- Age gating (safety, restrictions)

**Balance**:
- Safety without sterilization
- Moderation without destroying personality
- Constraints that enable creativity

---

## Brand DNA Alignment

Every editor decision must align with:

1. **Profile as personal space** → Deep customization, reversible
2. **Presence over performance** → Real-time preview, but performance budgets
3. **Immersion over scrolling** → Editor doesn't break room metaphor
4. **Anti-algorithm philosophy** → User controls customization, not algorithms

---

## Success Criteria

The customization editor is successful when:

- ✅ Customization is reversible (version history, undo, restore)
- ✅ Permissions enforced (age gates, subscriptions, trust)
- ✅ Content moderated (automatic, human, community)
- ✅ Abuse prevented (sandboxing, rate limiting, trust)
- ✅ Creativity enabled (deep customization, experimentation)
- ✅ Safety maintained (moderation, age gates, sandboxing)
- ✅ Music never hijacks (autoplay off, volume capped, one source)
- ✅ Discovery respects privacy (first-class privacy controls)

---

**CRITICAL**: This editor enables creativity while enforcing safety. Violating these rules breaks the customization system or allows abuse. Every customization must go through this system.

