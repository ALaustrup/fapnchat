# MASTER PROMPT 26
## REPORTING, APPEALS & TRANSPARENCY SYSTEM

**SYSTEM MODE**: GOVERNANCE & TRANSPARENCY ARCHITECT

Design the reporting and appeals system for WYA!? that feels fair, fast, and human.

---

## Input

- Safety Event Pipeline & Risk Engine (MASTER_PROMPT_24)
- Intervention UX & Copy System (MASTER_PROMPT_25)
- Social Score & Trust System (MASTER_PROMPT_22)
- Product Governance Framework

---

## Architectural Truths

### Why This System Works

**A. Reporting Never Backfires**:
- Reporter privacy protected
- Reporter gets feedback
- False reports penalized (reporter, not reported)
- **Consequence**: System doesn't collapse, users trust reporting

**B. Moderation is Transparent**:
- Users see status
- Reasons are shown
- Appeals are real
- Improvement paths exist
- **Consequence**: Preserves dignity, prevents adversarial behavior

**C. Appeals Process is Fair**:
- Human review (not automated)
- Timelines are clear
- Decisions are explained
- **Consequence**: Users trust the system, feel heard

---

## The Non-Negotiable Invariants

### Invariant #1: Reporting Must Never Backfire on the Reporter
- ✅ **REQUIRED**: Reporter privacy protected
- ✅ **REQUIRED**: Reporter gets feedback
- ✅ **REQUIRED**: False reports penalized (reporter, not reported)
- ❌ **FORBIDDEN**: Reporter exposed
- ❌ **FORBIDDEN**: Reporter retaliated against
- ❌ **FORBIDDEN**: Reporter feels ignored
- **Rationale**: System collapses if reporting backfires

### Invariant #2: No Hidden Suppression
- ✅ **REQUIRED**: All restrictions visible, explainable, appealable
- ❌ **FORBIDDEN**: Shadow banning, silent throttling, invisible penalties
- **Rationale**: Moderation convenience is not worth trust loss

### Invariant #3: Appeals Must Be Real
- ✅ **REQUIRED**: Human review (not automated)
- ✅ **REQUIRED**: Timelines are clear
- ✅ **REQUIRED**: Decisions are explained
- ❌ **FORBIDDEN**: Automated appeals (must be human-reviewed)
- ❌ **FORBIDDEN**: No appeal option (must be appealable)
- **Rationale**: Users must feel heard, system must be fair

---

## Define

### 1. Report Intake and Context Capture

#### **Report Types**

**Type 1: Content Report** (Text, Images, Media):
```typescript
interface ContentReport {
  type: 'content'
  reportedContent: {
    text?: string
    imageUrl?: string
    videoUrl?: string
    audioUrl?: string
  }
  reason: 'harassment' | 'hate-speech' | 'spam' | 'inappropriate' | 'other'
  context: {
    roomId?: string
    messageId?: string
    timestamp: number
    additionalContext?: string // User's explanation
  }
  reporterId: string
  reportedUserId: string
}
```

**Type 2: Behavior Report** (Actions, Patterns):
```typescript
interface BehaviorReport {
  type: 'behavior'
  reportedBehavior: {
    action: 'harassment' | 'stalking' | 'grooming' | 'abuse' | 'spam'
    description: string // User's description
    evidence?: string[] // Screenshots, links, etc.
  }
  context: {
    relationship: 'friend' | 'connection' | 'stranger'
    history: string // Previous interactions
    timestamp: number
  }
  reporterId: string
  reportedUserId: string
}
```

**Type 3: Location Report** (Proximity, Stalking):
```typescript
interface LocationReport {
  type: 'location'
  reportedLocation: {
    pattern: 'stalking' | 'proximity-abuse' | 'unwanted-proximity'
    description: string // User's description
    evidence?: string[] // Location history, screenshots
  }
  context: {
    relationship: 'friend' | 'connection' | 'stranger'
    locationHistory: GeohashCell[]
    timestamps: number[]
  }
  reporterId: string
  reportedUserId: string
}
```

#### **Report Intake Flow**

**Intake Process**:
```typescript
function submitReport(report: Report): ReportSubmission {
  // 1. Validate report (required fields, format)
  validateReport(report)
  
  // 2. Capture context (automatically gather context)
  const enrichedReport = enrichReportWithContext(report)
  
  // 3. Check for duplicate reports (same reporter, same reported user, recent)
  const isDuplicate = checkDuplicateReport(enrichedReport)
  if (isDuplicate) {
    return {
      status: 'duplicate',
      message: 'You\'ve already reported this. We\'re reviewing it.'
    }
  }
  
  // 4. Route to appropriate queue (based on severity, type)
  const queue = routeReportToQueue(enrichedReport)
  
  // 5. Protect reporter privacy (anonymize if needed)
  const anonymizedReport = protectReporterPrivacy(enrichedReport)
  
  // 6. Log report (audit trail)
  logReport(anonymizedReport)
  
  // 7. Notify reporter (confirmation, timeline)
  notifyReporter(report.reporterId, {
    status: 'submitted',
    reportId: enrichedReport.id,
    estimatedReviewTime: getEstimatedReviewTime(enrichedReport),
    message: 'Thank you for reporting. We\'ll review this within 24 hours.'
  })
  
  return {
    status: 'submitted',
    reportId: enrichedReport.id,
    estimatedReviewTime: getEstimatedReviewTime(enrichedReport)
  }
}

function enrichReportWithContext(report: Report): EnrichedReport {
  // Automatically gather context
  const context = {
    relationship: getRelationship(report.reporterId, report.reportedUserId),
    interactionHistory: getInteractionHistory(report.reporterId, report.reportedUserId),
    locationHistory: getLocationHistory(report.reporterId, report.reportedUserId),
    previousReports: getPreviousReports(report.reportedUserId),
    socialScores: {
      reporter: getSocialScore(report.reporterId),
      reported: getSocialScore(report.reportedUserId)
    }
  }
  
  return {
    ...report,
    context,
    enrichedAt: Date.now()
  }
}
```

**Report Intake Rules**:
- ✅ **REQUIRED**: Validate report (required fields, format)
- ✅ **REQUIRED**: Enrich with context (relationship, history, scores)
- ✅ **REQUIRED**: Check for duplicates (prevent spam)
- ✅ **REQUIRED**: Protect reporter privacy (anonymize if needed)
- ✅ **REQUIRED**: Notify reporter (confirmation, timeline)
- ❌ **FORBIDDEN**: Exposing reporter (privacy violation)
- ❌ **FORBIDDEN**: Ignoring reports (all must be processed)

---

### 2. Review Workflow (AI + Human)

#### **Review Stages**

**Stage 1: AI Pre-Review** (Automated Screening):
```typescript
interface AIPreReview {
  stage: 'ai-pre-review'
  report: EnrichedReport
  aiAnalysis: {
    confidence: number // 0-1, AI's confidence in violation
    severity: 'low' | 'medium' | 'high' | 'critical'
    recommendedAction: 'dismiss' | 'escalate' | 'urgent-review'
    reasoning: string // AI's reasoning (for transparency)
  }
}

function performAIPreReview(report: EnrichedReport): AIPreReview {
  // AI analyzes report content, context, patterns
  const aiAnalysis = analyzeReportWithAI(report)
  
  // Route based on AI confidence and severity
  if (aiAnalysis.confidence > 0.9 && aiAnalysis.severity === 'critical') {
    // High confidence, critical severity → Urgent human review
    queueForHumanReview(report, priority: 'immediate')
  } else if (aiAnalysis.confidence > 0.7 && aiAnalysis.severity === 'high') {
    // High confidence, high severity → Human review queue
    queueForHumanReview(report, priority: 'high')
  } else if (aiAnalysis.confidence < 0.3) {
    // Low confidence → May be false positive, human review needed
    queueForHumanReview(report, priority: 'medium')
  } else {
    // Medium confidence → Human review queue (standard)
    queueForHumanReview(report, priority: 'medium')
  }
  
  return {
    stage: 'ai-pre-review',
    report,
    aiAnalysis
  }
}
```

**Stage 2: Human Review** (Moderator Decision):
```typescript
interface HumanReview {
  stage: 'human-review'
  report: EnrichedReport
  aiAnalysis: AIPreReview['aiAnalysis']
  moderatorDecision: {
    decision: 'dismiss' | 'warn' | 'restrict' | 'ban' | 'escalate'
    severity: 'low' | 'medium' | 'high' | 'critical'
    reasoning: string // Moderator's reasoning (for transparency)
    action: {
      type: 'warning' | 'restriction' | 'ban'
      duration?: number // Hours (for restrictions/bans)
      details: string // Specific action details
    }
  }
  moderatorId: string
  reviewedAt: number
}

function performHumanReview(report: EnrichedReport, aiAnalysis: AIPreReview['aiAnalysis']): HumanReview {
  // Human moderator reviews report, AI analysis, context
  const moderatorDecision = moderatorReviewsReport(report, aiAnalysis)
  
  // Apply action if violation confirmed
  if (moderatorDecision.decision !== 'dismiss') {
    applyAction(moderatorDecision.action, report.reportedUserId)
  }
  
  // Update reporter status
  updateReporterStatus(report.reporterId, {
    reportId: report.id,
    status: 'reviewed',
    decision: moderatorDecision.decision,
    message: getReporterMessage(moderatorDecision.decision)
  })
  
  // Update reported user status
  updateReportedUserStatus(report.reportedUserId, {
    reportId: report.id,
    status: 'reviewed',
    decision: moderatorDecision.decision,
    action: moderatorDecision.action,
    reasoning: moderatorDecision.reasoning,
    appealable: true
  })
  
  return {
    stage: 'human-review',
    report,
    aiAnalysis,
    moderatorDecision,
    moderatorId: getCurrentModeratorId(),
    reviewedAt: Date.now()
  }
}
```

**Review Workflow Rules**:
- ✅ **REQUIRED**: AI pre-review (screening, routing)
- ✅ **REQUIRED**: Human review for all reports (not AI-only)
- ✅ **REQUIRED**: Moderator reasoning (transparent, explainable)
- ✅ **REQUIRED**: Update both reporter and reported user (status, decision)
- ❌ **FORBIDDEN**: AI-only decisions (human review required)
- ❌ **FORBIDDEN**: No reasoning (must explain decisions)

---

### 3. User-Facing Status Updates

#### **Status Update Types**

**For Reporters**:
```typescript
interface ReporterStatusUpdate {
  reportId: string
  status: 'submitted' | 'under-review' | 'reviewed' | 'resolved'
  message: string // User-friendly message
  decision?: 'dismissed' | 'action-taken' | 'escalated'
  timeline?: {
    submitted: number
    underReview?: number
    reviewed?: number
    resolved?: number
  }
}

// Example: Report submitted
const submittedUpdate: ReporterStatusUpdate = {
  reportId: 'report-123',
  status: 'submitted',
  message: 'Thank you for reporting. We\'ll review this within 24 hours.',
  timeline: {
    submitted: Date.now()
  }
}

// Example: Under review
const underReviewUpdate: ReporterStatusUpdate = {
  reportId: 'report-123',
  status: 'under-review',
  message: 'We\'re reviewing your report. This usually takes 24-48 hours.',
  timeline: {
    submitted: Date.now() - 3600000,
    underReview: Date.now()
  }
}

// Example: Reviewed (action taken)
const actionTakenUpdate: ReporterStatusUpdate = {
  reportId: 'report-123',
  status: 'reviewed',
  decision: 'action-taken',
  message: 'We\'ve reviewed your report and taken action. Thank you for helping keep WYA!? safe.',
  timeline: {
    submitted: Date.now() - 86400000,
    underReview: Date.now() - 43200000,
    reviewed: Date.now()
  }
}
```

**For Reported Users**:
```typescript
interface ReportedUserStatusUpdate {
  reportId: string
  status: 'reported' | 'under-review' | 'reviewed' | 'appealed'
  message: string // User-friendly message
  decision?: 'dismissed' | 'warning' | 'restriction' | 'ban'
  action?: {
    type: 'warning' | 'restriction' | 'ban'
    duration?: number // Hours
    details: string
  }
  reasoning: string // Why action was taken
  appealable: boolean
  timeline?: {
    reported: number
    underReview?: number
    reviewed?: number
    appealed?: number
  }
}

// Example: Reported (warning)
const warningUpdate: ReportedUserStatusUpdate = {
  reportId: 'report-123',
  status: 'reviewed',
  decision: 'warning',
  message: 'We\'ve received a report about your behavior. Please review our community guidelines.',
  action: {
    type: 'warning',
    details: 'Your recent interactions may have made others uncomfortable. Please be respectful.'
  },
  reasoning: 'Multiple users reported your behavior as unwelcoming. We want to help you improve.',
  appealable: true,
  timeline: {
    reported: Date.now() - 86400000,
    underReview: Date.now() - 43200000,
    reviewed: Date.now()
  }
}
```

**Status Update Rules**:
- ✅ **REQUIRED**: Update reporters (confirmation, timeline, decision)
- ✅ **REQUIRED**: Update reported users (status, decision, reasoning, appeal)
- ✅ **REQUIRED**: User-friendly messages (not technical jargon)
- ✅ **REQUIRED**: Transparent reasoning (why action was taken)
- ❌ **FORBIDDEN**: No updates (users must be informed)
- ❌ **FORBIDDEN**: Vague messages (must be clear and specific)

---

### 4. Appeal Process and Timelines

#### **Appeal Types**

**Type 1: Report Appeal** (Appeal a Report Decision):
```typescript
interface ReportAppeal {
  type: 'report-appeal'
  reportId: string
  userId: string // Reported user appealing
  reason: string // Why user thinks decision was wrong
  evidence?: string[] // Additional evidence (screenshots, etc.)
  submittedAt: number
  status: 'pending' | 'under-review' | 'approved' | 'rejected'
  reviewedBy?: string // Moderator ID
  reviewedAt?: number
  decision?: {
    decision: 'approved' | 'rejected'
    reasoning: string // Why appeal was approved/rejected
    action?: {
      type: 'reverse' | 'reduce' | 'maintain'
      details: string
    }
  }
}
```

**Type 2: Action Appeal** (Appeal a Restriction/Ban):
```typescript
interface ActionAppeal {
  type: 'action-appeal'
  actionId: string
  userId: string
  actionType: 'warning' | 'restriction' | 'ban'
  reason: string // Why user thinks action was wrong
  evidence?: string[] // Additional evidence
  submittedAt: number
  status: 'pending' | 'under-review' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewedAt?: number
  decision?: {
    decision: 'approved' | 'rejected'
    reasoning: string
    action?: {
      type: 'reverse' | 'reduce' | 'maintain'
      details: string
    }
  }
}
```

#### **Appeal Process**

**Appeal Submission**:
```typescript
function submitAppeal(appeal: Appeal): AppealSubmission {
  // 1. Validate appeal (required fields, format)
  validateAppeal(appeal)
  
  // 2. Check if appealable (some actions may not be appealable)
  if (!isAppealable(appeal)) {
    return {
      status: 'not-appealable',
      message: 'This action cannot be appealed.'
    }
  }
  
  // 3. Check for duplicate appeals (same user, same action, recent)
  const isDuplicate = checkDuplicateAppeal(appeal)
  if (isDuplicate) {
    return {
      status: 'duplicate',
      message: 'You\'ve already appealed this. We\'re reviewing it.'
    }
  }
  
  // 4. Queue for human review (appeals always human-reviewed)
  queueAppealForReview(appeal, priority: 'high')
  
  // 5. Notify user (confirmation, timeline)
  notifyUser(appeal.userId, {
    status: 'submitted',
    appealId: appeal.id,
    estimatedReviewTime: '48-72 hours',
    message: 'Your appeal has been submitted. We\'ll review it within 48-72 hours.'
  })
  
  return {
    status: 'submitted',
    appealId: appeal.id,
    estimatedReviewTime: '48-72 hours'
  }
}
```

**Appeal Review**:
```typescript
function reviewAppeal(appeal: Appeal): AppealDecision {
  // Human moderator reviews appeal, original report, context
  const moderatorDecision = moderatorReviewsAppeal(appeal)
  
  // Apply decision
  if (moderatorDecision.decision === 'approved') {
    // Reverse or reduce action
    if (moderatorDecision.action.type === 'reverse') {
      reverseAction(appeal.actionId)
    } else if (moderatorDecision.action.type === 'reduce') {
      reduceAction(appeal.actionId, moderatorDecision.action.details)
    }
    
    // Update user status
    updateUserStatus(appeal.userId, {
      appealId: appeal.id,
      status: 'approved',
      message: 'Your appeal was approved. The action has been reversed/reduced.',
      action: moderatorDecision.action
    })
  } else {
    // Maintain action
    updateUserStatus(appeal.userId, {
      appealId: appeal.id,
      status: 'rejected',
      message: 'Your appeal was rejected. The original decision stands.',
      reasoning: moderatorDecision.reasoning
    })
  }
  
  return moderatorDecision
}
```

**Appeal Timelines**:
```typescript
interface AppealTimeline {
  submitted: number // When appeal was submitted
  underReview?: number // When appeal entered review (within 24 hours)
  reviewed?: number // When appeal was reviewed (within 48-72 hours)
  resolved?: number // When appeal was resolved
}

// Standard timeline: 48-72 hours for review
// Urgent appeals: 24 hours for review (critical actions)
```

**Appeal Rules**:
- ✅ **REQUIRED**: Appeals always human-reviewed (not automated)
- ✅ **REQUIRED**: Clear timelines (48-72 hours standard, 24 hours urgent)
- ✅ **REQUIRED**: Decisions explained (reasoning, transparent)
- ✅ **REQUIRED**: Actions reversible (if appeal approved)
- ❌ **FORBIDDEN**: Automated appeals (must be human-reviewed)
- ❌ **FORBIDDEN**: No appeal option (must be appealable)
- ❌ **FORBIDDEN**: No timelines (users must know when to expect decision)

---

### 5. Auditability and Abuse Prevention

#### **Audit Trail**

**Audit Log Structure**:
```typescript
interface AuditLog {
  id: string
  type: 'report' | 'appeal' | 'action' | 'review'
  userId: string
  action: string // What happened
  details: Record<string, any> // Additional details
  timestamp: number
  moderatorId?: string // If human-reviewed
  aiConfidence?: number // If AI-reviewed
}

// Example: Report submitted
const reportAuditLog: AuditLog = {
  id: 'audit-123',
  type: 'report',
  userId: 'reporter-456',
  action: 'report-submitted',
  details: {
    reportId: 'report-123',
    reportedUserId: 'reported-789',
    reportType: 'behavior',
    reason: 'harassment'
  },
  timestamp: Date.now()
}

// Example: Action taken
const actionAuditLog: AuditLog = {
  id: 'audit-124',
  type: 'action',
  userId: 'reported-789',
  action: 'warning-issued',
  details: {
    reportId: 'report-123',
    actionType: 'warning',
    reasoning: 'Multiple users reported behavior as unwelcoming'
  },
  timestamp: Date.now(),
  moderatorId: 'moderator-001'
}
```

**Audit Trail Rules**:
- ✅ **REQUIRED**: All actions logged (reports, appeals, actions, reviews)
- ✅ **REQUIRED**: Logs include user IDs, timestamps, details
- ✅ **REQUIRED**: Logs include moderator IDs (if human-reviewed)
- ✅ **REQUIRED**: Logs include AI confidence (if AI-reviewed)
- ✅ **REQUIRED**: Logs retained for compliance (90 days minimum)
- ❌ **FORBIDDEN**: Missing logs (all actions must be logged)
- ❌ **FORBIDDEN**: Tampering with logs (immutable audit trail)

#### **Abuse Prevention**

**False Report Detection**:
```typescript
function detectFalseReport(report: EnrichedReport, review: HumanReview): boolean {
  // If report was dismissed (no action taken), may be false
  if (review.moderatorDecision.decision === 'dismiss') {
    // Check reporter's history: High false report rate = likely false
    const reporterHistory = getReporterHistory(report.reporterId)
    const falseReportRate = reporterHistory.filter(r => r.decision === 'dismiss').length / 
                           reporterHistory.length
    if (falseReportRate > 0.5) {
      return true // More than 50% false reports = likely false reporter
    }
  }
  
  return false
}

function penalizeFalseReporter(reporterId: string): void {
  // Reduce reporter's social score (report accuracy component)
  reduceReportAccuracyComponent(reporterId, 0.1) // 10% reduction
  
  // Track false report in history
  addFalseReportToHistory(reporterId)
  
  // If false report rate is high, restrict reporting ability
  const falseReportRate = calculateFalseReportRate(reporterId)
  if (falseReportRate > 0.7) {
    restrictReportingAbility(reporterId, duration: 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}
```

**Abuse Prevention Rules**:
- ✅ **REQUIRED**: Detect false reports (dismissed reports, high false report rate)
- ✅ **REQUIRED**: Penalize false reporters (score reduction, history tracking)
- ✅ **REQUIRED**: Restrict reporting ability (if false report rate high)
- ✅ **REQUIRED**: Protect reported users (from false reports)
- ❌ **FORBIDDEN**: Ignoring false reports (must be detected and penalized)
- ❌ **FORBIDDEN**: Penalizing reported users (false reports penalize reporter, not reported)

---

## Output Requirements

### Reporting System Architecture

**Core Systems**:
1. **Report Intake** (validation, enrichment, routing, privacy protection)
2. **Review Workflow** (AI pre-review, human review, decisions)
3. **Status Updates** (reporter updates, reported user updates)
4. **Appeal Process** (submission, review, decisions, timelines)
5. **Audit Trail** (logging, retention, compliance)
6. **Abuse Prevention** (false report detection, penalties, restrictions)

### Report Intake Specification

**Report Types**:
- Content reports (text, images, media)
- Behavior reports (actions, patterns)
- Location reports (proximity, stalking)

**Intake Process**:
- Validation, enrichment, duplicate checking
- Privacy protection, routing, notification

### Review Workflow Specification

**Review Stages**:
- AI pre-review (screening, routing)
- Human review (moderator decision, action application)

**Review Rules**:
- AI pre-review for all reports
- Human review for all reports (not AI-only)
- Moderator reasoning (transparent, explainable)

### Status Updates Specification

**Update Types**:
- Reporter updates (confirmation, timeline, decision)
- Reported user updates (status, decision, reasoning, appeal)

**Update Rules**:
- User-friendly messages (not technical jargon)
- Transparent reasoning (why action was taken)
- Clear timelines (when to expect updates)

### Appeal Process Specification

**Appeal Types**:
- Report appeals (appeal report decision)
- Action appeals (appeal restriction/ban)

**Appeal Process**:
- Submission (validation, routing, notification)
- Review (human review, decisions, actions)
- Timelines (48-72 hours standard, 24 hours urgent)

### Auditability Specification

**Audit Trail**:
- All actions logged (reports, appeals, actions, reviews)
- Logs include user IDs, timestamps, details, moderator IDs
- Logs retained for compliance (90 days minimum)

### Abuse Prevention Specification

**False Report Detection**:
- Detect false reports (dismissed reports, high false report rate)
- Penalize false reporters (score reduction, history tracking)
- Restrict reporting ability (if false report rate high)

---

## Brand DNA Alignment

Every reporting and appeals decision must align with:

1. **Transparency** → Users see status, reasons, appeals, improvement paths
2. **Reporting never backfires** → Reporter privacy, feedback, false report penalties
3. **Appeals are real** → Human review, clear timelines, explained decisions
4. **No hidden suppression** → All restrictions visible, explainable, appealable

---

## Success Criteria

The reporting and appeals system is successful when:

- ✅ Reports are ingested correctly (validation, enrichment, routing)
- ✅ Review workflow is fair (AI pre-review, human review, transparent decisions)
- ✅ Status updates are timely (reporter and reported user informed)
- ✅ Appeals process is fair (human review, clear timelines, explained decisions)
- ✅ Audit trail is complete (all actions logged, retained, compliant)
- ✅ Abuse prevention works (false reports detected, penalized, restricted)
- ✅ Reporting never backfires (reporter privacy, feedback, false report penalties)
- ✅ Moderation is transparent (users see status, reasons, appeals, improvement paths)

---

**CRITICAL**: This system must feel fair, fast, and human. Reporting must never backfire. Appeals must be real. Transparency is mandatory. Violating these rules breaks trust and violates Brand DNA.

