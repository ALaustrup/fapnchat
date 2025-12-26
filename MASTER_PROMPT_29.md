# MASTER PROMPT 29
## BOOSTS, PROMOTION & TRANSPARENCY SYSTEM

**SYSTEM MODE**: DISCOVERY & ETHICS ENGINEER

Design the boost and promotion system for WYA!? that enhances visibility transparently without manipulating outcomes.

---

## Input

- Discovery Pipeline & Explanation Engine (MASTER_PROMPT_23)
- Subscription, Entitlement & Feature Gating System (MASTER_PROMPT_27)
- Product Governance Framework

---

## Architectural Truths

### Why This Boost System Works

**A. Boosts Are Transparent and Finite**:
- Clear labeling of boosted content
- No guarantees of outcomes
- Temporary effects only
- **Consequence**: Boosts become tools, not weapons

**B. Boosts Don't Override Proximity-First**:
- Proximity remains primary (80% weight)
- Boosts enhance visibility (20% weight)
- Boosts don't manipulate outcomes
- **Consequence**: Discovery remains proximity-first, not pay-to-win

**C. Boosts Have Anti-Addiction Safeguards**:
- Cooldowns prevent addiction patterns
- Limits prevent overspending
- User controls and opt-outs
- **Consequence**: Boosts don't become manipulative

---

## The Non-Negotiable Invariants

### Invariant #1: Paid Visibility Must Always Be Labeled
- ✅ **REQUIRED**: Clear labeling of boosted content
- ❌ **FORBIDDEN**: Dark patterns
- ❌ **FORBIDDEN**: "Organic-looking" promotion
- ❌ **FORBIDDEN**: Blending paid and unpaid signals
- **Rationale**: Trust once lost is unrecoverable

### Invariant #2: Boosts Must Never Override Proximity-First
- ✅ **REQUIRED**: Proximity remains primary (80% weight)
- ✅ **REQUIRED**: Boosts enhance visibility (20% weight)
- ❌ **FORBIDDEN**: Boosts override proximity (must be secondary)
- **Rationale**: Discovery must remain proximity-first, not pay-to-win

### Invariant #3: Boosts Must Be Transparent and Finite
- ✅ **REQUIRED**: Clear labeling, no outcome guarantees, temporary effects
- ✅ **REQUIRED**: Cooldowns, limits, user controls
- ❌ **FORBIDDEN**: Hidden boosts, permanent effects, no controls
- **Rationale**: Boosts must be tools, not weapons

---

## Define

### 1. Boost Mechanics and Limits

#### **Boost Types**

**Type 1: Profile Boost** (Increase Profile Visibility):
```typescript
interface ProfileBoost {
  type: 'profile'
  duration: number // Hours (1, 6, 24, 72)
  effect: {
    visibilityMultiplier: number // 1.2x, 1.5x, 2.0x (enhances, doesn't override)
    proximityWeight: number // 0.8 (proximity remains primary)
    boostWeight: number // 0.2 (boost is secondary)
  }
  cost: {
    '1-hour': 0.99 // $0.99 for 1 hour
    '6-hours': 4.99 // $4.99 for 6 hours
    '24-hours': 14.99 // $14.99 for 24 hours
    '72-hours': 39.99 // $39.99 for 72 hours
  }
  limits: {
    maxActive: 1 // Max 1 active boost at a time
    cooldown: 24 * 60 * 60 * 1000 // 24 hours cooldown
    monthlyLimit: 10 // Max 10 boosts per month
  }
}
```

**Type 2: Room Boost** (Increase Room Visibility):
```typescript
interface RoomBoost {
  type: 'room'
  duration: number // Hours (1, 6, 24, 72)
  effect: {
    visibilityMultiplier: number // 1.2x, 1.5x, 2.0x
    proximityWeight: number // 0.8 (proximity remains primary)
    boostWeight: number // 0.2 (boost is secondary)
  }
  cost: {
    '1-hour': 0.99
    '6-hours': 4.99
    '24-hours': 14.99
    '72-hours': 39.99
  }
  limits: {
    maxActive: 3 // Max 3 active boosts at a time (one per room)
    cooldown: 24 * 60 * 60 * 1000 // 24 hours cooldown
    monthlyLimit: 20 // Max 20 boosts per month
  }
}
```

**Type 3: Event Boost** (Increase Event Visibility):
```typescript
interface EventBoost {
  type: 'event'
  duration: number // Hours (until event starts)
  effect: {
    visibilityMultiplier: number // 1.2x, 1.5x, 2.0x
    proximityWeight: number // 0.8 (proximity remains primary)
    boostWeight: number // 0.2 (boost is secondary)
  }
  cost: {
    '1-hour': 0.99
    '6-hours': 4.99
    '24-hours': 14.99
    '72-hours': 39.99
  }
  limits: {
    maxActive: 5 // Max 5 active boosts at a time (one per event)
    cooldown: 24 * 60 * 60 * 1000 // 24 hours cooldown
    monthlyLimit: 30 // Max 30 boosts per month
  }
}
```

#### **Boost Mechanics**

**Boost Application**:
```typescript
function applyBoost(userId: string, boost: Boost): BoostResult {
  // 1. Validate boost (user can afford, within limits)
  if (!validateBoost(userId, boost)) {
    return { error: 'Boost not valid' }
  }
  
  // 2. Check cooldown (prevent addiction patterns)
  if (isOnCooldown(userId, boost.type)) {
    return { error: 'Boost on cooldown. Please wait before boosting again.' }
  }
  
  // 3. Check monthly limit (prevent overspending)
  if (hasReachedMonthlyLimit(userId, boost.type)) {
    return { error: 'Monthly boost limit reached. Limit resets next month.' }
  }
  
  // 4. Process payment
  const paymentResult = processPayment(userId, boost.cost)
  if (!paymentResult.success) {
    return { error: 'Payment failed' }
  }
  
  // 5. Activate boost (apply visibility multiplier)
  activateBoost(userId, boost)
  
  // 6. Set cooldown (prevent immediate re-boost)
  setCooldown(userId, boost.type, boost.limits.cooldown)
  
  // 7. Increment monthly count
  incrementMonthlyBoostCount(userId, boost.type)
  
  // 8. Notify user (confirmation, labeling)
  notifyUser(userId, {
    type: 'boost-activated',
    boost,
    message: `Your ${boost.type} boost is now active. It will be clearly labeled as "Boosted" in discovery.`,
    expiresAt: Date.now() + boost.duration * 60 * 60 * 1000
  })
  
  return {
    success: true,
    boostId: boost.id,
    expiresAt: Date.now() + boost.duration * 60 * 60 * 1000
  }
}
```

**Boost Rules**:
- ✅ **REQUIRED**: Cooldowns prevent addiction (24 hours between boosts)
- ✅ **REQUIRED**: Monthly limits prevent overspending (10-30 boosts/month)
- ✅ **REQUIRED**: Max active boosts (1-5 depending on type)
- ✅ **REQUIRED**: Temporary effects only (1-72 hours, not permanent)
- ❌ **FORBIDDEN**: No cooldowns (must prevent addiction)
- ❌ **FORBIDDEN**: Unlimited boosts (must have limits)
- ❌ **FORBIDDEN**: Permanent effects (must be temporary)

---

### 2. Clear Labeling Requirements

#### **Labeling System**

**Boost Labels**:
```typescript
interface BoostLabel {
  type: 'profile' | 'room' | 'event'
  label: string // "Boosted" badge
  placement: 'top-right' | 'bottom-right' | 'inline'
  style: {
    backgroundColor: '#FFB800' // Amber/yellow
    color: '#000000' // Black text
    fontSize: '12px'
    fontWeight: 'bold'
    borderRadius: '4px'
    padding: '4px 8px'
  }
  tooltip: string // "This profile/room/event is boosted. Boosts enhance visibility but don't guarantee outcomes."
}

function applyBoostLabel(item: Profile | Room | Event, boost: Boost): BoostLabel {
  return {
    type: boost.type,
    label: 'Boosted',
    placement: 'top-right',
    style: {
      backgroundColor: '#FFB800',
      color: '#000000',
      fontSize: '12px',
      fontWeight: 'bold',
      borderRadius: '4px',
      padding: '4px 8px'
    },
    tooltip: `This ${boost.type} is boosted. Boosts enhance visibility but don't guarantee outcomes.`
  }
}
```

**Labeling Rules**:
- ✅ **REQUIRED**: Clear "Boosted" badge (visible, not hidden)
- ✅ **REQUIRED**: Tooltip explaining boost (transparent, educational)
- ✅ **REQUIRED**: Consistent styling (amber/yellow, bold, visible)
- ✅ **REQUIRED**: Always visible (not hidden, not subtle)
- ❌ **FORBIDDEN**: Hidden labels (must be visible)
- ❌ **FORBIDDEN**: "Organic-looking" promotion (must be clearly labeled)
- ❌ **FORBIDDEN**: Blending paid and unpaid signals (must be distinct)

---

### 3. How Boosts Interact with Proximity-First Ranking

#### **Boost Integration with Discovery**

**Ranking with Boosts**:
```typescript
function applyBoostToRanking(
  candidates: Candidate[],
  boosts: Map<string, Boost>
): RankedCandidate[] {
  // Proximity-first ranking (80% weight)
  // Boosts enhance visibility (20% weight)
  // Boosts don't override proximity
  
  const ranked = candidates.map(candidate => {
    // Base ranking (proximity-first)
    const baseRanking = candidate.proximityScore * 0.8 + candidate.socialScore * 0.2
    
    // Check if boosted
    const boost = boosts.get(candidate.id)
    if (boost && boost.active) {
      // Apply boost multiplier (enhances, doesn't override)
      const boostedRanking = baseRanking * boost.effect.visibilityMultiplier
      
      // Weighted combination (proximity 80%, boost 20%)
      const finalRanking = baseRanking * boost.effect.proximityWeight + 
                          boostedRanking * boost.effect.boostWeight
      
      return {
        ...candidate,
        ranking: finalRanking,
        boosted: true,
        boostLabel: applyBoostLabel(candidate, boost)
      }
    }
    
    return {
      ...candidate,
      ranking: baseRanking,
      boosted: false
    }
  })
  
  // Sort by ranking (highest first)
  return ranked.sort((a, b) => b.ranking - a.ranking)
}
```

**Boost Interaction Rules**:
- ✅ **REQUIRED**: Proximity remains primary (80% weight)
- ✅ **REQUIRED**: Boosts enhance visibility (20% weight, multiplier)
- ✅ **REQUIRED**: Boosts don't override proximity (weighted combination)
- ✅ **REQUIRED**: Boosted items clearly labeled (transparent)
- ❌ **FORBIDDEN**: Boosts override proximity (must be secondary)
- ❌ **FORBIDDEN**: Hidden boosts (must be labeled)
- ❌ **FORBIDDEN**: Guaranteed outcomes (boosts enhance, don't guarantee)

---

### 4. Cooldowns and Anti-Addiction Safeguards

#### **Anti-Addiction Mechanisms**

**Cooldown System**:
```typescript
interface BoostCooldown {
  userId: string
  boostType: 'profile' | 'room' | 'event'
  lastBoostAt: number
  cooldownUntil: number
  cooldownDuration: number // 24 hours
}

function checkCooldown(userId: string, boostType: string): CooldownCheck {
  const cooldown = getCooldown(userId, boostType)
  
  if (Date.now() < cooldown.cooldownUntil) {
    const remaining = cooldown.cooldownUntil - Date.now()
    const hoursRemaining = Math.ceil(remaining / (60 * 60 * 1000))
    
    return {
      onCooldown: true,
      remaining: remaining,
      message: `Boost on cooldown. Please wait ${hoursRemaining} hours before boosting again.`
    }
  }
  
  return {
    onCooldown: false,
    remaining: 0,
    message: 'Boost available'
  }
}
```

**Monthly Limit System**:
```typescript
interface MonthlyLimit {
  userId: string
  boostType: 'profile' | 'room' | 'event'
  count: number
  limit: number // 10-30 depending on type
  resetDate: number // First of next month
}

function checkMonthlyLimit(userId: string, boostType: string): LimitCheck {
  const limit = getMonthlyLimit(userId, boostType)
  
  // Reset if new month
  if (Date.now() >= limit.resetDate) {
    resetMonthlyLimit(userId, boostType)
    return {
      reached: false,
      remaining: limit.limit,
      message: 'Monthly limit reset. Boosts available.'
    }
  }
  
  if (limit.count >= limit.limit) {
    const daysUntilReset = Math.ceil((limit.resetDate - Date.now()) / (24 * 60 * 60 * 1000))
    return {
      reached: true,
      remaining: 0,
      message: `Monthly boost limit reached. Limit resets in ${daysUntilReset} days.`
    }
  }
  
  return {
    reached: false,
    remaining: limit.limit - limit.count,
    message: `${limit.limit - limit.count} boosts remaining this month.`
  }
}
```

**Spending Limit System**:
```typescript
interface SpendingLimit {
  userId: string
  monthlySpending: number // USD
  limit: number // $100/month default
  resetDate: number
}

function checkSpendingLimit(userId: string, boostCost: number): SpendingCheck {
  const limit = getSpendingLimit(userId)
  
  // Reset if new month
  if (Date.now() >= limit.resetDate) {
    resetSpendingLimit(userId)
    return {
      exceeded: false,
      remaining: limit.limit,
      message: 'Spending limit reset.'
    }
  }
  
  if (limit.monthlySpending + boostCost > limit.limit) {
    return {
      exceeded: true,
      remaining: 0,
      message: `Monthly spending limit reached. Limit resets on ${new Date(limit.resetDate).toLocaleDateString()}.`
    }
  }
  
  return {
    exceeded: false,
    remaining: limit.limit - (limit.monthlySpending + boostCost),
    message: `$${(limit.limit - (limit.monthlySpending + boostCost)).toFixed(2)} remaining this month.`
  }
}
```

**Anti-Addiction Safeguards**:
- ✅ **REQUIRED**: Cooldowns (24 hours between boosts)
- ✅ **REQUIRED**: Monthly limits (10-30 boosts/month)
- ✅ **REQUIRED**: Spending limits ($100/month default)
- ✅ **REQUIRED**: Clear messaging (users see limits, cooldowns)
- ❌ **FORBIDDEN**: No cooldowns (must prevent addiction)
- ❌ **FORBIDDEN**: No limits (must prevent overspending)
- ❌ **FORBIDDEN**: Hidden limits (must be transparent)

---

### 5. User Controls and Opt-Outs

#### **User Controls**

**Boost Visibility Controls**:
```typescript
interface BoostVisibilityControls {
  userId: string
  showBoosted: boolean // Show boosted content (default: true)
  boostLabelOpacity: number // 0-1, label opacity (default: 1.0)
  boostTooltip: boolean // Show tooltip on hover (default: true)
}

function setBoostVisibility(userId: string, controls: BoostVisibilityControls): void {
  // Users can control how boosts are displayed
  // But cannot hide boost labels entirely (transparency requirement)
  
  updateUserPreferences(userId, {
    boostVisibility: {
      showBoosted: controls.showBoosted, // Can hide boosted content
      boostLabelOpacity: Math.max(0.5, controls.boostLabelOpacity), // Min 50% opacity
      boostTooltip: controls.boostTooltip
    }
  })
}
```

**Boost Filter Controls**:
```typescript
interface BoostFilterControls {
  userId: string
  filterBoosted: boolean // Filter out boosted content (default: false)
  boostPreference: 'all' | 'boosted-only' | 'non-boosted-only' // Discovery preference
}

function setBoostFilter(userId: string, filter: BoostFilterControls): void {
  // Users can filter boosted content in discovery
  // But boost labels must still be visible if boosted content is shown
  
  updateUserPreferences(userId, {
    boostFilter: {
      filterBoosted: filter.filterBoosted,
      boostPreference: filter.boostPreference
    }
  })
}
```

**Boost Opt-Out**:
```typescript
interface BoostOptOut {
  userId: string
  optOutOfBoosts: boolean // Opt out of seeing boosted content (default: false)
  optOutOfBoostPromotions: boolean // Opt out of boost promotions (default: false)
}

function setBoostOptOut(userId: string, optOut: BoostOptOut): void {
  // Users can opt out of boosts entirely
  // But boost labels must still be visible if they choose to see boosted content
  
  updateUserPreferences(userId, {
    boostOptOut: {
      optOutOfBoosts: optOut.optOutOfBoosts,
      optOutOfBoostPromotions: optOut.optOutOfBoostPromotions
    }
  })
  
  // If opted out, filter boosted content from discovery
  if (optOut.optOutOfBoosts) {
    filterBoostedContent(userId)
  }
}
```

**User Control Rules**:
- ✅ **REQUIRED**: Users can control boost visibility (show/hide, opacity)
- ✅ **REQUIRED**: Users can filter boosted content (all, boosted-only, non-boosted-only)
- ✅ **REQUIRED**: Users can opt out of boosts (filter from discovery)
- ✅ **REQUIRED**: Users can opt out of boost promotions (no marketing)
- ❌ **FORBIDDEN**: Hiding boost labels entirely (must be visible if boosted content shown)
- ❌ **FORBIDDEN**: No user controls (must be user-controlled)

---

## Output Requirements

### Boost System Architecture

**Core Systems**:
1. **Boost Mechanics** (types, durations, costs, limits)
2. **Labeling System** (clear labels, tooltips, styling)
3. **Ranking Integration** (proximity-first, boost-enhanced)
4. **Anti-Addiction Safeguards** (cooldowns, limits, spending limits)
5. **User Controls** (visibility, filters, opt-outs)

### Boost Mechanics Specification

**Boost Types**:
- Profile boost (1-72 hours, $0.99-$39.99)
- Room boost (1-72 hours, $0.99-$39.99)
- Event boost (1-72 hours, $0.99-$39.99)

**Boost Limits**:
- Cooldowns (24 hours between boosts)
- Monthly limits (10-30 boosts/month)
- Max active (1-5 depending on type)
- Spending limits ($100/month default)

### Labeling System Specification

**Boost Labels**:
- Clear "Boosted" badge (amber/yellow, bold, visible)
- Tooltip explaining boost (transparent, educational)
- Consistent styling (always visible, not hidden)

### Ranking Integration Specification

**Boost Integration**:
- Proximity remains primary (80% weight)
- Boosts enhance visibility (20% weight, multiplier)
- Boosts don't override proximity (weighted combination)
- Boosted items clearly labeled (transparent)

### Anti-Addiction Safeguards Specification

**Safeguards**:
- Cooldowns (24 hours between boosts)
- Monthly limits (10-30 boosts/month)
- Spending limits ($100/month default)
- Clear messaging (users see limits, cooldowns)

### User Controls Specification

**Controls**:
- Boost visibility (show/hide, opacity)
- Boost filters (all, boosted-only, non-boosted-only)
- Boost opt-out (filter from discovery, no promotions)

---

## Brand DNA Alignment

Every boost decision must align with:

1. **Paid visibility always labeled** → Clear labels, tooltips, transparent
2. **Boosts don't override proximity-first** → Proximity 80%, boost 20%
3. **Boosts are transparent and finite** → Temporary, labeled, no guarantees
4. **Anti-addiction safeguards** → Cooldowns, limits, user controls

---

## Success Criteria

The boost and promotion system is successful when:

- ✅ Boost mechanics work (types, durations, costs, limits)
- ✅ Clear labeling enforced (visible badges, tooltips, styling)
- ✅ Boosts integrate with proximity-first ranking (proximity 80%, boost 20%)
- ✅ Anti-addiction safeguards work (cooldowns, limits, spending limits)
- ✅ User controls work (visibility, filters, opt-outs)
- ✅ Paid visibility always labeled (transparent, not hidden)
- ✅ Boosts don't override proximity-first (proximity primary, boost secondary)
- ✅ Boosts are transparent and finite (temporary, labeled, no guarantees)

---

**CRITICAL**: This system must enhance visibility transparently without manipulating outcomes. Boosts must be tools, not weapons. Violating these rules breaks trust and violates Brand DNA.

