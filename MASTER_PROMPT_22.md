# MASTER PROMPT 22
## SOCIAL SCORE & TRUST SYSTEM

**SYSTEM MODE**: TRUST & REPUTATION ENGINEER

Design the social score system for WYA!? that reflects behavioral reliability without creating a status economy.

---

## Input

- Product Governance Framework (Metrics Never Dominate Emotion)
- Profile Discovery & Recommendation (MASTER_PROMPT_20)
- Proximity Engine & Location Privacy Model (MASTER_PROMPT_21)
- The 4 Sacred Invariants

---

## Architectural Truths

### Why Social Score Works (When Framed as Trust)

**A. Score Starts Neutral**:
- New users start at neutral (not penalized)
- Score reflects behavior, not initial status
- **Consequence**: Fair start, no bias

**B. Transparency is Mandatory**:
- Users see their score, factors, and how to improve
- No black-box scoring (explainable)
- **Consequence**: Trust through transparency

**C. Shaming is Explicitly Forbidden**:
- Score is informational, not competitive
- No leaderboards, no rankings, no public shaming
- **Consequence**: Prevents status economy

**D. False Reports are Penalized**:
- False reports reduce reporter's score
- Prevents brigading and abuse
- **Consequence**: Protects against gaming

**E. Time Decay Exists**:
- Old violations decay over time
- Rewards long-term consistency
- **Consequence**: Encourages good behavior over time

---

## The Non-Negotiable Invariants

### Invariant #1: Score Starts Neutral
- ✅ **REQUIRED**: New users start at neutral (0.5, middle)
- ✅ **REQUIRED**: No initial penalty or bonus
- **Rationale**: Fair start, no bias

### Invariant #2: Transparency is Mandatory
- ✅ **REQUIRED**: Users see their score, factors, and how to improve
- ✅ **REQUIRED**: No black-box scoring (explainable)
- **Rationale**: Trust through transparency

### Invariant #3: Shaming is Explicitly Forbidden
- ✅ **REQUIRED**: Score is informational, not competitive
- ❌ **FORBIDDEN**: Leaderboards, rankings, public shaming
- **Rationale**: Prevents status economy

### Invariant #4: No Hidden Suppression
- ✅ **REQUIRED**: All score impacts visible, explainable, appealable
- ❌ **FORBIDDEN**: Shadow banning, silent throttling, invisible penalties
- **Rationale**: Moderation convenience is not worth trust loss

---

## Define

### 1. Score Components and Their Decay Rates

#### **Score Components**

**Component 1: Interaction Quality** (Weight: 0.3):
```typescript
interface InteractionQuality {
  positiveInteractions: number // Messages, reactions, connections
  negativeInteractions: number // Reports, blocks, violations
  ratio: number // positiveInteractions / (positiveInteractions + negativeInteractions)
  decayRate: 0.95 // 5% decay per month (recent interactions matter more)
}

// Positive interactions: Messages sent/received, reactions given/received, connections made
// Negative interactions: Reports received, blocks received, violations
// Ratio: Higher ratio = higher score component
// Decay: Older interactions matter less (5% decay per month)
```

**Component 2: Content Moderation** (Weight: 0.25):
```typescript
interface ContentModeration {
  approvedContent: number // Content approved by moderation
  rejectedContent: number // Content rejected by moderation
  ratio: number // approvedContent / (approvedContent + rejectedContent)
  decayRate: 0.98 // 2% decay per month (content quality is persistent)
}

// Approved content: Posts, images, profiles approved by moderation
// Rejected content: Posts, images, profiles rejected by moderation
// Ratio: Higher ratio = higher score component
// Decay: Content quality is persistent (2% decay per month)
```

**Component 3: Report Accuracy** (Weight: 0.2):
```typescript
interface ReportAccuracy {
  validReports: number // Reports that led to action
  falseReports: number // Reports that were rejected
  ratio: number // validReports / (validReports + falseReports)
  decayRate: 0.90 // 10% decay per month (recent accuracy matters more)
}

// Valid reports: Reports that led to moderation action
// False reports: Reports that were rejected (no action taken)
// Ratio: Higher ratio = higher score component
// Decay: Recent accuracy matters more (10% decay per month)
```

**Component 4: Consistency** (Weight: 0.15):
```typescript
interface Consistency {
  activeDays: number // Days user was active
  totalDays: number // Total days since account creation
  ratio: number // activeDays / totalDays
  decayRate: 1.0 // No decay (consistency is cumulative)
}

// Active days: Days user logged in, interacted, or created content
// Total days: Days since account creation
// Ratio: Higher ratio = higher score component
// Decay: Consistency is cumulative (no decay)
```

**Component 5: Community Contribution** (Weight: 0.1):
```typescript
interface CommunityContribution {
  helpfulActions: number // Helped others, answered questions, created resources
  harmfulActions: number // Harassed others, spread misinformation, created problems
  ratio: number // helpfulActions / (helpfulActions + harmfulActions)
  decayRate: 0.95 // 5% decay per month (recent contributions matter more)
}

// Helpful actions: Helped others, answered questions, created resources
// Harmful actions: Harassed others, spread misinformation, created problems
// Ratio: Higher ratio = higher score component
// Decay: Recent contributions matter more (5% decay per month)
```

#### **Score Calculation**

**Total Score**:
```typescript
interface SocialScore {
  interactionQuality: number // 0-1, weight 0.3
  contentModeration: number // 0-1, weight 0.25
  reportAccuracy: number // 0-1, weight 0.2
  consistency: number // 0-1, weight 0.15
  communityContribution: number // 0-1, weight 0.1
  total: number // 0-1, weighted sum
  level: 'low' | 'medium' | 'high' // Simplified level for users
}

function calculateSocialScore(userId: string): SocialScore {
  const interactionQuality = calculateInteractionQuality(userId)
  const contentModeration = calculateContentModeration(userId)
  const reportAccuracy = calculateReportAccuracy(userId)
  const consistency = calculateConsistency(userId)
  const communityContribution = calculateCommunityContribution(userId)
  
  // Apply decay rates
  const decayedInteractionQuality = applyDecay(interactionQuality, 0.95)
  const decayedContentModeration = applyDecay(contentModeration, 0.98)
  const decayedReportAccuracy = applyDecay(reportAccuracy, 0.90)
  const decayedConsistency = consistency // No decay
  const decayedCommunityContribution = applyDecay(communityContribution, 0.95)
  
  // Weighted sum
  const total = 
    decayedInteractionQuality * 0.3 +
    decayedContentModeration * 0.25 +
    decayedReportAccuracy * 0.2 +
    decayedConsistency * 0.15 +
    decayedCommunityContribution * 0.1
  
  // Clamp to 0-1
  const clampedTotal = Math.max(0, Math.min(1, total))
  
  // Determine level
  const level = clampedTotal < 0.4 ? 'low' : 
                clampedTotal < 0.7 ? 'medium' : 'high'
  
  return {
    interactionQuality: decayedInteractionQuality,
    contentModeration: decayedContentModeration,
    reportAccuracy: decayedReportAccuracy,
    consistency: decayedConsistency,
    communityContribution: decayedCommunityContribution,
    total: clampedTotal,
    level
  }
}
```

**Decay Application**:
```typescript
function applyDecay(component: ComponentScore, decayRate: number, months: number = 1): number {
  // Apply exponential decay: value * (decayRate ^ months)
  return component.ratio * Math.pow(decayRate, months)
}

// Example: Interaction quality with 0.95 decay rate
// Month 0: 1.0 (current)
// Month 1: 0.95 (5% decay)
// Month 2: 0.9025 (10% decay from original)
// Month 3: 0.857375 (15% decay from original)
```

---

### 2. How Context Affects Scoring

#### **Context-Aware Scoring**

**Context Types**:
```typescript
interface ScoringContext {
  relationship: 'friend' | 'connection' | 'stranger' // Relationship context
  location: 'same-room' | 'nearby' | 'distant' // Location context
  time: 'peak-hours' | 'off-hours' | 'late-night' // Time context
  activity: 'chat' | 'room' | 'profile' | 'discovery' // Activity context
}
```

**Context Adjustments**:
```typescript
function adjustScoreForContext(
  baseScore: number,
  context: ScoringContext
): number {
  let adjusted = baseScore
  
  // Relationship context: Friends/connections get benefit of doubt
  if (context.relationship === 'friend') {
    adjusted *= 1.1 // 10% boost (friends are trusted)
  } else if (context.relationship === 'connection') {
    adjusted *= 1.05 // 5% boost (connections are somewhat trusted)
  }
  // Strangers: No adjustment (base score)
  
  // Location context: Same room = more weight
  if (context.location === 'same-room') {
    adjusted *= 1.05 // 5% boost (co-presence increases trust)
  }
  // Nearby/Distant: No adjustment
  
  // Time context: Off-hours = less weight (may be tired, less careful)
  if (context.time === 'off-hours') {
    adjusted *= 0.95 // 5% reduction (off-hours behavior may be less careful)
  }
  // Peak-hours/Late-night: No adjustment
  
  // Activity context: Chat = more weight (direct interaction)
  if (context.activity === 'chat') {
    adjusted *= 1.05 // 5% boost (direct interaction increases trust)
  }
  // Room/Profile/Discovery: No adjustment
  
  return Math.max(0, Math.min(1, adjusted)) // Clamp to 0-1
}
```

**Context Rules**:
- ✅ **REQUIRED**: Context affects scoring (relationship, location, time, activity)
- ✅ **REQUIRED**: Context adjustments are transparent (explainable)
- ✅ **REQUIRED**: Context adjustments are small (5-10%, not dramatic)
- ❌ **FORBIDDEN**: Context overrides base score (adjusts, not replaces)
- ❌ **FORBIDDEN**: Hidden context adjustments (must be transparent)

---

### 3. How False Reports Are Detected and Penalized

#### **False Report Detection**

**Detection Mechanisms**:
```typescript
interface FalseReportDetection {
  reportOutcome: 'valid' | 'invalid' | 'pending' // Report outcome
  reporterScore: number // Reporter's social score
  reportedUserScore: number // Reported user's social score
  reportHistory: ReportHistory[] // Reporter's report history
  context: ScoringContext // Context of report
}

function detectFalseReport(detection: FalseReportDetection): boolean {
  // If report was rejected (invalid), it may be false
  if (detection.reportOutcome === 'invalid') {
    // Check reporter's history: High false report rate = likely false
    const falseReportRate = detection.reportHistory.filter(r => r.outcome === 'invalid').length / 
                           detection.reportHistory.length
    if (falseReportRate > 0.5) {
      return true // More than 50% false reports = likely false reporter
    }
    
    // Check score discrepancy: Reporter much lower than reported = suspicious
    if (detection.reporterScore < detection.reportedUserScore - 0.3) {
      return true // Reporter score much lower = suspicious
    }
  }
  
  return false
}
```

**False Report Penalties**:
```typescript
function penalizeFalseReport(reporterId: string, severity: 'low' | 'medium' | 'high'): void {
  const penalty = {
    'low': 0.02, // 2% reduction (minor false report)
    'medium': 0.05, // 5% reduction (moderate false report)
    'high': 0.10 // 10% reduction (severe false report)
  }[severity]
  
  // Reduce reporter's social score
  const currentScore = getSocialScore(reporterId)
  const newScore = Math.max(0, currentScore.total - penalty)
  updateSocialScore(reporterId, newScore)
  
  // Track false report in history
  addFalseReportToHistory(reporterId, severity)
  
  // If false report rate is high, reduce report accuracy component
  const falseReportRate = calculateFalseReportRate(reporterId)
  if (falseReportRate > 0.5) {
    reduceReportAccuracyComponent(reporterId, 0.1) // 10% reduction
  }
}
```

**False Report Rules**:
- ✅ **REQUIRED**: Detect false reports (invalid reports, high false report rate, score discrepancy)
- ✅ **REQUIRED**: Penalize false reporters (score reduction, history tracking)
- ✅ **REQUIRED**: Reduce report accuracy component (if false report rate is high)
- ✅ **REQUIRED**: Transparent penalties (users see why score decreased)
- ❌ **FORBIDDEN**: Penalizing without detection (must detect first)
- ❌ **FORBIDDEN**: Hidden penalties (must be transparent)

---

### 4. How Appeals and Recovery Work

#### **Appeal System**

**Appeal Types**:
```typescript
interface Appeal {
  id: string
  userId: string
  type: 'score-reduction' | 'content-rejection' | 'report-penalty' | 'ban'
  reason: string // User's explanation
  evidence: string[] // Evidence provided by user
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy: string // Moderator who reviewed
  reviewedAt: number // Timestamp of review
}
```

**Appeal Flow**:
```typescript
function submitAppeal(userId: string, appeal: Appeal): void {
  // User submits appeal with reason and evidence
  // Appeal goes to moderation queue
  // Human moderator reviews appeal
  // Moderator approves or rejects appeal
  // If approved: Reverse penalty, restore score
  // If rejected: Appeal remains rejected, user notified
}

function processAppeal(appealId: string, decision: 'approved' | 'rejected', moderatorId: string): void {
  const appeal = getAppeal(appealId)
  
  if (decision === 'approved') {
    // Reverse penalty
    if (appeal.type === 'score-reduction') {
      restoreSocialScore(appeal.userId, appeal.originalScore)
    } else if (appeal.type === 'content-rejection') {
      approveContent(appeal.contentId)
    } else if (appeal.type === 'report-penalty') {
      removeFalseReportPenalty(appeal.userId)
    } else if (appeal.type === 'ban') {
      unbanUser(appeal.userId)
    }
    
    // Update appeal status
    updateAppealStatus(appealId, 'approved', moderatorId)
    
    // Notify user
    notifyUser(appeal.userId, 'Your appeal was approved. Your score/content/account has been restored.')
  } else {
    // Appeal rejected
    updateAppealStatus(appealId, 'rejected', moderatorId)
    
    // Notify user
    notifyUser(appeal.userId, 'Your appeal was rejected. The original decision stands.')
  }
}
```

**Recovery System**:
```typescript
function recoverScoreOverTime(userId: string): void {
  const currentScore = getSocialScore(userId)
  
  // If score is low, allow recovery through good behavior
  if (currentScore.total < 0.4) {
    // Recovery rate: 1% per month of good behavior
    const recoveryRate = 0.01 // 1% per month
    const monthsSinceViolation = calculateMonthsSinceLastViolation(userId)
    const recoveryAmount = recoveryRate * monthsSinceViolation
    
    // Apply recovery (up to neutral score of 0.5)
    const recoveredScore = Math.min(0.5, currentScore.total + recoveryAmount)
    updateSocialScore(userId, recoveredScore)
  }
}
```

**Appeal and Recovery Rules**:
- ✅ **REQUIRED**: Users can appeal (score reduction, content rejection, report penalty, ban)
- ✅ **REQUIRED**: Appeals reviewed by human moderators (not automated)
- ✅ **REQUIRED**: Recovery over time (good behavior increases score)
- ✅ **REQUIRED**: Transparent process (users see appeal status, recovery progress)
- ❌ **FORBIDDEN**: Automated appeals (must be human-reviewed)
- ❌ **FORBIDDEN**: No recovery mechanism (users must be able to recover)

---

### 5. How Scores Affect Discovery Without Creating Caste Systems

#### **Score Impact on Discovery**

**Discovery Weighting**:
```typescript
function applyScoreToDiscovery(
  baseRanking: number,
  socialScore: number,
  weight: number = 0.2 // 20% weight (proximity is primary)
): number {
  // Score affects ranking, but doesn't dominate
  // Proximity is primary (80% weight), score is secondary (20% weight)
  const scoreAdjustment = socialScore * weight
  const adjustedRanking = baseRanking * (1 - weight) + scoreAdjustment
  
  return adjustedRanking
}
```

**Score Thresholds** (Not Hard Limits):
```typescript
// Scores don't create hard limits (no caste system)
// Instead, scores influence discovery weight (soft influence)

// Low score (0-0.4): Reduced discovery weight (20% reduction)
// Medium score (0.4-0.7): Normal discovery weight (no adjustment)
// High score (0.7-1.0): Increased discovery weight (10% boost)

function getDiscoveryWeight(socialScore: number): number {
  if (socialScore < 0.4) {
    return 0.8 // 20% reduction (low score)
  } else if (socialScore < 0.7) {
    return 1.0 // Normal weight (medium score)
  } else {
    return 1.1 // 10% boost (high score)
  }
}
```

**Caste System Prevention**:
```typescript
// FORBIDDEN: Hard limits based on score
// FORBIDDEN: Complete exclusion based on score
// FORBIDDEN: Public score rankings (leaderboards)
// FORBIDDEN: Score-based privileges (premium features)

// ALLOWED: Soft influence on discovery (weight adjustment)
// ALLOWED: Score affects ranking, but doesn't dominate
// ALLOWED: Score is informational, not competitive
```

**Discovery Rules**:
- ✅ **REQUIRED**: Score affects discovery (soft influence, not hard limit)
- ✅ **REQUIRED**: Proximity is primary (80% weight), score is secondary (20% weight)
- ✅ **REQUIRED**: Score thresholds are soft (weight adjustment, not exclusion)
- ❌ **FORBIDDEN**: Hard limits based on score (no caste system)
- ❌ **FORBIDDEN**: Complete exclusion based on score (no caste system)
- ❌ **FORBIDDEN**: Public score rankings (no leaderboards)
- ❌ **FORBIDDEN**: Score-based privileges (no premium features)

---

## Output Requirements

### Social Score System Architecture

**Core Systems**:
1. **Score Calculator** (components, weights, decay)
2. **Context Adjuster** (relationship, location, time, activity)
3. **False Report Detector** (detection, penalties)
4. **Appeal System** (submission, review, recovery)
5. **Discovery Weighting** (soft influence, no caste system)

### Score Components Specification

**Components**:
- Interaction Quality (weight 0.3, decay 0.95/month)
- Content Moderation (weight 0.25, decay 0.98/month)
- Report Accuracy (weight 0.2, decay 0.90/month)
- Consistency (weight 0.15, no decay)
- Community Contribution (weight 0.1, decay 0.95/month)

**Score Calculation**:
- Weighted sum of components
- Decay applied per component
- Total score clamped to 0-1
- Level determined (low/medium/high)

### Context-Aware Scoring Specification

**Context Types**:
- Relationship (friend, connection, stranger)
- Location (same-room, nearby, distant)
- Time (peak-hours, off-hours, late-night)
- Activity (chat, room, profile, discovery)

**Context Adjustments**:
- Small adjustments (5-10%, not dramatic)
- Transparent (explainable)
- Adjusts, not replaces (base score still primary)

### False Report Detection Specification

**Detection Mechanisms**:
- Invalid reports (rejected by moderation)
- High false report rate (>50%)
- Score discrepancy (reporter much lower than reported)

**Penalties**:
- Score reduction (2-10% based on severity)
- History tracking (false report rate)
- Report accuracy component reduction (if false report rate high)

### Appeal and Recovery Specification

**Appeal System**:
- Users can appeal (score reduction, content rejection, report penalty, ban)
- Appeals reviewed by human moderators
- Appeals approved/rejected with explanation

**Recovery System**:
- Recovery over time (1% per month of good behavior)
- Recovery up to neutral score (0.5)
- Transparent recovery progress

### Discovery Impact Specification

**Discovery Weighting**:
- Proximity is primary (80% weight)
- Score is secondary (20% weight)
- Soft influence (weight adjustment, not hard limit)

**Caste System Prevention**:
- No hard limits based on score
- No complete exclusion based on score
- No public score rankings
- No score-based privileges

---

## Brand DNA Alignment

Every social score decision must align with:

1. **Metrics Never Dominate Emotion** → Score is informational, not competitive
2. **Transparency** → Score factors visible, explainable, appealable
3. **Anti-algorithm** → Score assists, doesn't dictate
4. **Presence over Performance** → Proximity is primary, score is secondary

---

## Success Criteria

The social score system is successful when:

- ✅ Score starts neutral (fair start, no bias)
- ✅ Transparency is mandatory (factors visible, explainable)
- ✅ Shaming is forbidden (no leaderboards, no rankings)
- ✅ False reports are penalized (abuse prevention)
- ✅ Appeals and recovery work (user agency)
- ✅ Scores affect discovery without creating caste systems (soft influence)
- ✅ Time decay exists (rewards long-term consistency)
- ✅ Context affects scoring (relationship, location, time, activity)

---

**CRITICAL**: This is a trust system, not a popularity system. Score reflects behavioral reliability, not status. Violating these rules creates a status economy and breaks Brand DNA.

