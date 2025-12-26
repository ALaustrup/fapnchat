# MASTER PROMPT 27
## SUBSCRIPTION, ENTITLEMENT & FEATURE GATING SYSTEM

**SYSTEM MODE**: PLATFORM ECONOMICS ARCHITECT

Design the subscription and entitlement system for WYA!? that monetizes expression and tools without degrading core social interaction.

---

## Input

- Full "Monetization that doesn't suck" specification
- Product Governance Framework
- Room Engine & Module System (MASTER_PROMPT_18)
- Customization Editor & Safety Model (MASTER_PROMPT_19)

---

## Architectural Truths

### Why This Monetization Model Works

**A. Never Monetized Access to People**:
- No paywalls on chat
- No "premium visibility only" matchmaking
- No social throttling for free users
- **Consequence**: Users never feel platform is standing between them and other humans

**B. Subscriptions Unlock Capacity, Not Power**:
- Premium doesn't dominate discovery
- Creator doesn't dominate people
- Family doesn't spy
- **Consequence**: Free users remain whole, not second-class

**C. Monetization UX Never Interrupts Flow**:
- No modal spam
- No mid-conversation upsells
- No purchase friction disguised as urgency
- **Consequence**: Purchases happen at edges, not centers of experience

---

## The Non-Negotiable Invariants

### Invariant #1: No Social Interaction May Ever Degrade for Free Users
- ✅ **REQUIRED**: Core social always free (chat, messages, connections)
- ❌ **FORBIDDEN**: Slower replies for free users
- ❌ **FORBIDDEN**: Hidden queues for free users
- ❌ **FORBIDDEN**: Reduced reach without disclosure
- **Rationale**: If money affects who you can talk to, the culture dies

### Invariant #2: Paid Visibility Must Always Be Labeled
- ✅ **REQUIRED**: Clear labeling of boosted content
- ❌ **FORBIDDEN**: Dark patterns
- ❌ **FORBIDDEN**: "Organic-looking" promotion
- ❌ **FORBIDDEN**: Blending paid and unpaid signals
- **Rationale**: Trust once lost is unrecoverable

### Invariant #3: Creators Must Earn Without Coercion
- ✅ **REQUIRED**: Creators not pressured to upsell constantly
- ✅ **REQUIRED**: Creators not pressured to gate basic identity
- ✅ **REQUIRED**: Creators not pressured to weaponize scarcity
- **Rationale**: Platform becomes hostile if creators feel coerced

### Invariant #4: Monetization UX Must Never Interrupt Flow
- ✅ **REQUIRED**: No modal spam
- ✅ **REQUIRED**: No mid-conversation upsells
- ✅ **REQUIRED**: No purchase friction disguised as urgency
- **Rationale**: Purchases happen at edges, not centers

---

## Define

### 1. Feature Entitlements Per Tier

#### **Subscription Tiers**

**Tier 1: Free** (Core Social Always Free):
```typescript
interface FreeTierEntitlements {
  name: 'free'
  coreSocial: {
    chat: true // Unlimited chat
    messages: true // Unlimited messages
    connections: true // Unlimited connections
    rooms: true // Unlimited room visits
    discovery: true // Full discovery access
  }
  expression: {
    profileCustomization: 'level-1' // Aesthetic freedom only
    roomCustomization: 'level-1' // Basic customization
    mediaUploads: {
      images: 10, // 10 images per month
      videos: 0 // No videos
      audio: 0 // No audio
    }
  }
  tools: {
    roomCreation: true // Can create rooms
    roomModules: 5 // Max 5 modules per room
    templates: false // No custom templates
    cssSandbox: false // No CSS sandbox
  }
  support: {
    email: true // Email support
    priority: 'standard' // Standard response time
  }
  limits: {
    maxRooms: 3 // Max 3 rooms
    maxRoomSize: 50 // Max 50MB per room
    maxModulesPerRoom: 5 // Max 5 modules
  }
}
```

**Tier 2: Premium** (Expression & Tools):
```typescript
interface PremiumTierEntitlements {
  name: 'premium'
  coreSocial: {
    chat: true // Unlimited chat (same as free)
    messages: true // Unlimited messages (same as free)
    connections: true // Unlimited connections (same as free)
    rooms: true // Unlimited room visits (same as free)
    discovery: true // Full discovery access (same as free)
  }
  expression: {
    profileCustomization: 'level-2' // Spatial control (age 13+)
    roomCustomization: 'level-2' // Advanced customization
    mediaUploads: {
      images: 100, // 100 images per month
      videos: 10 // 10 videos per month
      audio: 5 // 5 audio files per month
    }
  }
  tools: {
    roomCreation: true // Can create rooms
    roomModules: 15 // Max 15 modules per room
    templates: true // Custom templates
    cssSandbox: false // No CSS sandbox (age 18+ only)
  }
  support: {
    email: true // Email support
    priority: 'priority' // Priority response time (24 hours)
  }
  limits: {
    maxRooms: 10 // Max 10 rooms
    maxRoomSize: 200 // Max 200MB per room
    maxModulesPerRoom: 15 // Max 15 modules
  }
}
```

**Tier 3: Creator** (Advanced Tools & Revenue):
```typescript
interface CreatorTierEntitlements {
  name: 'creator'
  coreSocial: {
    chat: true // Unlimited chat (same as free)
    messages: true // Unlimited messages (same as free)
    connections: true // Unlimited connections (same as free)
    rooms: true // Unlimited room visits (same as free)
    discovery: true // Full discovery access (same as free)
  }
  expression: {
    profileCustomization: 'level-3' // Media expression (age 16+)
    roomCustomization: 'level-3' // Advanced customization
    mediaUploads: {
      images: 500, // 500 images per month
      videos: 50 // 50 videos per month
      audio: 20 // 20 audio files per month
    }
  }
  tools: {
    roomCreation: true // Can create rooms
    roomModules: 30 // Max 30 modules per room
    templates: true // Custom templates
    cssSandbox: true // CSS sandbox (age 18+)
    marketplace: true // Can sell in marketplace
  }
  revenue: {
    marketplaceSplit: 0.7 // 70% creator, 30% platform
    subscriptionRevenue: true // Can earn from subscriptions
    tips: true // Can receive tips
  }
  support: {
    email: true // Email support
    priority: 'priority' // Priority response time (12 hours)
    dedicated: false // No dedicated support
  }
  limits: {
    maxRooms: 30 // Max 30 rooms
    maxRoomSize: 500 // Max 500MB per room
    maxModulesPerRoom: 30 // Max 30 modules
  }
}
```

**Tier 4: Family** (Parental Controls & Safety):
```typescript
interface FamilyTierEntitlements {
  name: 'family'
  coreSocial: {
    chat: true // Unlimited chat (same as free)
    messages: true // Unlimited messages (same as free)
    connections: true // Unlimited connections (same as free)
    rooms: true // Unlimited room visits (same as free)
    discovery: true // Full discovery access (same as free)
  }
  expression: {
    profileCustomization: 'level-1' // Aesthetic freedom (age-appropriate)
    roomCustomization: 'level-1' // Basic customization
    mediaUploads: {
      images: 10, // 10 images per month
      videos: 0 // No videos
      audio: 0 // No audio
    }
  }
  parentalControls: {
    activitySummary: true // Activity summaries (not real-time spying)
    contentFiltering: true // Enhanced content filtering
    timeLimits: true // Time limit controls
    friendApproval: true // Friend request approval
    locationSharing: false // No exact location (privacy)
  }
  support: {
    email: true // Email support
    priority: 'priority' // Priority response time (24 hours)
    familySupport: true // Dedicated family support
  }
  limits: {
    maxRooms: 3 // Max 3 rooms (same as free)
    maxRoomSize: 50 // Max 50MB per room (same as free)
    maxModulesPerRoom: 5 // Max 5 modules (same as free)
  }
}
```

#### **Entitlement Rules**

**Core Social Protection**:
- ✅ **REQUIRED**: Core social always free (chat, messages, connections, rooms, discovery)
- ✅ **REQUIRED**: No degradation for free users (same speed, same access)
- ✅ **REQUIRED**: Premium doesn't dominate discovery (proximity-first, not subscription-first)
- ❌ **FORBIDDEN**: Paywalls on chat, messages, connections
- ❌ **FORBIDDEN**: Slower replies, hidden queues, reduced reach for free users

**Expression & Tools**:
- ✅ **REQUIRED**: Tiers unlock capacity (more rooms, more modules, more media)
- ✅ **REQUIRED**: Tiers unlock tools (templates, CSS sandbox, marketplace)
- ✅ **REQUIRED**: Free tier remains functional (not crippled)
- ❌ **FORBIDDEN**: Tiers unlock power over people (no premium-only discovery)
- ❌ **FORBIDDEN**: Free tier degraded to force upgrades

---

### 2. How Entitlements Are Checked (Without Degrading Performance)

#### **Entitlement Check System**

**Check Strategy**:
```typescript
interface EntitlementCheck {
  userId: string
  feature: string
  tier: 'free' | 'premium' | 'creator' | 'family'
  cached: boolean // Whether check was cached
  timestamp: number // When check was performed
}

// Cache entitlements in memory (Redis, in-memory cache)
const entitlementCache = new Map<string, EntitlementCheck>()

function checkEntitlement(userId: string, feature: string): boolean {
  // 1. Check cache first (fast, no DB query)
  const cached = entitlementCache.get(`${userId}:${feature}`)
  if (cached && Date.now() - cached.timestamp < 60000) { // 1 minute cache
    return cached.allowed
  }
  
  // 2. Get user tier (from DB or cache)
  const userTier = getUserTier(userId) // Cached, updates every 5 minutes
  
  // 3. Check entitlement (in-memory lookup, no DB query)
  const allowed = isFeatureAllowed(userTier, feature)
  
  // 4. Cache result (for 1 minute)
  entitlementCache.set(`${userId}:${feature}`, {
    userId,
    feature,
    tier: userTier,
    cached: true,
    timestamp: Date.now(),
    allowed
  })
  
  return allowed
}

function isFeatureAllowed(tier: string, feature: string): boolean {
  // In-memory lookup (no DB query)
  const entitlements = getTierEntitlements(tier)
  return entitlements[feature] === true || 
         (typeof entitlements[feature] === 'object' && entitlements[feature].enabled === true)
}
```

**Performance Optimization**:
```typescript
// Tier cache (updates every 5 minutes)
const tierCache = new Map<string, { tier: string, timestamp: number }>()

function getUserTier(userId: string): string {
  const cached = tierCache.get(userId)
  if (cached && Date.now() - cached.timestamp < 300000) { // 5 minute cache
    return cached.tier
  }
  
  // DB query (only if cache expired)
  const tier = db.query('SELECT tier FROM subscriptions WHERE user_id = ?', [userId])
  
  // Cache result
  tierCache.set(userId, { tier, timestamp: Date.now() })
  
  return tier
}

// Entitlement matrix (in-memory, no DB queries)
const ENTITLEMENT_MATRIX = {
  'free': {
    'chat': true,
    'messages': true,
    'connections': true,
    'room-creation': true,
    'room-modules': { max: 5 },
    'media-uploads': { images: 10, videos: 0, audio: 0 },
    'templates': false,
    'css-sandbox': false,
    'marketplace': false
  },
  'premium': {
    'chat': true,
    'messages': true,
    'connections': true,
    'room-creation': true,
    'room-modules': { max: 15 },
    'media-uploads': { images: 100, videos: 10, audio: 5 },
    'templates': true,
    'css-sandbox': false,
    'marketplace': false
  },
  'creator': {
    'chat': true,
    'messages': true,
    'connections': true,
    'room-creation': true,
    'room-modules': { max: 30 },
    'media-uploads': { images: 500, videos: 50, audio: 20 },
    'templates': true,
    'css-sandbox': true,
    'marketplace': true
  },
  'family': {
    'chat': true,
    'messages': true,
    'connections': true,
    'room-creation': true,
    'room-modules': { max: 5 },
    'media-uploads': { images: 10, videos: 0, audio: 0 },
    'templates': false,
    'css-sandbox': false,
    'marketplace': false,
    'parental-controls': true
  }
}
```

**Performance Rules**:
- ✅ **REQUIRED**: Entitlement checks cached (1 minute cache)
- ✅ **REQUIRED**: Tier lookups cached (5 minute cache)
- ✅ **REQUIRED**: In-memory entitlement matrix (no DB queries)
- ✅ **REQUIRED**: Checks don't block requests (async, non-blocking)
- ❌ **FORBIDDEN**: DB queries on every check (performance degradation)
- ❌ **FORBIDDEN**: Blocking entitlement checks (must be async)

---

### 3. How Free Users Are Protected from Degradation

#### **Free User Protection Mechanisms**

**Protection 1: Core Social Always Free**:
```typescript
function protectCoreSocial(userId: string, action: 'chat' | 'message' | 'connect' | 'discover'): boolean {
  // Core social actions are always allowed, regardless of tier
  const coreSocialActions = ['chat', 'message', 'connect', 'discover']
  
  if (coreSocialActions.includes(action)) {
    return true // Always allowed, no tier check needed
  }
  
  // Non-core actions may require tier check
  return checkEntitlement(userId, action)
}
```

**Protection 2: No Performance Degradation**:
```typescript
function protectPerformance(userId: string): void {
  // Free users get same performance as paid users
  // No slower replies, no hidden queues, no reduced reach
  
  // Message delivery: Same speed for all tiers
  const messageDeliverySpeed = 'immediate' // Same for all
  
  // Discovery ranking: Proximity-first, not subscription-first
  const discoveryRanking = 'proximity-first' // Same for all
  
  // Room loading: Same speed for all tiers
  const roomLoadingSpeed = 'standard' // Same for all
}
```

**Protection 3: No Hidden Throttling**:
```typescript
function protectFromThrottling(userId: string, action: string): boolean {
  // Free users are not throttled for core social actions
  const coreSocialActions = ['chat', 'message', 'connect', 'discover']
  
  if (coreSocialActions.includes(action)) {
    return true // No throttling for core social
  }
  
  // Non-core actions may have rate limits (but disclosed)
  const rateLimit = getRateLimit(userId, action)
  if (rateLimit.exceeded) {
    // Show clear message (not hidden throttling)
    notifyUser(userId, {
      type: 'rate-limit',
      message: `You've reached your limit for ${action}. Upgrade to Premium for higher limits.`,
      action: 'upgrade'
    })
    return false
  }
  
  return true
}
```

**Protection 4: Transparent Limits**:
```typescript
function showTransparentLimits(userId: string): void {
  const tier = getUserTier(userId)
  const limits = getTierLimits(tier)
  
  // Show limits clearly (not hidden)
  displayLimits(userId, {
    rooms: `${limits.maxRooms} rooms`,
    modules: `${limits.maxModulesPerRoom} modules per room`,
    media: `${limits.mediaUploads.images} images per month`,
    message: tier === 'free' ? 
      'Upgrade to Premium for more rooms, modules, and media uploads' :
      'You have access to all features'
  })
}
```

**Free User Protection Rules**:
- ✅ **REQUIRED**: Core social always free (chat, messages, connections, discovery)
- ✅ **REQUIRED**: No performance degradation (same speed, same access)
- ✅ **REQUIRED**: No hidden throttling (limits disclosed, not hidden)
- ✅ **REQUIRED**: Transparent limits (users see what they can/can't do)
- ❌ **FORBIDDEN**: Slower replies, hidden queues, reduced reach for free users
- ❌ **FORBIDDEN**: Hidden throttling (must be disclosed)

---

### 4. Upgrade/Downgrade Flows (No Punishment)

#### **Upgrade Flow**

**Upgrade Process**:
```typescript
interface UpgradeFlow {
  fromTier: 'free' | 'premium' | 'creator' | 'family'
  toTier: 'premium' | 'creator' | 'family'
  immediate: boolean // Whether upgrade is immediate
  prorated: boolean // Whether to prorate billing
}

function upgradeUser(userId: string, toTier: string): UpgradeResult {
  const currentTier = getUserTier(userId)
  
  // 1. Validate upgrade (can't downgrade via upgrade)
  if (!isValidUpgrade(currentTier, toTier)) {
    return { error: 'Invalid upgrade path' }
  }
  
  // 2. Process payment (if required)
  const paymentResult = processPayment(userId, toTier)
  if (!paymentResult.success) {
    return { error: 'Payment failed' }
  }
  
  // 3. Upgrade immediately (no delay, no punishment)
  updateUserTier(userId, toTier, immediate: true)
  
  // 4. Grant new entitlements immediately
  grantEntitlements(userId, toTier)
  
  // 5. Notify user (positive, celebratory)
  notifyUser(userId, {
    type: 'upgrade-success',
    message: `Welcome to ${toTier}! You now have access to more rooms, modules, and creative tools.`,
    action: 'explore-features'
  })
  
  return { success: true, tier: toTier }
}
```

**Upgrade Rules**:
- ✅ **REQUIRED**: Upgrade is immediate (no delay, no punishment)
- ✅ **REQUIRED**: New entitlements granted immediately
- ✅ **REQUIRED**: Positive messaging (celebratory, not transactional)
- ❌ **FORBIDDEN**: Delayed upgrades (must be immediate)
- ❌ **FORBIDDEN**: Punishment for upgrading (must be positive)

#### **Downgrade Flow**

**Downgrade Process**:
```typescript
interface DowngradeFlow {
  fromTier: 'premium' | 'creator' | 'family'
  toTier: 'free' | 'premium' | 'creator'
  gracePeriod: number // Days of grace period
  dataPreservation: boolean // Whether to preserve data
}

function downgradeUser(userId: string, toTier: string): DowngradeResult {
  const currentTier = getUserTier(userId)
  
  // 1. Validate downgrade (can't upgrade via downgrade)
  if (!isValidDowngrade(currentTier, toTier)) {
    return { error: 'Invalid downgrade path' }
  }
  
  // 2. Grace period (30 days to adjust)
  const gracePeriod = 30 * 24 * 60 * 60 * 1000 // 30 days
  
  // 3. Preserve data (don't delete, just restrict access)
  preserveUserData(userId, {
    rooms: 'keep-all', // Keep all rooms, but restrict editing
    media: 'keep-all', // Keep all media, but restrict uploads
    templates: 'keep-all' // Keep all templates, but restrict creation
  })
  
  // 4. Notify user (supportive, not punitive)
  notifyUser(userId, {
    type: 'downgrade-notice',
    message: `Your subscription has been downgraded to ${toTier}. You have 30 days to adjust. Your content is safe and will be preserved.`,
    action: 'view-limits'
  })
  
  // 5. Schedule downgrade (after grace period)
  scheduleDowngrade(userId, toTier, gracePeriod)
  
  return { success: true, tier: toTier, gracePeriod }
}
```

**Downgrade Rules**:
- ✅ **REQUIRED**: Grace period (30 days to adjust)
- ✅ **REQUIRED**: Data preservation (don't delete, just restrict access)
- ✅ **REQUIRED**: Supportive messaging (not punitive)
- ❌ **FORBIDDEN**: Immediate data loss (must preserve data)
- ❌ **FORBIDDEN**: Punishment for downgrading (must be supportive)

---

### 5. Family and Creator Tier Edge Cases

#### **Family Tier Edge Cases**

**Edge Case 1: Multiple Children**:
```typescript
interface FamilyTierEdgeCase {
  case: 'multiple-children'
  solution: {
    parentAccount: string // Parent account ID
    childAccounts: string[] // Child account IDs
    sharedControls: boolean // Shared parental controls
    individualLimits: boolean // Individual limits per child
  }
}

function handleMultipleChildren(parentId: string, childIds: string[]): void {
  // Parent account manages all children
  // Each child has individual limits (not shared)
  // Parental controls apply to all children
  
  for (const childId of childIds) {
    linkChildToParent(childId, parentId)
    applyFamilyTierEntitlements(childId)
    applyParentalControls(childId, parentId)
  }
}
```

**Edge Case 2: Age Transitions**:
```typescript
interface AgeTransitionEdgeCase {
  case: 'age-transition'
  solution: {
    automaticUpgrade: boolean // Automatically upgrade when child turns 13/16/18
    notification: boolean // Notify parent of age transition
    preserveData: boolean // Preserve all data during transition
  }
}

function handleAgeTransition(childId: string, newAge: number): void {
  // When child turns 13: Unlock level-2 customization
  if (newAge === 13) {
    upgradeCustomizationLevel(childId, 'level-2')
    notifyParent(getParentId(childId), {
      type: 'age-transition',
      message: 'Your child has turned 13 and now has access to more customization options.',
      action: 'review-settings'
    })
  }
  
  // When child turns 16: Unlock level-3 customization
  if (newAge === 16) {
    upgradeCustomizationLevel(childId, 'level-3')
    notifyParent(getParentId(childId), {
      type: 'age-transition',
      message: 'Your child has turned 16 and now has access to media expression features.',
      action: 'review-settings'
    })
  }
  
  // When child turns 18: Can upgrade to Premium/Creator
  if (newAge === 18) {
    enableTierUpgrade(childId, ['premium', 'creator'])
    notifyUser(childId, {
      type: 'age-transition',
      message: 'You\'re now 18! You can upgrade to Premium or Creator tiers.',
      action: 'upgrade'
    })
  }
}
```

#### **Creator Tier Edge Cases**

**Edge Case 1: Revenue Split Disputes**:
```typescript
interface RevenueSplitDispute {
  case: 'revenue-split-dispute'
  solution: {
    transparentAccounting: boolean // All transactions logged
    disputeResolution: boolean // Human review for disputes
    appealProcess: boolean // Creators can appeal
  }
}

function handleRevenueSplitDispute(creatorId: string, transactionId: string): void {
  // Show transparent accounting
  const transaction = getTransaction(transactionId)
  displayTransactionDetails(creatorId, {
    grossRevenue: transaction.amount,
    platformFee: transaction.amount * 0.3, // 30% platform
    creatorRevenue: transaction.amount * 0.7, // 70% creator
    breakdown: 'transparent'
  })
  
  // Allow dispute if creator disagrees
  if (creatorDisputes(creatorId, transactionId)) {
    queueForHumanReview({
      type: 'revenue-dispute',
      creatorId,
      transactionId,
      priority: 'high'
    })
  }
}
```

**Edge Case 2: Marketplace Abuse**:
```typescript
interface MarketplaceAbuse {
  case: 'marketplace-abuse'
  solution: {
    moderation: boolean // All assets moderated
    reputation: boolean // Creator reputation system
    refunds: boolean // Refund system for low-quality assets
  }
}

function handleMarketplaceAbuse(assetId: string, report: AbuseReport): void {
  // Moderate asset (content, quality, accuracy)
  const moderationResult = moderateAsset(assetId)
  
  if (moderationResult.violation) {
    // Remove asset, refund buyers, penalize creator
    removeAsset(assetId)
    refundBuyers(assetId)
    penalizeCreator(getCreatorId(assetId), {
      type: 'reputation-reduction',
      amount: 0.1 // 10% reputation reduction
    })
  }
}
```

**Edge Case Rules**:
- ✅ **REQUIRED**: Handle multiple children (shared controls, individual limits)
- ✅ **REQUIRED**: Handle age transitions (automatic upgrades, notifications)
- ✅ **REQUIRED**: Handle revenue disputes (transparent accounting, human review)
- ✅ **REQUIRED**: Handle marketplace abuse (moderation, reputation, refunds)
- ❌ **FORBIDDEN**: Ignoring edge cases (must be handled)

---

## Output Requirements

### Subscription System Architecture

**Core Systems**:
1. **Entitlement System** (feature entitlements, tier definitions)
2. **Entitlement Checker** (cached checks, performance optimization)
3. **Free User Protection** (core social always free, no degradation)
4. **Upgrade/Downgrade Flows** (immediate upgrades, grace periods, data preservation)
5. **Edge Case Handlers** (family tier, creator tier, age transitions)

### Feature Entitlements Specification

**Tiers**:
- Free (core social always free, basic expression, basic tools)
- Premium (advanced expression, advanced tools, priority support)
- Creator (advanced tools, marketplace, revenue split)
- Family (parental controls, age-appropriate features)

**Entitlement Rules**:
- Core social always free (chat, messages, connections, discovery)
- Tiers unlock capacity (more rooms, modules, media)
- Tiers unlock tools (templates, CSS sandbox, marketplace)
- Free tier remains functional (not crippled)

### Entitlement Check System Specification

**Check Strategy**:
- Cache entitlements (1 minute cache)
- Cache tiers (5 minute cache)
- In-memory entitlement matrix (no DB queries)
- Async, non-blocking checks

**Performance Rules**:
- No DB queries on every check
- No blocking entitlement checks
- Cached lookups for performance

### Free User Protection Specification

**Protection Mechanisms**:
- Core social always free (no tier check needed)
- No performance degradation (same speed, same access)
- No hidden throttling (limits disclosed)
- Transparent limits (users see what they can/can't do)

### Upgrade/Downgrade Flows Specification

**Upgrade Flow**:
- Immediate upgrade (no delay, no punishment)
- New entitlements granted immediately
- Positive messaging (celebratory)

**Downgrade Flow**:
- Grace period (30 days to adjust)
- Data preservation (don't delete, just restrict)
- Supportive messaging (not punitive)

### Edge Cases Specification

**Family Tier**:
- Multiple children (shared controls, individual limits)
- Age transitions (automatic upgrades, notifications)

**Creator Tier**:
- Revenue split disputes (transparent accounting, human review)
- Marketplace abuse (moderation, reputation, refunds)

---

## Brand DNA Alignment

Every monetization decision must align with:

1. **Never monetize access to people** → Core social always free
2. **Subscriptions unlock capacity, not power** → Free users remain whole
3. **Monetization UX never interrupts flow** → Purchases at edges, not centers
4. **Transparency** → Paid visibility labeled, limits disclosed

---

## Success Criteria

The subscription and entitlement system is successful when:

- ✅ Feature entitlements defined per tier (free, premium, creator, family)
- ✅ Entitlements checked without degrading performance (cached, async)
- ✅ Free users protected from degradation (core social always free, no throttling)
- ✅ Upgrade/downgrade flows work smoothly (immediate upgrades, grace periods, data preservation)
- ✅ Edge cases handled (family tier, creator tier, age transitions)
- ✅ Core social interaction never blocked (chat, messages, connections, discovery)
- ✅ Paid visibility always labeled (transparent, not hidden)
- ✅ Monetization UX never interrupts flow (no modal spam, no mid-conversation upsells)

---

**CRITICAL**: This system must never block core social interaction. Monetization must respect human connection. Violating these rules breaks trust and violates Brand DNA.

