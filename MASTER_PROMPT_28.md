# MASTER PROMPT 28
## MARKETPLACE & CREATOR ECONOMY ENGINE

**SYSTEM MODE**: CREATOR ECONOMY ARCHITECT

Design the creator marketplace and revenue system for WYA!? that rewards creativity, not spam.

---

## Input

- Full "Monetization that doesn't suck" specification
- Subscription, Entitlement & Feature Gating System (MASTER_PROMPT_27)
- Customization Editor & Safety Model (MASTER_PROMPT_19)
- Social Score & Trust System (MASTER_PROMPT_22)

---

## Architectural Truths

### Why This Creator Economy Works

**A. Creators Earn Without Coercion**:
- No pressure to upsell constantly
- No pressure to gate basic identity
- No pressure to weaponize scarcity
- **Consequence**: Platform doesn't become hostile

**B. Revenue Aligns with Value, Not Outrage**:
- Creators earn from rooms, assets, events, experiences
- Not from follower counts, algorithmic luck, rage bait
- **Consequence**: Creativity aligned with value, not manipulation

**C. 70/30 Split is Standard, But Transparency Matters More**:
- Clear revenue split (70% creator, 30% platform)
- Transparent accounting (all transactions logged)
- Dispute resolution (human review, appeals)
- **Consequence**: Creators trust the system

---

## The Non-Negotiable Invariants

### Invariant #1: Creators Must Earn Without Coercion
- ✅ **REQUIRED**: Creators not pressured to upsell constantly
- ✅ **REQUIRED**: Creators not pressured to gate basic identity
- ✅ **REQUIRED**: Creators not pressured to weaponize scarcity
- **Rationale**: Platform becomes hostile if creators feel coerced

### Invariant #2: Marketplace Must Reward Creativity, Not Spam
- ✅ **REQUIRED**: Quality over quantity (moderation, reviews, curation)
- ✅ **REQUIRED**: Creator reputation system (behavior-based, transparent)
- ❌ **FORBIDDEN**: Spam or low-quality assets (moderation, removal)
- **Rationale**: Marketplace becomes useless if flooded with spam

### Invariant #3: Revenue Split Must Be Transparent
- ✅ **REQUIRED**: Clear revenue split (70% creator, 30% platform)
- ✅ **REQUIRED**: Transparent accounting (all transactions logged)
- ✅ **REQUIRED**: Dispute resolution (human review, appeals)
- **Rationale**: Creators must trust the revenue system

---

## Define

### 1. Asset Submission and Review Flow

#### **Asset Types**

**Type 1: Room Templates**:
```typescript
interface RoomTemplateAsset {
  type: 'room-template'
  name: string
  description: string
  preview: {
    thumbnail: string // Thumbnail image
    screenshots: string[] // Screenshot images
    video?: string // Preview video (optional)
  }
  template: {
    layout: LayoutConfig
    modules: ModuleConfig[]
    customization: CustomizationConfig
  }
  pricing: {
    model: 'one-time' | 'subscription'
    price: number // USD
    currency: 'USD'
  }
  metadata: {
    tags: string[]
    category: string
    ageRating: 'all' | '13+' | '16+' | '18+'
  }
}
```

**Type 2: Custom Modules**:
```typescript
interface CustomModuleAsset {
  type: 'custom-module'
  name: string
  description: string
  preview: {
    thumbnail: string
    screenshots: string[]
    demo?: string // Interactive demo URL
  }
  module: {
    code: string // CSS/HTML (no JavaScript)
    config: ModuleConfig
  }
  pricing: {
    model: 'one-time' | 'subscription'
    price: number // USD
    currency: 'USD'
  }
  metadata: {
    tags: string[]
    category: string
    ageRating: 'all' | '13+' | '16+' | '18+'
  }
}
```

**Type 3: Media Assets**:
```typescript
interface MediaAsset {
  type: 'media-asset'
  name: string
  description: string
  preview: {
    thumbnail: string
    fullSize?: string // Full-size preview
  }
  media: {
    type: 'image' | 'video' | 'audio'
    url: string
    format: string
    size: number // Bytes
  }
  pricing: {
    model: 'one-time' | 'subscription'
    price: number // USD
    currency: 'USD'
  }
  metadata: {
    tags: string[]
    category: string
    ageRating: 'all' | '13+' | '16+' | '18+'
  }
}
```

#### **Submission Flow**

**Submission Process**:
```typescript
function submitAsset(creatorId: string, asset: Asset): AssetSubmission {
  // 1. Validate asset (required fields, format, size limits)
  validateAsset(asset)
  
  // 2. Check creator tier (must be Creator tier)
  if (!isCreatorTier(creatorId)) {
    return { error: 'Creator tier required to sell assets' }
  }
  
  // 3. Check creator reputation (must meet minimum)
  const reputation = getCreatorReputation(creatorId)
  if (reputation < MIN_REPUTATION_FOR_MARKETPLACE) {
    return { error: 'Minimum reputation required to sell assets' }
  }
  
  // 4. Submit for moderation (all assets must be moderated)
  const moderationResult = submitForModeration(asset)
  
  // 5. Queue for review (human review required)
  queueForReview(asset, priority: 'standard')
  
  // 6. Notify creator (submission confirmation)
  notifyCreator(creatorId, {
    type: 'asset-submitted',
    assetId: asset.id,
    message: 'Your asset has been submitted for review. This usually takes 24-48 hours.',
    estimatedReviewTime: '24-48 hours'
  })
  
  return {
    status: 'submitted',
    assetId: asset.id,
    estimatedReviewTime: '24-48 hours'
  }
}
```

**Review Process**:
```typescript
function reviewAsset(assetId: string, moderatorId: string): ReviewResult {
  const asset = getAsset(assetId)
  
  // Human moderator reviews asset
  const review = moderatorReviewsAsset(asset, {
    content: true, // Content appropriateness
    quality: true, // Quality standards
    accuracy: true, // Accuracy of description
    pricing: true, // Pricing reasonableness
  })
  
  if (review.approved) {
    // Approve asset, make it available in marketplace
    approveAsset(assetId)
    publishToMarketplace(assetId)
    
    notifyCreator(asset.creatorId, {
      type: 'asset-approved',
      assetId,
      message: 'Your asset has been approved and is now available in the marketplace!',
      action: 'view-asset'
    })
  } else {
    // Reject asset, provide feedback
    rejectAsset(assetId, review.reasoning)
    
    notifyCreator(asset.creatorId, {
      type: 'asset-rejected',
      assetId,
      message: `Your asset was not approved: ${review.reasoning}`,
      action: 'edit-and-resubmit'
    })
  }
  
  return review
}
```

**Submission and Review Rules**:
- ✅ **REQUIRED**: All assets validated (required fields, format, size limits)
- ✅ **REQUIRED**: Creator tier required (must be Creator tier)
- ✅ **REQUIRED**: Minimum reputation required (behavior-based, transparent)
- ✅ **REQUIRED**: All assets moderated (content, quality, accuracy, pricing)
- ✅ **REQUIRED**: Human review required (not automated)
- ❌ **FORBIDDEN**: Unmoderated assets (must be reviewed)
- ❌ **FORBIDDEN**: Automated approval (must be human-reviewed)

---

### 2. Pricing Rules and Ranges

#### **Pricing Models**

**Model 1: One-Time Purchase**:
```typescript
interface OneTimePricing {
  model: 'one-time'
  price: number // USD, min $0.99, max $99.99
  currency: 'USD'
  rules: {
    minPrice: 0.99 // Minimum $0.99
    maxPrice: 99.99 // Maximum $99.99
    increments: 0.01 // $0.01 increments
  }
}
```

**Model 2: Subscription**:
```typescript
interface SubscriptionPricing {
  model: 'subscription'
  price: number // USD per month, min $1.99, max $29.99
  currency: 'USD'
  billing: 'monthly' | 'yearly'
  rules: {
    minPrice: 1.99 // Minimum $1.99/month
    maxPrice: 29.99 // Maximum $29.99/month
    increments: 0.01 // $0.01 increments
  }
}
```

#### **Pricing Rules**

**Pricing Validation**:
```typescript
function validatePricing(pricing: Pricing): boolean {
  if (pricing.model === 'one-time') {
    // One-time: $0.99 - $99.99
    if (pricing.price < 0.99 || pricing.price > 99.99) {
      return false
    }
  } else if (pricing.model === 'subscription') {
    // Subscription: $1.99 - $29.99/month
    if (pricing.price < 1.99 || pricing.price > 29.99) {
      return false
    }
  }
  
  // Must be in $0.01 increments
  if (pricing.price % 0.01 !== 0) {
    return false
  }
  
  return true
}
```

**Pricing Recommendations**:
```typescript
function recommendPricing(asset: Asset): PricingRecommendation {
  // Recommend pricing based on asset type, quality, creator reputation
  const basePrice = getBasePriceForAssetType(asset.type)
  const qualityMultiplier = getQualityMultiplier(asset.quality)
  const reputationMultiplier = getReputationMultiplier(asset.creatorReputation)
  
  const recommendedPrice = basePrice * qualityMultiplier * reputationMultiplier
  
  return {
    recommended: Math.max(0.99, Math.min(99.99, recommendedPrice)),
    range: {
      min: 0.99,
      max: 99.99
    },
    reasoning: `Based on asset type, quality, and creator reputation`
  }
}
```

**Pricing Rules**:
- ✅ **REQUIRED**: Pricing within ranges (one-time: $0.99-$99.99, subscription: $1.99-$29.99/month)
- ✅ **REQUIRED**: Pricing in $0.01 increments (no fractional cents)
- ✅ **REQUIRED**: Pricing recommendations (help creators price appropriately)
- ❌ **FORBIDDEN**: Pricing outside ranges (must be validated)
- ❌ **FORBIDDEN**: Free assets (must have minimum price, prevents spam)

---

### 3. Revenue Split Enforcement

#### **Revenue Split System**

**Split Calculation**:
```typescript
interface RevenueSplit {
  grossRevenue: number // Total revenue from sale
  platformFee: number // 30% platform fee
  creatorRevenue: number // 70% creator revenue
  currency: 'USD'
}

function calculateRevenueSplit(sale: Sale): RevenueSplit {
  const grossRevenue = sale.amount
  const platformFee = grossRevenue * 0.3 // 30% platform
  const creatorRevenue = grossRevenue * 0.7 // 70% creator
  
  return {
    grossRevenue,
    platformFee,
    creatorRevenue,
    currency: 'USD'
  }
}
```

**Revenue Distribution**:
```typescript
function distributeRevenue(sale: Sale): RevenueDistribution {
  const split = calculateRevenueSplit(sale)
  
  // 1. Process payment (collect from buyer)
  const paymentResult = processPayment(sale.buyerId, sale.amount)
  if (!paymentResult.success) {
    return { error: 'Payment failed' }
  }
  
  // 2. Hold platform fee (30%)
  holdPlatformFee(split.platformFee)
  
  // 3. Distribute creator revenue (70%)
  distributeToCreator(sale.creatorId, split.creatorRevenue, {
    method: 'instant', // Instant payout (no delays)
    currency: 'USD'
  })
  
  // 4. Log transaction (audit trail)
  logTransaction({
    saleId: sale.id,
    assetId: sale.assetId,
    creatorId: sale.creatorId,
    buyerId: sale.buyerId,
    grossRevenue: split.grossRevenue,
    platformFee: split.platformFee,
    creatorRevenue: split.creatorRevenue,
    timestamp: Date.now()
  })
  
  // 5. Notify creator (revenue notification)
  notifyCreator(sale.creatorId, {
    type: 'revenue-earned',
    amount: split.creatorRevenue,
    assetId: sale.assetId,
    message: `You earned $${split.creatorRevenue.toFixed(2)} from ${sale.assetName}`
  })
  
  return {
    success: true,
    split,
    distributed: true
  }
}
```

**Revenue Split Rules**:
- ✅ **REQUIRED**: 70/30 split (70% creator, 30% platform)
- ✅ **REQUIRED**: Transparent accounting (all transactions logged)
- ✅ **REQUIRED**: Instant payout (no delays, no holds)
- ✅ **REQUIRED**: Transaction logging (audit trail)
- ❌ **FORBIDDEN**: Hidden fees (must be transparent)
- ❌ **FORBIDDEN**: Delayed payouts (must be instant)

---

### 4. Creator Reputation and Discovery

#### **Creator Reputation System**

**Reputation Components**:
```typescript
interface CreatorReputation {
  creatorId: string
  components: {
    assetQuality: number // 0-1, based on reviews, ratings
    salesPerformance: number // 0-1, based on sales, refunds
    communityContribution: number // 0-1, based on helpfulness, engagement
    behavior: number // 0-1, based on social score, violations
  }
  total: number // 0-1, weighted sum
  level: 'new' | 'rising' | 'established' | 'featured'
}

function calculateCreatorReputation(creatorId: string): CreatorReputation {
  // Asset quality: Based on reviews, ratings
  const assetQuality = calculateAssetQuality(creatorId)
  
  // Sales performance: Based on sales, refunds
  const salesPerformance = calculateSalesPerformance(creatorId)
  
  // Community contribution: Based on helpfulness, engagement
  const communityContribution = calculateCommunityContribution(creatorId)
  
  // Behavior: Based on social score, violations
  const behavior = getSocialScore(creatorId).total
  
  // Weighted sum
  const total = 
    assetQuality * 0.4 +
    salesPerformance * 0.3 +
    communityContribution * 0.2 +
    behavior * 0.1
  
  // Determine level
  const level = total < 0.3 ? 'new' :
                total < 0.5 ? 'rising' :
                total < 0.7 ? 'established' : 'featured'
  
  return {
    creatorId,
    components: {
      assetQuality,
      salesPerformance,
      communityContribution,
      behavior
    },
    total,
    level
  }
}
```

**Creator Discovery**:
```typescript
function discoverCreators(userId: string, filters: DiscoveryFilters): Creator[] {
  // Discover creators based on:
  // - Reputation (higher reputation = higher visibility)
  // - Asset quality (higher quality = higher visibility)
  // - Sales performance (more sales = higher visibility)
  // - Proximity (nearby creators = higher visibility)
  
  const creators = getAllCreators()
  
  // Filter by reputation (minimum threshold)
  const filtered = creators.filter(c => 
    calculateCreatorReputation(c.id).total >= filters.minReputation
  )
  
  // Sort by reputation, quality, sales (not proximity-first, but proximity-weighted)
  const sorted = filtered.sort((a, b) => {
    const aRep = calculateCreatorReputation(a.id)
    const bRep = calculateCreatorReputation(b.id)
    
    // Reputation is primary (not proximity)
    if (aRep.total !== bRep.total) {
      return bRep.total - aRep.total
    }
    
    // Proximity is secondary (weighted, not primary)
    const aProx = getProximityWeight(userId, a.id)
    const bProx = getProximityWeight(userId, b.id)
    
    return bProx - aProx
  })
  
  // Limit results (bounded, not infinite)
  return sorted.slice(0, filters.maxResults || 20)
}
```

**Creator Reputation and Discovery Rules**:
- ✅ **REQUIRED**: Reputation based on quality, sales, contribution, behavior
- ✅ **REQUIRED**: Discovery based on reputation, quality, sales (not proximity-first)
- ✅ **REQUIRED**: Proximity weighted (secondary, not primary)
- ✅ **REQUIRED**: Bounded discovery (max 20 results, not infinite)
- ❌ **FORBIDDEN**: Proximity-first discovery (reputation is primary)
- ❌ **FORBIDDEN**: Infinite discovery (must be bounded)

---

### 5. Abuse Prevention and Refunds

#### **Abuse Prevention**

**Abuse Detection**:
```typescript
function detectMarketplaceAbuse(assetId: string, report: AbuseReport): boolean {
  const asset = getAsset(assetId)
  
  // Check for spam (low quality, high volume)
  const creatorAssets = getCreatorAssets(asset.creatorId)
  if (creatorAssets.length > 50 && asset.quality < 0.3) {
    return true // Likely spam
  }
  
  // Check for misrepresentation (description doesn't match content)
  const misrepresentation = checkMisrepresentation(asset)
  if (misrepresentation) {
    return true // Misrepresented asset
  }
  
  // Check for copyright violations (stolen content)
  const copyrightViolation = checkCopyrightViolation(asset)
  if (copyrightViolation) {
    return true // Copyright violation
  }
  
  return false
}

function handleMarketplaceAbuse(assetId: string, abuseType: string): void {
  const asset = getAsset(assetId)
  
  // Remove asset
  removeAsset(assetId)
  
  // Refund buyers
  refundBuyers(assetId)
  
  // Penalize creator
  penalizeCreator(asset.creatorId, {
    type: 'reputation-reduction',
    amount: 0.1 // 10% reputation reduction
  })
  
  // Notify creator
  notifyCreator(asset.creatorId, {
    type: 'abuse-detected',
    assetId,
    abuseType,
    message: `Your asset was removed due to ${abuseType}. Your reputation has been reduced.`,
    action: 'appeal'
  })
}
```

#### **Refund System**

**Refund Process**:
```typescript
function processRefund(saleId: string, reason: string): RefundResult {
  const sale = getSale(saleId)
  
  // Validate refund (within 7 days, valid reason)
  if (!isRefundValid(sale, reason)) {
    return { error: 'Refund not valid' }
  }
  
  // Process refund (full refund to buyer)
  const refundResult = processRefundPayment(sale.buyerId, sale.amount)
  if (!refundResult.success) {
    return { error: 'Refund failed' }
  }
  
  // Deduct from creator revenue (if already paid out)
  if (sale.paidOut) {
    deductFromCreator(sale.creatorId, sale.creatorRevenue)
  }
  
  // Log refund (audit trail)
  logRefund({
    saleId,
    assetId: sale.assetId,
    creatorId: sale.creatorId,
    buyerId: sale.buyerId,
    amount: sale.amount,
    reason,
    timestamp: Date.now()
  })
  
  // Notify buyer and creator
  notifyBuyer(sale.buyerId, {
    type: 'refund-processed',
    saleId,
    amount: sale.amount,
    message: 'Your refund has been processed.'
  })
  
  notifyCreator(sale.creatorId, {
    type: 'refund-issued',
    saleId,
    amount: sale.creatorRevenue,
    message: `A refund was issued for ${sale.assetName}. Your revenue has been adjusted.`
  })
  
  return {
    success: true,
    refunded: sale.amount
  }
}
```

**Abuse Prevention and Refund Rules**:
- ✅ **REQUIRED**: Detect abuse (spam, misrepresentation, copyright violations)
- ✅ **REQUIRED**: Remove abusive assets (remove, refund, penalize)
- ✅ **REQUIRED**: Refund system (7-day refund window, valid reasons)
- ✅ **REQUIRED**: Transparent refunds (buyer and creator notified)
- ❌ **FORBIDDEN**: Ignoring abuse (must be detected and handled)
- ❌ **FORBIDDEN**: No refunds (must have refund system)

---

## Output Requirements

### Marketplace System Architecture

**Core Systems**:
1. **Asset Submission** (validation, moderation, review)
2. **Pricing System** (rules, ranges, recommendations)
3. **Revenue Split** (70/30 split, distribution, accounting)
4. **Creator Reputation** (quality, sales, contribution, behavior)
5. **Abuse Prevention** (detection, removal, refunds)

### Asset Submission Specification

**Asset Types**:
- Room templates (layouts, modules, customization)
- Custom modules (CSS/HTML, no JavaScript)
- Media assets (images, videos, audio)

**Submission Flow**:
- Validation, moderation, human review
- Creator tier required, minimum reputation required

### Pricing System Specification

**Pricing Models**:
- One-time purchase ($0.99-$99.99)
- Subscription ($1.99-$29.99/month)

**Pricing Rules**:
- Within ranges, $0.01 increments
- Pricing recommendations

### Revenue Split Specification

**Split Calculation**:
- 70% creator, 30% platform
- Transparent accounting, instant payout
- Transaction logging

### Creator Reputation Specification

**Reputation Components**:
- Asset quality (reviews, ratings)
- Sales performance (sales, refunds)
- Community contribution (helpfulness, engagement)
- Behavior (social score, violations)

**Discovery**:
- Reputation-based (not proximity-first)
- Proximity-weighted (secondary)
- Bounded (max 20 results)

### Abuse Prevention Specification

**Abuse Detection**:
- Spam detection (low quality, high volume)
- Misrepresentation detection (description vs content)
- Copyright violation detection (stolen content)

**Refund System**:
- 7-day refund window
- Valid reasons required
- Full refund to buyer
- Revenue adjustment for creator

---

## Brand DNA Alignment

Every marketplace decision must align with:

1. **Creators earn without coercion** → No pressure to upsell, gate, weaponize
2. **Reward creativity, not spam** → Quality over quantity, moderation, reputation
3. **Transparent revenue** → Clear split, transparent accounting, dispute resolution
4. **Proximity-first** → Discovery reputation-based, proximity-weighted (not primary)

---

## Success Criteria

The marketplace and creator economy system is successful when:

- ✅ Asset submission works (validation, moderation, review)
- ✅ Pricing rules enforced (ranges, increments, recommendations)
- ✅ Revenue split enforced (70/30, transparent, instant)
- ✅ Creator reputation works (quality, sales, contribution, behavior)
- ✅ Abuse prevention works (detection, removal, refunds)
- ✅ Creators earn without coercion (no pressure, no gating)
- ✅ Marketplace rewards creativity (quality over quantity, moderation)
- ✅ Revenue is transparent (clear split, transparent accounting, disputes)

---

**CRITICAL**: This system must reward creativity, not spam. Creators must earn without coercion. Revenue must be transparent. Violating these rules breaks trust and violates Brand DNA.

