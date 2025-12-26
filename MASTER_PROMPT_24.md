# MASTER PROMPT 24
## SAFETY EVENT PIPELINE & RISK ENGINE

**SYSTEM MODE**: TRUST & SAFETY SYSTEM ARCHITECT

Design the safety event pipeline for WYA!?—backend logic and policy enforcement that protects users without killing expression.

---

## Input

- Full "Safety without killing fun" specification
- Social Score & Trust System (MASTER_PROMPT_22)
- Product Governance Framework
- The 4 Sacred Invariants

---

## Architectural Truths

### Why This Safety System Works

**A. Designed for Before, During, and After**:
- **Before**: Education, nudges, design constraints
- **During**: Soft prompts, rate limiting, visibility of exits
- **After**: Reporting, follow-up, education, recovery
- **Consequence**: Prevents escalation without over-policing

**B. Risk is Treated as a Gradient, Not a Switch**:
- Low risk: Never feels watched
- Medium risk: Feels guided, not accused
- High risk: Triggers human review
- Critical risk: Prioritizes victim protection immediately
- **Consequence**: Avoids chilling normal behavior, ignores early warning signs

**C. Age Layers are Experiential, Not Just Legal**:
- Feature availability changes by age
- Location precision changes by age
- Education frequency changes by age
- Intervention thresholds change by age
- Parental visibility changes by age
- **Consequence**: Experience itself is age-aware, not just rules

**D. Moderation is Transparent by Default**:
- Users see status
- Reasons are shown
- Appeals are real
- Improvement paths exist
- **Consequence**: Preserves dignity, prevents adversarial behavior

---

## The Non-Negotiable Invariants

### Invariant #1: Interventions Must Always Feel Optional Until They Aren't
- ✅ **REQUIRED**: Soft prompts never block primary actions
- ✅ **REQUIRED**: Soft prompts never accuse
- ✅ **REQUIRED**: Soft prompts never interrupt flow harshly
- ✅ **REQUIRED**: Hard restrictions only when credible risk
- **Rationale**: Safety feels like care, not punishment

### Invariant #2: Education Must Be Contextual, Never Generic
- ✅ **REQUIRED**: Safety tips contextual to behavior
- ❌ **FORBIDDEN**: Popups on every action
- ❌ **FORBIDDEN**: Repeated boilerplate
- ❌ **FORBIDDEN**: Disconnected from behavior
- **Rationale**: Users tune out generic education

### Invariant #3: Reporting Must Never Backfire on the Reporter
- ✅ **REQUIRED**: Reporter privacy protected
- ✅ **REQUIRED**: Reporter gets feedback
- ✅ **REQUIRED**: False reports penalized (reporter, not reported)
- ❌ **FORBIDDEN**: Reporter exposed
- ❌ **FORBIDDEN**: Reporter retaliated against
- ❌ **FORBIDDEN**: Reporter feels ignored
- **Rationale**: System collapses if reporting backfires

### Invariant #4: No Single Signal May Trigger Hard Punishment
- ✅ **REQUIRED**: AI flags alone never ban
- ✅ **REQUIRED**: AI flags alone never permanently restrict
- ✅ **REQUIRED**: AI flags alone never isolate
- ✅ **REQUIRED**: Human review mandatory for anything serious
- **Rationale**: Prevents false positives, preserves fairness

---

## Define

### 1. Safety Signals and How They Are Ingested

#### **Signal Types**

**Signal 1: Content Signals** (Text, Images, Media):
```typescript
interface ContentSignal {
  type: 'content'
  source: 'user-report' | 'ai-scan' | 'moderator-review'
  content: {
    text?: string
    imageUrl?: string
    videoUrl?: string
    audioUrl?: string
  }
  context: {
    roomId?: string
    userId: string
    timestamp: number
    metadata: Record<string, any>
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
}
```

**Signal 2: Behavior Signals** (Actions, Patterns):
```typescript
interface BehaviorSignal {
  type: 'behavior'
  source: 'automated-detection' | 'user-report' | 'moderator-observation'
  behavior: {
    action: 'spam' | 'harassment' | 'stalking' | 'grooming' | 'abuse'
    pattern: string[] // Sequence of actions
    frequency: number // Actions per time period
    targets: string[] // User IDs targeted
  }
  context: {
    userId: string
    timestamp: number
    location?: GeohashCell
    metadata: Record<string, any>
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
}
```

**Signal 3: Interaction Signals** (Messages, Reactions, Connections):
```typescript
interface InteractionSignal {
  type: 'interaction'
  source: 'user-report' | 'automated-detection' | 'moderator-review'
  interaction: {
    type: 'message' | 'reaction' | 'connection-request' | 'room-join'
    content?: string
    recipientId: string
    senderId: string
  }
  context: {
    relationship: 'friend' | 'connection' | 'stranger'
    history: InteractionHistory[]
    timestamp: number
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
}
```

**Signal 4: Location Signals** (Proximity, Stalking):
```typescript
interface LocationSignal {
  type: 'location'
  source: 'automated-detection' | 'user-report'
  location: {
    pattern: 'stalking' | 'proximity-abuse' | 'location-spoofing'
    targetUserId: string
    locations: GeohashCell[]
    timestamps: number[]
  }
  context: {
    userId: string
    targetUserId: string
    relationship: 'friend' | 'connection' | 'stranger'
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
}
```

#### **Signal Ingestion Flow**

**Ingestion Pipeline**:
```typescript
function ingestSafetySignal(signal: SafetySignal): void {
  // 1. Validate signal (required fields, format)
  validateSignal(signal)
  
  // 2. Enrich signal (add context, metadata)
  const enriched = enrichSignal(signal)
  
  // 3. Classify signal (type, severity)
  const classified = classifySignal(enriched)
  
  // 4. Route to appropriate handler
  routeSignal(classified)
  
  // 5. Log signal (audit trail)
  logSignal(classified)
}

function routeSignal(signal: ClassifiedSignal): void {
  // Route based on severity and type
  if (signal.severity === 'critical') {
    // Critical: Immediate human review
    queueForHumanReview(signal, priority: 'immediate')
  } else if (signal.severity === 'high') {
    // High: Human review queue (within 1 hour)
    queueForHumanReview(signal, priority: 'high')
  } else if (signal.severity === 'medium') {
    // Medium: AI review + optional human review
    processWithAI(signal)
  } else {
    // Low: Automated monitoring
    monitorSignal(signal)
  }
}
```

**Signal Ingestion Rules**:
- ✅ **REQUIRED**: All signals validated (required fields, format)
- ✅ **REQUIRED**: All signals enriched (context, metadata)
- ✅ **REQUIRED**: All signals classified (type, severity)
- ✅ **REQUIRED**: All signals logged (audit trail)
- ✅ **REQUIRED**: Critical signals routed immediately (human review)
- ❌ **FORBIDDEN**: Ignoring signals (all must be processed)
- ❌ **FORBIDDEN**: Losing signals (must be logged)

---

### 2. Risk Scoring Model (Non-Binary, Time-Decayed)

#### **Risk Score Components**

**Component 1: Signal Severity** (Weight: 0.4):
```typescript
interface SignalSeverityScore {
  baseSeverity: number // 0-1, from signal classification
  signalCount: number // Number of signals in time window
  signalFrequency: number // Signals per time period
  score: number // 0-1, weighted combination
}

function calculateSignalSeverityScore(signals: SafetySignal[]): SignalSeverityScore {
  // Base severity: Average of signal severities
  const baseSeverity = signals.reduce((sum, s) => sum + getSeverityValue(s.severity), 0) / signals.length
  
  // Signal count: More signals = higher risk (capped at 10)
  const signalCount = Math.min(10, signals.length)
  const countFactor = signalCount / 10
  
  // Signal frequency: Higher frequency = higher risk
  const timeWindow = 24 * 60 * 60 * 1000 // 24 hours
  const recentSignals = signals.filter(s => Date.now() - s.timestamp < timeWindow)
  const frequency = recentSignals.length / (timeWindow / (60 * 60 * 1000)) // Signals per hour
  const frequencyFactor = Math.min(1, frequency / 5) // Cap at 5 signals/hour
  
  // Weighted combination
  const score = baseSeverity * 0.5 + countFactor * 0.3 + frequencyFactor * 0.2
  
  return {
    baseSeverity,
    signalCount,
    signalFrequency: frequency,
    score: Math.min(1, score)
  }
}
```

**Component 2: User History** (Weight: 0.3):
```typescript
interface UserHistoryScore {
  violationHistory: Violation[]
  timeSinceLastViolation: number // Days
  improvementTrend: number // -1 to 1, improving or worsening
  score: number // 0-1, weighted combination
}

function calculateUserHistoryScore(userId: string): UserHistoryScore {
  const violations = getViolationHistory(userId)
  const timeSinceLast = violations.length > 0 ? 
    (Date.now() - violations[0].timestamp) / (24 * 60 * 60 * 1000) : 
    Infinity
  
  // Violation history: More violations = higher risk (decayed over time)
  const violationScore = violations.reduce((sum, v) => {
    const age = (Date.now() - v.timestamp) / (24 * 60 * 60 * 1000) // Days
    const decay = Math.exp(-age / 30) // 30-day half-life
    return sum + getSeverityValue(v.severity) * decay
  }, 0) / Math.max(1, violations.length)
  
  // Time since last violation: Longer = lower risk
  const timeFactor = Math.min(1, timeSinceLast / 90) // 90 days to full recovery
  
  // Improvement trend: Improving = lower risk
  const recentViolations = violations.filter(v => Date.now() - v.timestamp < 90 * 24 * 60 * 60 * 1000)
  const olderViolations = violations.filter(v => Date.now() - v.timestamp >= 90 * 24 * 60 * 60 * 1000)
  const recentSeverity = recentViolations.reduce((sum, v) => sum + getSeverityValue(v.severity), 0) / Math.max(1, recentViolations.length)
  const olderSeverity = olderViolations.reduce((sum, v) => sum + getSeverityValue(v.severity), 0) / Math.max(1, olderViolations.length)
  const improvementTrend = olderViolations.length > 0 ? (olderSeverity - recentSeverity) : 0
  
  // Weighted combination
  const score = violationScore * 0.5 + (1 - timeFactor) * 0.3 + (1 - improvementTrend) * 0.2
  
  return {
    violationHistory: violations,
    timeSinceLastViolation: timeSinceLast,
    improvementTrend,
    score: Math.min(1, score)
  }
}
```

**Component 3: Context Factors** (Weight: 0.2):
```typescript
interface ContextScore {
  relationship: number // 0-1, friend = lower risk, stranger = higher risk
  location: number // 0-1, same room = higher risk (proximity abuse)
  time: number // 0-1, off-hours = higher risk
  activity: number // 0-1, chat = higher risk (direct interaction)
  score: number // 0-1, weighted combination
}

function calculateContextScore(context: DiscoveryContext): ContextScore {
  // Relationship: Friends = lower risk (0.3), strangers = higher risk (0.7)
  const relationshipScore = context.relationship === 'friend' ? 0.3 :
                           context.relationship === 'connection' ? 0.5 : 0.7
  
  // Location: Same room = higher risk (proximity abuse potential)
  const locationScore = context.location === 'same-room' ? 0.7 :
                        context.location === 'nearby' ? 0.5 : 0.3
  
  // Time: Off-hours = higher risk (less supervision)
  const timeScore = context.time === 'off-hours' ? 0.6 : 0.4
  
  // Activity: Chat = higher risk (direct interaction)
  const activityScore = context.activity === 'chat' ? 0.7 : 0.4
  
  // Weighted combination
  const score = relationshipScore * 0.3 + locationScore * 0.3 + timeScore * 0.2 + activityScore * 0.2
  
  return {
    relationship: relationshipScore,
    location: locationScore,
    time: timeScore,
    activity: activityScore,
    score
  }
}
```

**Component 4: Age Factor** (Weight: 0.1):
```typescript
interface AgeScore {
  userAge: number
  targetAge?: number
  ageGap?: number
  score: number // 0-1, higher for younger users or large age gaps
}

function calculateAgeScore(userId: string, targetUserId?: string): AgeScore {
  const userAge = getUserAge(userId)
  const targetAge = targetUserId ? getUserAge(targetUserId) : undefined
  const ageGap = targetAge ? Math.abs(userAge - targetAge) : undefined
  
  // Younger users = higher risk (more vulnerable)
  const ageScore = userAge < 18 ? 0.7 : userAge < 25 ? 0.5 : 0.3
  
  // Large age gaps = higher risk (grooming potential)
  const gapScore = ageGap && ageGap > 5 ? 0.6 : 0.4
  
  // Weighted combination
  const score = ageScore * 0.6 + (gapScore || 0.4) * 0.4
  
  return {
    userAge,
    targetAge,
    ageGap,
    score
  }
}
```

#### **Total Risk Score**

**Risk Score Calculation**:
```typescript
interface RiskScore {
  signalSeverity: number // 0-1, weight 0.4
  userHistory: number // 0-1, weight 0.3
  context: number // 0-1, weight 0.2
  age: number // 0-1, weight 0.1
  total: number // 0-1, weighted sum
  level: 'monitor' | 'guide' | 'intervene' | 'protect'
  decayRate: number // 0.95 per day (5% decay per day)
}

function calculateRiskScore(
  signals: SafetySignal[],
  userId: string,
  context: DiscoveryContext
): RiskScore {
  const signalSeverity = calculateSignalSeverityScore(signals)
  const userHistory = calculateUserHistoryScore(userId)
  const contextScore = calculateContextScore(context)
  const ageScore = calculateAgeScore(userId)
  
  // Weighted sum
  const total = 
    signalSeverity.score * 0.4 +
    userHistory.score * 0.3 +
    contextScore.score * 0.2 +
    ageScore.score * 0.1
  
  // Determine risk level
  const level = total < 0.3 ? 'monitor' :
                total < 0.5 ? 'guide' :
                total < 0.7 ? 'intervene' : 'protect'
  
  // Decay rate: 5% per day (risk decreases over time)
  const decayRate = 0.95
  
  return {
    signalSeverity: signalSeverity.score,
    userHistory: userHistory.score,
    context: contextScore.score,
    age: ageScore.score,
    total: Math.min(1, total),
    level,
    decayRate
  }
}

function applyDecay(riskScore: RiskScore, days: number): RiskScore {
  // Apply exponential decay: score * (decayRate ^ days)
  const decayedTotal = riskScore.total * Math.pow(riskScore.decayRate, days)
  
  return {
    ...riskScore,
    total: Math.max(0, decayedTotal),
    level: decayedTotal < 0.3 ? 'monitor' :
           decayedTotal < 0.5 ? 'guide' :
           decayedTotal < 0.7 ? 'intervene' : 'protect'
  }
}
```

**Risk Score Rules**:
- ✅ **REQUIRED**: Risk score is non-binary (gradient, 0-1)
- ✅ **REQUIRED**: Risk score decays over time (5% per day)
- ✅ **REQUIRED**: Risk score considers multiple factors (signals, history, context, age)
- ✅ **REQUIRED**: Risk level determined from score (monitor, guide, intervene, protect)
- ❌ **FORBIDDEN**: Binary risk (low/high only)
- ❌ **FORBIDDEN**: No decay (risk must decrease over time)

---

### 3. Thresholds for Monitoring, Guidance, Intervention

#### **Risk Level Thresholds**

**Level 1: Monitor** (Risk Score: 0.0-0.3):
```typescript
interface MonitorThreshold {
  riskScore: [0.0, 0.3]
  actions: {
    log: true // Log signals for pattern detection
    alert: false // No user-facing alerts
    restrict: false // No restrictions
    humanReview: false // No human review
  }
  duration: 'indefinite' // Monitor until score changes
}
```

**Level 2: Guide** (Risk Score: 0.3-0.5):
```typescript
interface GuideThreshold {
  riskScore: [0.3, 0.5]
  actions: {
    log: true // Log signals
    alert: true // Soft prompts, contextual education
    restrict: false // No restrictions
    humanReview: false // No human review (unless pattern)
  }
  duration: 'until-improved' // Guide until score decreases
  interventions: {
    softPrompts: true // Contextual safety tips
    education: true // Contextual education
    rateLimiting: false // No rate limiting
  }
}
```

**Level 3: Intervene** (Risk Score: 0.5-0.7):
```typescript
interface InterveneThreshold {
  riskScore: [0.5, 0.7]
  actions: {
    log: true // Log signals
    alert: true // Warnings, stronger prompts
    restrict: true // Soft restrictions (rate limiting, visibility)
    humanReview: true // Human review within 24 hours
  }
  duration: 'until-resolved' // Intervene until resolved
  interventions: {
    softPrompts: true // Stronger prompts
    warnings: true // Explicit warnings
    rateLimiting: true // Rate limiting
    visibilityReduction: true // Reduce visibility in discovery
  }
}
```

**Level 4: Protect** (Risk Score: 0.7-1.0):
```typescript
interface ProtectThreshold {
  riskScore: [0.7, 1.0]
  actions: {
    log: true // Log signals
    alert: true // Immediate warnings
    restrict: true // Hard restrictions (temporary ban, isolation)
    humanReview: true // Immediate human review
  }
  duration: 'until-resolved' // Protect until resolved
  interventions: {
    warnings: true // Immediate warnings
    temporaryBan: true // Temporary ban (24-72 hours)
    isolation: true // Isolate from potential victims
    victimProtection: true // Prioritize victim protection
  }
}
```

#### **Threshold Rules**

**Threshold Application**:
- ✅ **REQUIRED**: Thresholds applied based on risk score (monitor, guide, intervene, protect)
- ✅ **REQUIRED**: Interventions escalate with risk level (soft → hard)
- ✅ **REQUIRED**: Human review triggered at intervene/protect levels
- ✅ **REQUIRED**: Victim protection prioritized at protect level
- ❌ **FORBIDDEN**: Skipping levels (must escalate gradually)
- ❌ **FORBIDDEN**: Hard restrictions at monitor/guide levels (only soft prompts)

---

### 4. How Human Review is Triggered

#### **Human Review Triggers**

**Trigger 1: Risk Score Threshold**:
```typescript
function shouldTriggerHumanReview(riskScore: RiskScore): boolean {
  // Trigger if risk level is "intervene" or "protect"
  return riskScore.level === 'intervene' || riskScore.level === 'protect'
}
```

**Trigger 2: Critical Signal**:
```typescript
function shouldTriggerHumanReview(signal: SafetySignal): boolean {
  // Trigger if signal severity is "critical"
  return signal.severity === 'critical'
}
```

**Trigger 3: Pattern Detection**:
```typescript
function shouldTriggerHumanReview(signals: SafetySignal[]): boolean {
  // Trigger if pattern detected (e.g., multiple reports, repeated behavior)
  const recentSignals = signals.filter(s => Date.now() - s.timestamp < 24 * 60 * 60 * 1000)
  
  // Pattern: 3+ signals in 24 hours
  if (recentSignals.length >= 3) {
    return true
  }
  
  // Pattern: Same behavior repeated
  const behaviorCounts = new Map<string, number>()
  for (const signal of recentSignals) {
    if (signal.type === 'behavior') {
      const key = signal.behavior.action
      behaviorCounts.set(key, (behaviorCounts.get(key) || 0) + 1)
      if (behaviorCounts.get(key)! >= 2) {
        return true // Same behavior repeated
      }
    }
  }
  
  return false
}
```

**Trigger 4: User Request**:
```typescript
function shouldTriggerHumanReview(userId: string, requestType: 'appeal' | 'report'): boolean {
  // Always trigger for appeals and reports (user-initiated)
  return true
}
```

#### **Human Review Queue**

**Queue Management**:
```typescript
interface HumanReviewQueue {
  items: HumanReviewItem[]
  priorities: {
    'immediate': HumanReviewItem[] // Critical risk, protect level
    'high': HumanReviewItem[] // Intervene level, critical signals
    'medium': HumanReviewItem[] // Pattern detection, user requests
    'low': HumanReviewItem[] // Monitor/guide escalation
  }
}

function queueForHumanReview(signal: SafetySignal, priority: 'immediate' | 'high' | 'medium' | 'low'): void {
  const reviewItem: HumanReviewItem = {
    id: generateId(),
    signal,
    riskScore: calculateRiskScore([signal], signal.context.userId, getContext(signal)),
    priority,
    queuedAt: Date.now(),
    status: 'pending'
  }
  
  // Add to appropriate priority queue
  getReviewQueue().priorities[priority].push(reviewItem)
  
  // Notify moderators if immediate/high priority
  if (priority === 'immediate' || priority === 'high') {
    notifyModerators(reviewItem)
  }
}
```

**Human Review Rules**:
- ✅ **REQUIRED**: Human review triggered at intervene/protect levels
- ✅ **REQUIRED**: Human review triggered for critical signals
- ✅ **REQUIRED**: Human review triggered for pattern detection
- ✅ **REQUIRED**: Human review triggered for user requests (appeals, reports)
- ✅ **REQUIRED**: Priority queue (immediate, high, medium, low)
- ❌ **FORBIDDEN**: AI-only decisions at intervene/protect levels (human review required)
- ❌ **FORBIDDEN**: Delaying human review for critical signals (immediate priority)

---

### 5. How False Positives Are Handled and Corrected

#### **False Positive Detection**

**Detection Mechanisms**:
```typescript
interface FalsePositiveDetection {
  aiConfidence: number // 0-1, AI's confidence in signal
  humanReview: 'false-positive' | 'valid' | 'pending'
  userAppeal: boolean // User appealed the signal
  patternAnalysis: {
    similarSignals: number // Similar signals that were false positives
    falsePositiveRate: number // 0-1, rate of false positives for this signal type
  }
}

function detectFalsePositive(signal: SafetySignal, review: HumanReview): boolean {
  // If human review says false positive
  if (review.decision === 'false-positive') {
    return true
  }
  
  // If AI confidence is low and user appealed
  if (signal.aiConfidence < 0.5 && review.userAppeal) {
    return true // Likely false positive
  }
  
  // If pattern analysis shows high false positive rate
  const pattern = analyzePattern(signal)
  if (pattern.falsePositiveRate > 0.5) {
    return true // High false positive rate for this type
  }
  
  return false
}
```

#### **False Positive Correction**

**Correction Flow**:
```typescript
function correctFalsePositive(signal: SafetySignal, review: HumanReview): void {
  // 1. Mark signal as false positive
  markSignalAsFalsePositive(signal.id)
  
  // 2. Reverse any penalties applied
  reversePenalties(signal.context.userId, signal.id)
  
  // 3. Update risk score (remove false positive impact)
  adjustRiskScore(signal.context.userId, -signal.riskImpact)
  
  // 4. Update AI model (learn from false positive)
  updateAIModel(signal, 'false-positive')
  
  // 5. Notify user (if penalty was applied)
  if (wasPenaltyApplied(signal.context.userId, signal.id)) {
    notifyUser(signal.context.userId, {
      type: 'false-positive-corrected',
      message: 'A safety signal was incorrectly flagged. We apologize for the inconvenience. Your account has been restored.',
      action: 'view-details'
    })
  }
  
  // 6. Log correction (audit trail)
  logFalsePositiveCorrection(signal, review)
}
```

**False Positive Rules**:
- ✅ **REQUIRED**: False positives detected (human review, AI confidence, pattern analysis)
- ✅ **REQUIRED**: False positives corrected (reverse penalties, adjust risk score, update AI)
- ✅ **REQUIRED**: Users notified of false positives (if penalty was applied)
- ✅ **REQUIRED**: False positives logged (audit trail, learning)
- ❌ **FORBIDDEN**: Ignoring false positives (must be corrected)
- ❌ **FORBIDDEN**: Not notifying users (transparency)

---

## Output Requirements

### Safety Event Pipeline Architecture

**Core Systems**:
1. **Signal Ingestion** (validate, enrich, classify, route)
2. **Risk Scoring** (non-binary, time-decayed, multi-factor)
3. **Threshold Management** (monitor, guide, intervene, protect)
4. **Human Review Queue** (priorities, triggers, management)
5. **False Positive Handling** (detection, correction, learning)

### Signal System Specification

**Signal Types**:
- Content signals (text, images, media)
- Behavior signals (actions, patterns)
- Interaction signals (messages, reactions, connections)
- Location signals (proximity, stalking)

**Signal Ingestion**:
- Validation, enrichment, classification
- Routing based on severity
- Logging for audit trail

### Risk Scoring System Specification

**Risk Components**:
- Signal severity (weight 0.4)
- User history (weight 0.3)
- Context factors (weight 0.2)
- Age factor (weight 0.1)

**Risk Levels**:
- Monitor (0.0-0.3): Log only
- Guide (0.3-0.5): Soft prompts, education
- Intervene (0.5-0.7): Warnings, restrictions, human review
- Protect (0.7-1.0): Hard restrictions, immediate human review, victim protection

**Risk Decay**:
- 5% decay per day (exponential)
- Risk decreases over time

### Threshold System Specification

**Thresholds**:
- Monitor: Log only, no restrictions
- Guide: Soft prompts, contextual education, no restrictions
- Intervene: Warnings, rate limiting, visibility reduction, human review
- Protect: Temporary ban, isolation, victim protection, immediate human review

### Human Review System Specification

**Review Triggers**:
- Risk score threshold (intervene/protect)
- Critical signals
- Pattern detection
- User requests (appeals, reports)

**Review Queue**:
- Priority levels (immediate, high, medium, low)
- Queue management
- Moderator notifications

### False Positive System Specification

**False Positive Detection**:
- Human review decision
- AI confidence + user appeal
- Pattern analysis (false positive rate)

**False Positive Correction**:
- Mark as false positive
- Reverse penalties
- Adjust risk score
- Update AI model
- Notify user
- Log correction

---

## Brand DNA Alignment

Every safety decision must align with:

1. **Safety without killing fun** → Interventions feel optional until they aren't
2. **Transparency** → Users see status, reasons, appeals, improvement paths
3. **Age-aware** → Experience changes by age, not just rules
4. **Risk as gradient** → Non-binary, time-decayed, multi-factor

---

## Success Criteria

The safety event pipeline is successful when:

- ✅ Safety signals ingested correctly (validate, enrich, classify, route)
- ✅ Risk scoring is non-binary (gradient, time-decayed, multi-factor)
- ✅ Thresholds applied correctly (monitor, guide, intervene, protect)
- ✅ Human review triggered appropriately (intervene/protect, critical signals, patterns)
- ✅ False positives detected and corrected (reverse penalties, adjust scores, notify users)
- ✅ Interventions feel optional until they aren't (soft prompts, no accusations)
- ✅ Education is contextual (not generic, not repeated boilerplate)
- ✅ Reporting never backfires (reporter privacy, feedback, false report penalties)
- ✅ No single signal triggers hard punishment (human review required)

---

**CRITICAL**: This is backend logic and policy enforcement. No UI. Pure systems architecture. Safety must feel like care, not punishment. Violating these rules breaks trust and violates Brand DNA.

