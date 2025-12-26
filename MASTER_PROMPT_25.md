# MASTER PROMPT 25
## INTERVENTION UX & COPY SYSTEM

**SYSTEM MODE**: UX + LANGUAGE DESIGNER

Design the intervention UX and copy system for WYA!? that preserves trust even under stress.

---

## Input

- Safety Event Pipeline & Risk Engine (MASTER_PROMPT_24)
- Product Governance Framework
- The 4 Sacred Invariants

---

## Architectural Truths

### Why Intervention UX Matters

**A. Safety Feels Like Care, Not Punishment**:
- Friendly, non-accusatory tone
- Context-aware messaging
- Zero shame
- **Consequence**: Users don't turn adversarial

**B. Interventions Feel Optional Until They Aren't**:
- Soft prompts never block primary actions
- Soft prompts never accuse
- Soft prompts never interrupt flow harshly
- **Consequence**: Safety feels invisible when working, visible only when needed

**C. Education is Contextual, Never Generic**:
- Safety tips contextual to behavior
- Not popups on every action
- Not repeated boilerplate
- **Consequence**: Users don't tune out education

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

### Invariant #3: Zero Shame
- ✅ **REQUIRED**: Friendly, supportive tone
- ✅ **REQUIRED**: Focus on learning, not punishment
- ❌ **FORBIDDEN**: Accusatory language
- ❌ **FORBIDDEN**: Shaming or blaming
- **Rationale**: Preserves dignity, prevents adversarial behavior

---

## Define

### 1. Copy Patterns for Soft Prompts

#### **Soft Prompt Types**

**Type 1: Contextual Safety Tip** (Monitor Level):
```typescript
interface ContextualSafetyTip {
  context: 'first-message' | 'room-join' | 'connection-request' | 'location-share'
  copy: {
    headline: string // Friendly, helpful
    body: string // Contextual, educational
    action: string // Optional action (e.g., "Learn more")
    dismissible: true // Always dismissible
  }
}

// Example: First message to stranger
const firstMessageTip: ContextualSafetyTip = {
  context: 'first-message',
  copy: {
    headline: "💬 Starting a conversation?",
    body: "Remember to be respectful and kind. If someone makes you uncomfortable, you can always block or report them.",
    action: "Learn about staying safe",
    dismissible: true
  }
}

// Example: Room join
const roomJoinTip: ContextualSafetyTip = {
  context: 'room-join',
  copy: {
    headline: "👋 Welcome to the room!",
    body: "This is a shared space. Be respectful of others, and remember you can leave anytime if you feel uncomfortable.",
    action: "Room safety tips",
    dismissible: true
  }
}
```

**Type 2: Gentle Reminder** (Guide Level):
```typescript
interface GentleReminder {
  context: 'repeated-behavior' | 'rate-limiting' | 'pattern-detected'
  copy: {
    headline: string // Supportive, not accusatory
    body: string // Explains why, not what's wrong
    action: string // Optional action (e.g., "Got it")
    dismissible: true // Always dismissible
  }
}

// Example: Rate limiting
const rateLimitReminder: GentleReminder = {
  context: 'rate-limiting',
  copy: {
    headline: "⏱️ Taking a quick break?",
    body: "We've noticed a lot of activity from your account. This helps keep WYA!? safe for everyone. You can continue in a moment.",
    action: "Got it",
    dismissible: true
  }
}

// Example: Pattern detected
const patternReminder: GentleReminder = {
  context: 'pattern-detected',
  copy: {
    headline: "🤔 Something to consider",
    body: "We noticed some patterns that might make others uncomfortable. Want to chat about how to make interactions more positive?",
    action: "Learn more",
    dismissible: true
  }
}
```

**Soft Prompt Rules**:
- ✅ **REQUIRED**: Friendly, supportive tone (not accusatory)
- ✅ **REQUIRED**: Contextual to behavior (not generic)
- ✅ **REQUIRED**: Always dismissible (never blocking)
- ✅ **REQUIRED**: Optional action (learn more, got it)
- ❌ **FORBIDDEN**: Accusatory language ("You did X wrong")
- ❌ **FORBIDDEN**: Blocking primary actions (must be dismissible)
- ❌ **FORBIDDEN**: Generic boilerplate (must be contextual)

---

### 2. Copy Patterns for Warnings

#### **Warning Types**

**Type 1: Friendly Warning** (Intervene Level, Low Risk):
```typescript
interface FriendlyWarning {
  severity: 'low'
  copy: {
    headline: string // Clear, but friendly
    body: string // Explains issue, offers help
    action: string // Required action (e.g., "I understand")
    dismissible: false // Not dismissible (must acknowledge)
  }
}

// Example: Content warning
const contentWarning: FriendlyWarning = {
  severity: 'low',
  copy: {
    headline: "⚠️ Let's keep it positive",
    body: "Your recent content might make others uncomfortable. We're here to help you express yourself in ways that feel good for everyone. Want some tips?",
    action: "I understand",
    dismissible: false
  }
}

// Example: Behavior warning
const behaviorWarning: FriendlyWarning = {
  severity: 'low',
  copy: {
    headline: "🤝 Building better connections",
    body: "We noticed some interactions that might not feel welcoming. Everyone deserves to feel safe here. Want to chat about how to improve?",
    action: "I understand",
    dismissible: false
  }
}
```

**Type 2: Serious Warning** (Intervene Level, High Risk):
```typescript
interface SeriousWarning {
  severity: 'high'
  copy: {
    headline: string // Clear, direct
    body: string // Explains issue, consequences, help
    action: string // Required action (e.g., "I understand")
    dismissible: false // Not dismissible (must acknowledge)
  }
}

// Example: Harassment warning
const harassmentWarning: SeriousWarning = {
  severity: 'high',
  copy: {
    headline: "🚫 This needs to stop",
    body: "We've received reports about your behavior that violate our community guidelines. Harassment isn't tolerated here. If this continues, your account may be restricted. We're here to help you understand what went wrong.",
    action: "I understand",
    dismissible: false
  }
}

// Example: Safety violation warning
const safetyWarning: SeriousWarning = {
  severity: 'high',
  copy: {
    headline: "🛡️ Safety first",
    body: "Your recent actions may have made others feel unsafe. We take this seriously. Let's work together to make sure everyone feels comfortable here.",
    action: "I understand",
    dismissible: false
  }
}
```

**Warning Rules**:
- ✅ **REQUIRED**: Clear, direct language (not vague)
- ✅ **REQUIRED**: Explains issue and consequences (transparent)
- ✅ **REQUIRED**: Offers help and support (not just punishment)
- ✅ **REQUIRED**: Must acknowledge (not dismissible)
- ❌ **FORBIDDEN**: Accusatory language ("You are a bad person")
- ❌ **FORBIDDEN**: Vague warnings ("Something is wrong")
- ❌ **FORBIDDEN**: Dismissible warnings (must acknowledge)

---

### 3. Copy Patterns for Restrictions and Bans

#### **Restriction Types**

**Type 1: Temporary Restriction** (Intervene Level):
```typescript
interface TemporaryRestriction {
  type: 'rate-limit' | 'visibility-reduction' | 'feature-restriction'
  duration: number // Hours
  copy: {
    headline: string // Clear, supportive
    body: string // Explains restriction, duration, reason
    action: string // Optional action (e.g., "Appeal")
    dismissible: false // Not dismissible
  }
}

// Example: Rate limit restriction
const rateLimitRestriction: TemporaryRestriction = {
  type: 'rate-limit',
  duration: 24,
  copy: {
    headline: "⏸️ Temporary pause",
    body: "Your account is temporarily limited to help keep WYA!? safe. This restriction will lift in 24 hours. If you think this is a mistake, you can appeal.",
    action: "Appeal this restriction",
    dismissible: false
  }
}

// Example: Visibility reduction
const visibilityRestriction: TemporaryRestriction = {
  type: 'visibility-reduction',
  duration: 72,
  copy: {
    headline: "👁️ Reduced visibility",
    body: "Your profile will be less visible in discovery for the next 72 hours. This helps protect others while we work together to improve your experience. You can still use WYA!? normally.",
    action: "Learn more",
    dismissible: false
  }
}
```

**Type 2: Temporary Ban** (Protect Level):
```typescript
interface TemporaryBan {
  duration: number // Hours (24-72)
  reason: string // Specific reason
  copy: {
    headline: string // Clear, direct
    body: string // Explains ban, duration, reason, appeal
    action: string // Appeal action
    dismissible: false // Not dismissible
  }
}

// Example: 24-hour ban
const shortBan: TemporaryBan = {
  duration: 24,
  reason: "Repeated violations of community guidelines",
  copy: {
    headline: "🚫 Account temporarily suspended",
    body: "Your account is temporarily suspended for 24 hours due to repeated violations of our community guidelines. This gives everyone a chance to reset. You can appeal if you think this is a mistake.",
    action: "Appeal this suspension",
    dismissible: false
  }
}

// Example: 72-hour ban
const longBan: TemporaryBan = {
  duration: 72,
  reason: "Serious safety violations",
  copy: {
    headline: "🛡️ Account temporarily suspended",
    body: "Your account is temporarily suspended for 72 hours due to serious safety violations. We take safety seriously here. You can appeal if you think this is a mistake, or wait for the suspension to lift.",
    action: "Appeal this suspension",
    dismissible: false
  }
}
```

**Type 3: Permanent Ban** (Protect Level, Extreme Cases):
```typescript
interface PermanentBan {
  reason: string // Specific reason
  copy: {
    headline: string // Clear, final
    body: string // Explains ban, reason, appeal process
    action: string // Appeal action
    dismissible: false // Not dismissible
  }
}

// Example: Permanent ban
const permanentBan: PermanentBan = {
  reason: "Severe and repeated safety violations",
  copy: {
    headline: "🚫 Account permanently suspended",
    body: "Your account has been permanently suspended due to severe and repeated safety violations. This decision was made after careful review. You can appeal this decision if you believe it was made in error.",
    action: "Appeal this decision",
    dismissible: false
  }
}
```

**Restriction and Ban Rules**:
- ✅ **REQUIRED**: Clear explanation (reason, duration, consequences)
- ✅ **REQUIRED**: Appeal option (always available)
- ✅ **REQUIRED**: Supportive tone (not shaming)
- ✅ **REQUIRED**: Not dismissible (must acknowledge)
- ❌ **FORBIDDEN**: Vague reasons ("Violation of terms")
- ❌ **FORBIDDEN**: No appeal option (must be appealable)
- ❌ **FORBIDDEN**: Shaming language ("You are banned forever")

---

### 4. Timing Rules for Interventions

#### **Timing Guidelines**

**Soft Prompts** (Monitor/Guide Levels):
```typescript
interface SoftPromptTiming {
  frequency: 'once-per-session' | 'once-per-day' | 'contextual'
  delay: number // Milliseconds before showing
  duration: number // Milliseconds before auto-dismiss
  cooldown: number // Milliseconds before showing again
}

// Contextual safety tip: Once per context, 2s delay, 10s duration, 1h cooldown
const contextualTipTiming: SoftPromptTiming = {
  frequency: 'contextual',
  delay: 2000, // 2 seconds (don't interrupt immediately)
  duration: 10000, // 10 seconds (auto-dismiss if ignored)
  cooldown: 3600000 // 1 hour (don't show again for 1 hour)
}

// Gentle reminder: Once per day, 1s delay, 8s duration, 24h cooldown
const reminderTiming: SoftPromptTiming = {
  frequency: 'once-per-day',
  delay: 1000, // 1 second
  duration: 8000, // 8 seconds
  cooldown: 86400000 // 24 hours
}
```

**Warnings** (Intervene Level):
```typescript
interface WarningTiming {
  frequency: 'immediate' | 'once-per-violation'
  delay: number // Milliseconds before showing
  duration: 'until-acknowledged' // Must acknowledge
  cooldown: number // Milliseconds before showing again
}

// Friendly warning: Immediate, 0s delay, until acknowledged, 1h cooldown
const friendlyWarningTiming: WarningTiming = {
  frequency: 'immediate',
  delay: 0, // Immediate (must see)
  duration: 'until-acknowledged', // Must acknowledge
  cooldown: 3600000 // 1 hour (don't show again for 1 hour)
}

// Serious warning: Immediate, 0s delay, until acknowledged, no cooldown
const seriousWarningTiming: WarningTiming = {
  frequency: 'immediate',
  delay: 0, // Immediate (must see)
  duration: 'until-acknowledged', // Must acknowledge
  cooldown: 0 // No cooldown (can show again if violation continues)
}
```

**Restrictions and Bans** (Intervene/Protect Levels):
```typescript
interface RestrictionTiming {
  frequency: 'immediate'
  delay: number // Milliseconds before showing
  duration: 'until-acknowledged' // Must acknowledge
  cooldown: number // Milliseconds before showing again
}

// Temporary restriction: Immediate, 0s delay, until acknowledged, no cooldown
const restrictionTiming: RestrictionTiming = {
  frequency: 'immediate',
  delay: 0, // Immediate (must see)
  duration: 'until-acknowledged', // Must acknowledge
  cooldown: 0 // No cooldown (can show again if needed)
}

// Temporary ban: Immediate, 0s delay, until acknowledged, no cooldown
const banTiming: RestrictionTiming = {
  frequency: 'immediate',
  delay: 0, // Immediate (must see)
  duration: 'until-acknowledged', // Must acknowledge
  cooldown: 0 // No cooldown (can show again if needed)
}
```

**Timing Rules**:
- ✅ **REQUIRED**: Soft prompts don't interrupt immediately (2s delay)
- ✅ **REQUIRED**: Soft prompts auto-dismiss if ignored (10s duration)
- ✅ **REQUIRED**: Warnings must be acknowledged (until acknowledged)
- ✅ **REQUIRED**: Restrictions/bans must be acknowledged (until acknowledged)
- ✅ **REQUIRED**: Cooldowns prevent spam (don't show too frequently)
- ❌ **FORBIDDEN**: Interrupting immediately (must have delay for soft prompts)
- ❌ **FORBIDDEN**: Showing too frequently (must have cooldown)

---

### 5. Localization and Accessibility Considerations

#### **Localization**

**Language Support**:
```typescript
interface LocalizedCopy {
  language: string // ISO 639-1 code (e.g., 'en', 'es', 'fr')
  copy: {
    headline: string
    body: string
    action: string
  }
  culturalAdaptation: {
    tone: 'formal' | 'informal' | 'friendly' // Cultural tone preference
    emoji: boolean // Emoji usage (some cultures prefer less)
    directness: 'direct' | 'indirect' // Cultural communication style
  }
}

// Example: English (US) - Friendly, emoji, direct
const enUSCopy: LocalizedCopy = {
  language: 'en',
  copy: {
    headline: "💬 Starting a conversation?",
    body: "Remember to be respectful and kind.",
    action: "Learn more"
  },
  culturalAdaptation: {
    tone: 'friendly',
    emoji: true,
    directness: 'direct'
  }
}

// Example: Japanese - Formal, less emoji, indirect
const jaJPCopy: LocalizedCopy = {
  language: 'ja',
  copy: {
    headline: "会話を始めますか？",
    body: "礼儀正しく、親切に接することを心がけてください。",
    action: "詳細を見る"
  },
  culturalAdaptation: {
    tone: 'formal',
    emoji: false,
    directness: 'indirect'
  }
}
```

**Localization Rules**:
- ✅ **REQUIRED**: Support multiple languages (ISO 639-1)
- ✅ **REQUIRED**: Cultural adaptation (tone, emoji, directness)
- ✅ **REQUIRED**: Professional translation (not machine translation for safety)
- ❌ **FORBIDDEN**: Machine translation only (must be human-reviewed)
- ❌ **FORBIDDEN**: Ignoring cultural differences (must adapt)

#### **Accessibility**

**Accessibility Features**:
```typescript
interface AccessibleIntervention {
  copy: {
    headline: string
    body: string
    action: string
  }
  accessibility: {
    screenReader: string // Screen reader text
    highContrast: boolean // High contrast mode support
    largeText: boolean // Large text mode support
    reducedMotion: boolean // Reduced motion mode support
    keyboardNavigation: boolean // Keyboard navigation support
  }
}

// Example: Accessible intervention
const accessibleIntervention: AccessibleIntervention = {
  copy: {
    headline: "💬 Starting a conversation?",
    body: "Remember to be respectful and kind.",
    action: "Learn more"
  },
  accessibility: {
    screenReader: "Safety tip: Starting a conversation? Remember to be respectful and kind. Learn more about staying safe.",
    highContrast: true,
    largeText: true,
    reducedMotion: true, // No animations in reduced motion mode
    keyboardNavigation: true // Can dismiss with Escape key
  }
}
```

**Accessibility Rules**:
- ✅ **REQUIRED**: Screen reader support (ARIA labels, semantic HTML)
- ✅ **REQUIRED**: High contrast mode support (WCAG AA minimum)
- ✅ **REQUIRED**: Large text mode support (scalable text)
- ✅ **REQUIRED**: Reduced motion mode support (no animations)
- ✅ **REQUIRED**: Keyboard navigation support (Escape to dismiss, Tab to navigate)
- ❌ **FORBIDDEN**: Ignoring accessibility (must be accessible to all)

---

## Output Requirements

### Intervention UX System Architecture

**Core Systems**:
1. **Copy System** (soft prompts, warnings, restrictions, bans)
2. **Timing System** (delays, durations, cooldowns)
3. **Localization System** (language support, cultural adaptation)
4. **Accessibility System** (screen readers, contrast, motion, keyboard)

### Copy Patterns Specification

**Soft Prompts**:
- Contextual safety tips (friendly, helpful, dismissible)
- Gentle reminders (supportive, not accusatory, dismissible)

**Warnings**:
- Friendly warnings (clear, supportive, must acknowledge)
- Serious warnings (direct, transparent, must acknowledge)

**Restrictions and Bans**:
- Temporary restrictions (clear, supportive, appealable)
- Temporary bans (direct, transparent, appealable)
- Permanent bans (final, transparent, appealable)

### Timing Rules Specification

**Soft Prompts**:
- Delay: 2s (don't interrupt immediately)
- Duration: 10s (auto-dismiss if ignored)
- Cooldown: 1h-24h (don't show too frequently)

**Warnings**:
- Delay: 0s (immediate, must see)
- Duration: Until acknowledged (must acknowledge)
- Cooldown: 1h or none (depending on severity)

**Restrictions and Bans**:
- Delay: 0s (immediate, must see)
- Duration: Until acknowledged (must acknowledge)
- Cooldown: None (can show again if needed)

### Localization Specification

**Language Support**:
- Multiple languages (ISO 639-1)
- Cultural adaptation (tone, emoji, directness)
- Professional translation (human-reviewed)

### Accessibility Specification

**Accessibility Features**:
- Screen reader support (ARIA labels, semantic HTML)
- High contrast mode (WCAG AA minimum)
- Large text mode (scalable text)
- Reduced motion mode (no animations)
- Keyboard navigation (Escape to dismiss, Tab to navigate)

---

## Brand DNA Alignment

Every intervention decision must align with:

1. **Safety without killing fun** → Interventions feel optional until they aren't
2. **Zero shame** → Friendly, supportive tone, focus on learning
3. **Contextual education** → Not generic, not repeated boilerplate
4. **Transparency** → Clear explanations, reasons, appeals

---

## Success Criteria

The intervention UX and copy system is successful when:

- ✅ Copy is friendly and non-accusatory (preserves trust)
- ✅ Copy is contextual (not generic, not repeated boilerplate)
- ✅ Zero shame (friendly tone, focus on learning)
- ✅ Timing is appropriate (delays, durations, cooldowns)
- ✅ Localization is supported (multiple languages, cultural adaptation)
- ✅ Accessibility is supported (screen readers, contrast, motion, keyboard)
- ✅ Interventions feel optional until they aren't (soft prompts dismissible, warnings must acknowledge)
- ✅ Education is contextual (not popups on every action)

---

**CRITICAL**: This system must preserve trust even under stress. Copy must feel like care, not punishment. Violating these rules breaks trust and violates Brand DNA.

