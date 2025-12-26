# MASTER PROMPT 20
## PROFILE DISCOVERY & RECOMMENDATION (NON-ALGORITHMIC)

**SYSTEM MODE**: DISCOVERY SYSTEM DESIGNER

Design profile discovery for WYA!? that aligns with the Anti-Algorithm philosophy—AI may assist, but must never dictate.

---

## Input

- Full "Profiles as virtual rooms" specification (MASTER_PROMPT_14)
- Product Governance Framework (Anti-Algorithm philosophy)
- Core Navigation & World Structure (MASTER_PROMPT_13)
- Real-Time Data & Presence Model (MASTER_PROMPT_10)

---

## Architectural Truths

### Anti-Algorithm Philosophy

**Core Principle**:
- User intent always wins
- Algorithms assist, never dictate
- Discovery is intentional, not overwhelming
- Chronological order is default, not algorithmic

**Discovery Principles**:
- ✅ **Bounded discovery** (limited options, not infinite)
- ✅ **Intentional exploration** (user-driven, not system-driven)
- ✅ **Presence-driven** (who's here, not who's popular)
- ✅ **Transparent** (users see why suggestions were made)
- ✅ **Opt-in** (users choose algorithmic suggestions)

---

## The Constraints That Must Never Break

### Constraint #1: Discovery Never Forces Exposure
- ✅ **REQUIRED**: Public default, but friends-only, private, age-restricted, strict mode are first-class
- ✅ **REQUIRED**: Privacy controls are primary, not buried settings
- **Rationale**: Protects vulnerable users, preserves trust

### Constraint #2: No Infinite Feeds
- ❌ **FORBIDDEN**: Endless scrolling
- ❌ **FORBIDDEN**: Passive consumption
- ❌ **FORBIDDEN**: Algorithmic trance
- ✅ **REQUIRED**: Bounded discovery (limited options, intentional)

### Constraint #3: Algorithms Assist, They Never Dictate
- ❌ **FORBIDDEN**: Overriding user intent
- ❌ **FORBIDDEN**: Hiding chronology without consent
- ❌ **FORBIDDEN**: Replacing human choice
- ✅ **REQUIRED**: Chronological order is default
- ✅ **REQUIRED**: Algorithmic suggestions are opt-in

### Constraint #4: Discovery Avoids Popularity Bias
- ❌ **FORBIDDEN**: Ranking by popularity
- ❌ **FORBIDDEN**: Metrics-driven discovery
- ❌ **FORBIDDEN**: "Most liked" or "trending" feeds
- ✅ **REQUIRED**: Presence-driven discovery (who's here, not who's popular)

---

## Define

### 1. How Rooms Are Surfaced Without Infinite Feeds

#### **Discovery Mechanisms**

**Search** (User-Initiated):
```typescript
// User knows what they're looking for
// Intentional search (by name, username, tags)
// Results: Bounded list (max 20 results per page)
// Pagination: "Load more" button (intentional, not automatic)
// FORBIDDEN: Infinite scroll, auto-loading
```

**Browse** (User-Initiated):
```typescript
// User explores intentionally
// Categories: Rooms by theme, interest, activity
// Results: Bounded list (max 20 results per page)
// Pagination: "Load more" button (intentional, not automatic)
// Filters: User-selected (theme, age, privacy)
// FORBIDDEN: Infinite scroll, auto-loading
```

**Presence-Driven** (Who's Here):
```typescript
// Show rooms where friends/connections are present
// Show rooms nearby (location-based, if shared)
// Show active rooms (rooms with current activity)
// Results: Bounded list (max 10 results)
// Updates: Real-time (presence changes)
// FORBIDDEN: Ranking by popularity, metrics-driven
```

**Invitations** (Explicit):
```typescript
// User receives explicit invitation to room
// User can accept or decline
// Results: Invitation list (bounded, intentional)
// FORBIDDEN: Auto-joining, algorithmic invitations
```

**Recent Rooms** (Memory):
```typescript
// Show rooms user recently visited
// Show rooms user created
// Results: Bounded list (max 10 results)
// Updates: Based on user activity
// FORBIDDEN: Algorithmic ordering, popularity bias
```

#### **Surfacing Rules**

**Bounded Discovery**:
- ✅ **REQUIRED**: Limited options at any time (max 20 per page)
- ✅ **REQUIRED**: Clear boundaries (pagination, "Load more")
- ✅ **REQUIRED**: User-controlled (user initiates discovery)
- ❌ **FORBIDDEN**: Infinite scroll (violates bounded discovery)
- ❌ **FORBIDDEN**: Auto-loading (violates intentional discovery)

**Intentional Discovery**:
- ✅ **REQUIRED**: User initiates discovery (search, browse, follow presence)
- ✅ **REQUIRED**: Clear categories (user-selected filters)
- ✅ **REQUIRED**: User-controlled exploration (not system-driven)
- ❌ **FORBIDDEN**: Algorithmic suggestions as default (must be opt-in)
- ❌ **FORBIDDEN**: Passive consumption (user must act)

---

### 2. How Similarity is Calculated Transparently

#### **Similarity Factors** (Transparent)

**Explicit Factors** (User-Controlled):
```typescript
// Interests: User-selected interests match room tags
// Connections: Friends/connections in room
// Location: Geographic proximity (if shared)
// Activity: User activity matches room activity
// These are transparent: User sees why match occurred
```

**Implicit Factors** (Inferred, But Transparent):
```typescript
// Visit History: Rooms user visited (but transparent)
// Interaction History: Rooms user interacted with (but transparent)
// Time Patterns: When user is active (but transparent)
// These are transparent: User can see why match occurred
```

**Similarity Calculation**:
```typescript
interface SimilarityScore {
  factors: {
    interests: number // 0-1, weight: 0.3
    connections: number // 0-1, weight: 0.3
    location: number // 0-1, weight: 0.2
    activity: number // 0-1, weight: 0.2
  }
  total: number // 0-1, weighted sum
  explanation: string // "Matched because: interests, connections"
}
```

**Transparency Rules**:
- ✅ **REQUIRED**: Show why similarity was calculated (explanation)
- ✅ **REQUIRED**: Show similarity factors (interests, connections, etc.)
- ✅ **REQUIRED**: User can see similarity score (transparent)
- ✅ **REQUIRED**: User can adjust factors (preferences)
- ❌ **FORBIDDEN**: Hidden similarity calculation (must be transparent)
- ❌ **FORBIDDEN**: Black-box algorithms (must explain)

---

### 3. How Proximity Influences Discovery

#### **Proximity Types**

**Geographic Proximity** (Location-Based):
```typescript
// Rooms near user's location (if shared)
// Distance-based ranking (closer = higher)
// Privacy: Only if user shares location
// Opt-in: User must enable location sharing
```

**Social Proximity** (Connection-Based):
```typescript
// Rooms where friends/connections are present
// Connection strength (closer friends = higher)
// Privacy: Respects privacy settings
// Opt-in: User can disable social proximity
```

**Activity Proximity** (Temporal):
```typescript
// Rooms active when user is active
// Time-based matching (same timezone, same hours)
// Privacy: Based on activity patterns (not exact times)
// Opt-in: User can disable activity proximity
```

**Interest Proximity** (Content-Based):
```typescript
// Rooms with similar interests/tags
// Interest matching (user interests match room tags)
// Privacy: Based on public interests only
// Opt-in: User can disable interest proximity
```

#### **Proximity Influence Rules**

**Proximity Weighting**:
- ✅ **REQUIRED**: Proximity influences discovery order (not replaces)
- ✅ **REQUIRED**: Chronological order is default (proximity enhances)
- ✅ **REQUIRED**: User can disable proximity (opt-out)
- ✅ **REQUIRED**: Proximity is transparent (user sees why)
- ❌ **FORBIDDEN**: Proximity replaces chronological order (must be opt-in)
- ❌ **FORBIDDEN**: Hidden proximity (must be transparent)

**Privacy Respect**:
- ✅ **REQUIRED**: Respect privacy settings (private rooms not surfaced)
- ✅ **REQUIRED**: Respect age restrictions (age-gated rooms filtered)
- ✅ **REQUIRED**: Respect block lists (blocked users' rooms hidden)
- ❌ **FORBIDDEN**: Surfacing private rooms (violates privacy)
- ❌ **FORBIDDEN**: Ignoring age restrictions (safety)

---

### 4. How Users Opt Into or Out of Recommendation

#### **Recommendation Opt-In System**

**Default State** (Chronological):
```typescript
// Default: Chronological order (no recommendations)
// Discovery: Search, browse, presence-driven only
// No algorithmic suggestions (user must opt-in)
```

**Opt-In** (Algorithmic Suggestions):
```typescript
// User enables "Recommended Rooms" feature
// Algorithmic suggestions appear (clearly labeled)
// User can adjust factors (interests, connections, etc.)
// User can disable anytime (opt-out)
```

**Opt-Out** (Disable Recommendations):
```typescript
// User disables "Recommended Rooms" feature
// Returns to chronological order (default)
// No algorithmic suggestions (pure user control)
```

#### **Recommendation Controls**

**Recommendation Settings**:
```typescript
interface RecommendationSettings {
  enabled: boolean // Opt-in/opt-out
  factors: {
    interests: boolean // Use interests for recommendations
    connections: boolean // Use connections for recommendations
    location: boolean // Use location for recommendations
    activity: boolean // Use activity for recommendations
  }
  transparency: boolean // Show why recommendations were made
}
```

**Recommendation UI**:
- ✅ **REQUIRED**: Clear labeling ("Recommended" badge)
- ✅ **REQUIRED**: Explanation visible ("Matched because: interests, connections")
- ✅ **REQUIRED**: Opt-out button (disable recommendations)
- ✅ **REQUIRED**: Settings accessible (user can adjust factors)
- ❌ **FORBIDDEN**: Hidden recommendations (must be clearly labeled)
- ❌ **FORBIDDEN**: Forced recommendations (must be opt-in)

---

### 5. How Discovery Avoids Popularity Bias

#### **Popularity Bias Prevention**

**No Popularity Metrics**:
```typescript
// FORBIDDEN: Ranking by likes, followers, views
// FORBIDDEN: "Most liked" or "trending" feeds
// FORBIDDEN: Metrics-driven discovery
// FORBIDDEN: Popularity-based recommendations
```

**Presence-Driven Discovery**:
```typescript
// Show rooms where friends/connections are present (not popular)
// Show active rooms (current activity, not historical popularity)
// Show nearby rooms (geographic, not popularity)
// Show similar interests (content-based, not popularity)
```

**Chronological Default**:
```typescript
// Default: Chronological order (newest first, or user preference)
// No popularity bias (all rooms treated equally)
// User can sort (newest, oldest, alphabetical)
// FORBIDDEN: Popularity-based sorting (must be opt-in, clearly labeled)
```

**Transparent Ranking**:
```typescript
// If ranking exists, show why (explanation)
// If popularity is used, clearly label ("Popular Rooms" section)
// User can disable popularity-based discovery (opt-out)
// FORBIDDEN: Hidden popularity bias (must be transparent)
```

#### **Discovery Order Rules**

**Default Order** (Chronological):
- ✅ **REQUIRED**: Chronological order is default (newest first, or user preference)
- ✅ **REQUIRED**: No popularity bias (all rooms treated equally)
- ✅ **REQUIRED**: User can sort (newest, oldest, alphabetical)
- ❌ **FORBIDDEN**: Popularity-based default (must be opt-in)

**Optional Order** (Algorithmic, Opt-In):
- ✅ **REQUIRED**: Algorithmic order is opt-in (user enables)
- ✅ **REQUIRED**: Clearly labeled ("Recommended Rooms")
- ✅ **REQUIRED**: Transparent (explanation visible)
- ✅ **REQUIRED**: User can disable (opt-out)
- ❌ **FORBIDDEN**: Algorithmic order as default (violates anti-algorithm)

**Presence Order** (Who's Here):
- ✅ **REQUIRED**: Presence-driven discovery (who's here, not who's popular)
- ✅ **REQUIRED**: Real-time updates (presence changes)
- ✅ **REQUIRED**: Transparent (user sees why)
- ❌ **FORBIDDEN**: Popularity-based presence (must be actual presence)

---

## Output Requirements

### Discovery System Architecture

**Core Systems**:
1. **Discovery Manager** (search, browse, presence-driven, invitations)
2. **Similarity Calculator** (transparent, user-controlled)
3. **Proximity Engine** (geographic, social, activity, interest)
4. **Recommendation System** (opt-in, transparent, user-controlled)
5. **Popularity Bias Prevention** (no metrics-driven discovery)

### Discovery Mechanisms Specification

**Mechanisms**:
- Search (user-initiated, intentional)
- Browse (user-initiated, intentional)
- Presence-driven (who's here, not who's popular)
- Invitations (explicit, user-controlled)
- Recent rooms (memory-based)

**Rules**:
- Bounded discovery (limited options, not infinite)
- Intentional discovery (user-driven, not system-driven)
- No infinite feeds (violates bounded discovery)

### Similarity System Specification

**Similarity Factors**:
- Explicit factors (interests, connections, location, activity)
- Implicit factors (visit history, interaction history, time patterns)
- Transparency (explanation, factors visible, user-controlled)

**Similarity Calculation**:
- Weighted factors (interests 0.3, connections 0.3, location 0.2, activity 0.2)
- Transparent scoring (explanation visible)
- User-controlled (user can adjust factors)

### Proximity System Specification

**Proximity Types**:
- Geographic proximity (location-based, opt-in)
- Social proximity (connection-based, opt-in)
- Activity proximity (temporal, opt-in)
- Interest proximity (content-based, opt-in)

**Proximity Rules**:
- Proximity influences discovery (not replaces)
- Chronological order is default (proximity enhances)
- User can disable proximity (opt-out)
- Privacy respected (private rooms not surfaced)

### Recommendation System Specification

**Opt-In System**:
- Default: Chronological order (no recommendations)
- Opt-in: Algorithmic suggestions (clearly labeled)
- Opt-out: Disable recommendations (return to chronological)

**Recommendation Controls**:
- Settings (enable/disable, adjust factors)
- Transparency (explanation visible)
- User-controlled (user can adjust anytime)

### Popularity Bias Prevention

**Prevention Mechanisms**:
- No popularity metrics (no ranking by likes, followers, views)
- Presence-driven discovery (who's here, not who's popular)
- Chronological default (no popularity bias)
- Transparent ranking (if ranking exists, show why)

**Rules**:
- Default order: Chronological (no popularity bias)
- Optional order: Algorithmic (opt-in, clearly labeled)
- Presence order: Who's here (not who's popular)

---

## Brand DNA Alignment

Every discovery decision must align with:

1. **Anti-algorithm philosophy** → User intent always wins, algorithms assist
2. **No infinite feeds** → Bounded discovery, intentional exploration
3. **Presence over performance** → Presence-driven discovery, not metrics
4. **Discovery never forces exposure** → Privacy controls first-class

---

## Success Criteria

The discovery system is successful when:

- ✅ Rooms surfaced without infinite feeds (bounded, intentional)
- ✅ Similarity calculated transparently (explanation visible)
- ✅ Proximity influences discovery (not replaces, opt-in)
- ✅ Users can opt in/out of recommendations (user control)
- ✅ Discovery avoids popularity bias (presence-driven, chronological)
- ✅ Privacy respected (private rooms not surfaced)
- ✅ Chronological order is default (not algorithmic)
- ✅ Algorithmic suggestions are opt-in (not forced)

---

**CRITICAL**: This discovery system aligns with Anti-Algorithm philosophy. AI may assist, but must never dictate. User agency is primary. Violating these rules breaks the discovery system and violates Brand DNA.

