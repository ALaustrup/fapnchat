# WYA!? — Permission Lattice & Feature Gating

## Core Philosophy

**Permissions are not roles. Permissions are capabilities, granted contextually, revocable instantly, and explainable.**

- No "admin vs user" nonsense
- No hard-coded if-statements
- No hidden flags
- Everything flows through a lattice, not a hierarchy

---

## The Permission Lattice (Mental Model)

### Instead of a Tree (Hierarchy)

```
admin
 ├─ moderator
 └─ user
```

### We Use a Capability Graph (Lattice)

```typescript
// Capabilities (additive, not hierarchical)
can.chat.private
can.chat.group
can.chat.stranger
can.create.room
can.customize.room.css
can.host.video
can.moderate.room
can.sell.assets
can.run.events
can.access.mature
can.boost.discovery
```

**Users accumulate capabilities, not status.**

---

## Capability Sources (Additive, Never Implicit)

A capability can be granted by:

1. **Age layer** (minor, transitional, adult)
2. **Trust / social score** (behavior-based)
3. **Subscription tier** (free, premium, creator, family)
4. **Creator status** (marketplace access)
5. **Context** (room, event, proximity)
6. **Temporary grants** (time-bound)
7. **Safety overrides** (revocation)

**No single source is authoritative on its own.**

---

## Capability Resolution (Runtime)

### Resolution Formula

```typescript
EffectiveCapabilities =
  Base(age_layer)
+ Earned(trust, behavior)
+ Purchased(subscription, marketplace)
+ Contextual(room, proximity, event)
- Revoked(safety, moderation)
```

### Resolution Rules

- ✅ **REQUIRED**: Server-side resolution (never client-side)
- ✅ **REQUIRED**: Per-request resolution (fresh check)
- ✅ **REQUIRED**: Cached briefly (seconds, not minutes)
- ✅ **REQUIRED**: Additive sources (age + trust + subscription + context)
- ✅ **REQUIRED**: Safety overrides subtract (always dominant)
- ❌ **FORBIDDEN**: Client-side permission checks (must be server-side)
- ❌ **FORBIDDEN**: Long-term caching (must be fresh)

### Example: "Can Host a Video Room"

**Requirements**:
- Age layer: 18+
- Trust score: medium+
- Not under active restriction
- Optional: Premium or Creator tier for advanced features

**Resolution**:
```typescript
function canHostVideoRoom(userId: string): CapabilityResult {
  const ageLayer = getAgeLayer(userId) // 18+
  const trustScore = getTrustScore(userId) // medium+
  const restrictions = getActiveRestrictions(userId) // none
  const subscription = getSubscriptionTier(userId) // premium
  
  // Base capability (age + trust)
  const baseCapability = ageLayer >= 18 && trustScore >= 0.5 && restrictions.length === 0
  
  // Advanced features (subscription)
  const advancedFeatures = subscription === 'premium' || subscription === 'creator'
  
  return {
    granted: baseCapability,
    capabilities: {
      'can.host.video': baseCapability,
      'can.host.video.hd': baseCapability && advancedFeatures,
      'can.host.video.large': baseCapability && advancedFeatures,
      'can.host.video.effects': baseCapability && advancedFeatures
    },
    explanation: baseCapability ? 
      `You can host video rooms. ${advancedFeatures ? 'Advanced features enabled.' : 'Upgrade for HD, large rooms, and effects.'}` :
      `You cannot host video rooms. ${ageLayer < 18 ? 'Must be 18+.' : ''} ${trustScore < 0.5 ? 'Trust score too low.' : ''} ${restrictions.length > 0 ? 'Active restrictions.' : ''}`
  }
}
```

**Result**: User may host, but bitrate, room size, effects depend on tier. Nothing binary. Everything degrades gracefully.

---

## Feature Gating Types

### 1. Hard Gates (Rare, Safety-Only)

**Used For**:
- Age separation
- Legal compliance

**Examples**:
- `can.access.mature` (18+ only)
- `can.chat.cross_age` (never granted)

**Rules**:
- ✅ **REQUIRED**: Hard gates fail closed (deny by default)
- ✅ **REQUIRED**: Safety-only (never for monetization)
- ❌ **FORBIDDEN**: Hard gates for non-safety features

---

### 2. Soft Gates (Most Features)

**Used For**:
- Customization depth
- Rate limits
- Visibility boosts
- Room size
- Animation density

**Example**:
```typescript
// Free users: 3 animated modules
// Premium: unlimited
// Low-end devices: auto-cap at 2

function getMaxAnimatedModules(userId: string, deviceCapability: DeviceCapability): number {
  const subscription = getSubscriptionTier(userId)
  const baseLimit = subscription === 'premium' || subscription === 'creator' ? Infinity : 3
  const deviceLimit = deviceCapability.lowEnd ? 2 : Infinity
  
  return Math.min(baseLimit, deviceLimit)
}
```

**Rules**:
- ✅ **REQUIRED**: Feature exists for everyone (not binary)
- ✅ **REQUIRED**: Intensity varies (graceful degradation)
- ❌ **FORBIDDEN**: Binary gates for non-safety features (must degrade gracefully)

---

### 3. Contextual Gates (Powerful)

**Permissions that exist only in context**:
- `can.speak.now` (video room)
- `can.moderate.this_room` (room owner)
- `can.message.this_user` (not blocked)
- `can.check_in.here` (location-based)

**Rules**:
- ✅ **REQUIRED**: Granted dynamically (context-dependent)
- ✅ **REQUIRED**: Revoked instantly (context changes)
- ✅ **REQUIRED**: Context-aware (room, proximity, event)
- ❌ **FORBIDDEN**: Cached contextual permissions (must be fresh)

---

## Safety Overrides (Always Dominant)

### Safety Can Temporarily Subtract Capabilities

```typescript
// Safety can revoke:
- can.chat.stranger
- can.send.media
- can.host.rooms
```

### Safety Override Rules

- ✅ **REQUIRED**: Overrides are time-bound (not permanent)
- ✅ **REQUIRED**: Always explainable (user sees why)
- ✅ **REQUIRED**: Always appealable (user can appeal)
- ✅ **REQUIRED**: Never silent (user is notified)
- ✅ **REQUIRED**: Safety overrides are dominant (subtract from effective capabilities)
- ❌ **FORBIDDEN**: Permanent shadow states (must be time-bound)
- ❌ **FORBIDDEN**: Silent overrides (must notify user)

### Safety Override Example

```typescript
function applySafetyOverride(userId: string, capability: string): SafetyOverride {
  const riskScore = getRiskScore(userId)
  
  if (riskScore.level === 'intervene' || riskScore.level === 'protect') {
    return {
      revoked: [capability],
      reason: `Temporarily restricted due to ${riskScore.reasoning}`,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      appealable: true
    }
  }
  
  return { revoked: [], reason: null, expiresAt: null, appealable: false }
}
```

---

## Capability Introspection (User-Visible)

### Every User Can See

- **What they can do** (capabilities granted)
- **Why they can do it** (source of capability)
- **What would unlock more** (path to more capabilities)

### Example UI Copy

```
"You can host public rooms because:
• You're 22+
• Your trust score is high
• You're not under restriction

Upgrade to Premium for:
• HD video quality
• Larger room capacity
• Advanced effects"
```

### Introspection API

```typescript
function getCapabilityExplanation(userId: string, capability: string): CapabilityExplanation {
  const effective = resolveEffectiveCapabilities(userId)
  const granted = effective.capabilities[capability]
  
  if (!granted) {
    return {
      granted: false,
      sources: [],
      blockers: effective.blockers[capability] || [],
      pathToUnlock: getPathToUnlock(userId, capability)
    }
  }
  
  return {
    granted: true,
    sources: effective.sources[capability] || [],
    blockers: [],
    pathToUnlock: null
  }
}
```

**Rules**:
- ✅ **REQUIRED**: Users can see their capabilities (transparent)
- ✅ **REQUIRED**: Users can see why (source explanation)
- ✅ **REQUIRED**: Users can see path to unlock (upgrade path)
- ❌ **FORBIDDEN**: Hidden capabilities (must be visible)

---

## Feature Rollout Strategy

### New Features Are Introduced As

1. **Disabled capability** (feature exists, but not granted)
2. **Granted to internal users** (testing)
3. **Granted to creators** (early access)
4. **Granted to premium** (tier access)
5. **Gradually opened** (wider rollout)

### Rollout Example

```typescript
// Feature: can.customize.room.css

// Phase 1: Disabled (feature exists, not granted)
const rolloutPhase = {
  'can.customize.room.css': {
    phase: 'disabled',
    grantedTo: []
  }
}

// Phase 2: Internal users
rolloutPhase['can.customize.room.css'] = {
  phase: 'internal',
  grantedTo: ['internal-users']
}

// Phase 3: Creators
rolloutPhase['can.customize.room.css'] = {
  phase: 'creators',
  grantedTo: ['creator-tier']
}

// Phase 4: Premium
rolloutPhase['can.customize.room.css'] = {
  phase: 'premium',
  grantedTo: ['premium-tier', 'creator-tier']
}

// Phase 5: Gradual rollout
rolloutPhase['can.customize.room.css'] = {
  phase: 'gradual',
  grantedTo: ['premium-tier', 'creator-tier'],
  rolloutPercentage: 50 // 50% of eligible users
}
```

**Rules**:
- ✅ **REQUIRED**: No flags baked into code paths (capability-based)
- ✅ **REQUIRED**: Everything is a capability toggle (runtime configurable)
- ❌ **FORBIDDEN**: Hard-coded feature flags (must be capability-based)

---

## Capability Resolution Implementation

### Resolution Function

```typescript
function resolveEffectiveCapabilities(userId: string, context?: Context): EffectiveCapabilities {
  // 1. Base capabilities (age layer)
  const base = getBaseCapabilities(getAgeLayer(userId))
  
  // 2. Earned capabilities (trust, behavior)
  const earned = getEarnedCapabilities(userId)
  
  // 3. Purchased capabilities (subscription, marketplace)
  const purchased = getPurchasedCapabilities(userId)
  
  // 4. Contextual capabilities (room, proximity, event)
  const contextual = context ? getContextualCapabilities(userId, context) : {}
  
  // 5. Revoked capabilities (safety, moderation)
  const revoked = getRevokedCapabilities(userId)
  
  // 6. Merge (additive sources, subtract revoked)
  const effective = {
    ...base,
    ...earned,
    ...purchased,
    ...contextual
  }
  
  // 7. Apply revocations (safety overrides)
  for (const capability of revoked) {
    delete effective[capability]
  }
  
  return {
    capabilities: effective,
    sources: {
      ...baseSources,
      ...earnedSources,
      ...purchasedSources,
      ...contextualSources
    },
    blockers: revokedSources
  }
}
```

### Caching Strategy

```typescript
// Cache effective capabilities for 5 seconds (brief, not long-term)
const capabilityCache = new Map<string, { capabilities: EffectiveCapabilities, timestamp: number }>()

function getCachedCapabilities(userId: string): EffectiveCapabilities | null {
  const cached = capabilityCache.get(userId)
  if (cached && Date.now() - cached.timestamp < 5000) { // 5 seconds
    return cached.capabilities
  }
  return null
}

function cacheCapabilities(userId: string, capabilities: EffectiveCapabilities): void {
  capabilityCache.set(userId, {
    capabilities,
    timestamp: Date.now()
  })
}
```

---

## Capability Examples

### Example 1: Chat Capabilities

```typescript
// Base (age layer)
can.chat.private // All users
can.chat.group // All users
can.chat.stranger // 13+ (age layer)

// Earned (trust)
can.chat.stranger // Requires trust score 0.3+

// Purchased (subscription)
can.chat.group.large // Premium (groups > 50)

// Contextual (proximity)
can.chat.nearby // Same location tier

// Revoked (safety)
- can.chat.stranger // Safety override
```

### Example 2: Room Capabilities

```typescript
// Base (age layer)
can.create.room // All users
can.customize.room.basic // All users
can.customize.room.advanced // 13+ (age layer)

// Earned (trust)
can.customize.room.css // Trust score 0.7+ (age 18+)

// Purchased (subscription)
can.create.room.many // Premium (10+ rooms)
can.customize.room.unlimited // Premium (unlimited modules)

// Contextual (room owner)
can.moderate.this_room // Room owner
can.edit.this_room // Room owner

// Revoked (safety)
- can.create.room // Safety override
```

### Example 3: Discovery Capabilities

```typescript
// Base (all users)
can.discover.rooms // All users
can.discover.profiles // All users

// Purchased (subscription)
can.boost.discovery // Premium (boost visibility)

// Contextual (proximity)
can.discover.nearby // Same location tier

// Revoked (safety)
- can.discover.profiles // Safety override (restricted discovery)
```

---

## Capability Enforcement

### Server-Side Enforcement

```typescript
// Every request checks capabilities server-side
function enforceCapability(userId: string, capability: string, context?: Context): boolean {
  const effective = resolveEffectiveCapabilities(userId, context)
  
  if (!effective.capabilities[capability]) {
    throw new CapabilityDeniedError({
      capability,
      explanation: effective.blockers[capability] || 'Capability not granted',
      pathToUnlock: getPathToUnlock(userId, capability)
    })
  }
  
  return true
}
```

### Client-Side UI (Informational Only)

```typescript
// Client-side checks are informational only (for UI)
// Server-side checks are authoritative
function canUserDo(userId: string, capability: string): boolean {
  // This is for UI only, not enforcement
  // Server will reject if capability not granted
  const cached = getCachedCapabilities(userId)
  return cached?.capabilities[capability] || false
}
```

**Rules**:
- ✅ **REQUIRED**: Server-side enforcement (authoritative)
- ✅ **REQUIRED**: Client-side checks are informational only (for UI)
- ❌ **FORBIDDEN**: Client-side enforcement (must be server-side)

---

## Capability Audit Trail

### Every Capability Change Is Logged

```typescript
interface CapabilityAuditLog {
  userId: string
  capability: string
  action: 'granted' | 'revoked'
  source: 'age' | 'trust' | 'subscription' | 'context' | 'safety'
  reason: string
  timestamp: number
  actorId: string // System or moderator ID
}

function logCapabilityChange(auditLog: CapabilityAuditLog): void {
  // Append-only audit log
  db.insert('capability_audit_log', auditLog)
}
```

**Rules**:
- ✅ **REQUIRED**: All capability changes logged (audit trail)
- ✅ **REQUIRED**: Append-only log (immutable)
- ✅ **REQUIRED**: Include source, reason, actor (transparent)

---

## Success Criteria

The permission lattice system is successful when:

- ✅ Permissions are capabilities, not roles (lattice, not hierarchy)
- ✅ Capabilities are additive (age + trust + subscription + context)
- ✅ Safety overrides are dominant (subtract, time-bound, explainable)
- ✅ Feature gating degrades gracefully (soft gates, not binary)
- ✅ Users can see their capabilities (transparent, explainable)
- ✅ Server-side enforcement (authoritative, not client-side)
- ✅ No hard-coded if-statements (capability-based, not role-based)
- ✅ No hidden flags (everything is a capability toggle)

---

**CRITICAL**: This system prevents power abuse and pay-to-win rot. Permissions are contextual, explainable, and revocable. Violating these rules breaks trust and violates Brand DNA.

