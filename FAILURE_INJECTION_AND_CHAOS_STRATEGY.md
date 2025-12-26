# WYA!? — Failure Injection & Chaos Strategy

## Core Philosophy

**Failure is not an exception. Failure is normal.**

If you don't practice failure, failure will teach you in public.

---

## What We Assume Will Fail

**Always Assume**:
- A service is down
- A cache is stale
- A WebSocket drops
- A region disappears
- A deploy partially rolls back
- A dependency lies

**Design assumes this from day one.**

---

## Failure Domains (Explicit)

WYA!? is divided into failure domains:

1. **Identity** (Auth Service)
2. **Presence** (Presence Service)
3. **Messaging** (Messaging Service)
4. **Discovery** (Discovery Engine)
5. **Media** (Video/Audio)
6. **Customization** (Content Service)
7. **Safety** (Safety Engine)

**Each domain must fail independently.**

---

## Degradation Rules (Golden Law)

**When something fails**:

1. ✅ **Never break core chat** (messaging is sacred)
2. ✅ **Never expose unsafe states** (safety is non-negotiable)
3. ✅ **Always show something** (never show nothing)
4. ✅ **Never lie to the user** (be honest, be brief)

---

## Degradation Examples

### Example 1: Discovery Failure

**If discovery service fails**:

```typescript
function handleDiscoveryFailure(userId: string): DiscoveryFallback {
  // Option 1: Show cached results
  const cached = getCachedDiscoveryResults(userId)
  if (cached && Date.now() - cached.generatedAt < 300000) { // 5 minutes
    return {
      results: cached.rankedUsers,
      source: 'cached',
      message: 'Showing recent nearby people'
    }
  }
  
  // Option 2: Show "Nearby now" fallback
  const nearby = getNearbyUsersFromPresence(userId)
  if (nearby.length > 0) {
    return {
      results: nearby,
      source: 'presence-fallback',
      message: 'Showing people nearby right now'
    }
  }
  
  // Option 3: Show friends only
  const friends = getFriends(userId)
  return {
    results: friends,
    source: 'friends-fallback',
    message: 'Showing your friends'
  }
}
```

**Rules**:
- ✅ **REQUIRED**: Never show nothing (always show something)
- ✅ **REQUIRED**: Explain softly ("Showing recent nearby people")
- ✅ **REQUIRED**: Graceful degradation (cached → nearby → friends)
- ❌ **FORBIDDEN**: Infinite loading (must degrade)
- ❌ **FORBIDDEN**: Error messages (must show fallback)

---

### Example 2: Presence Failure

**If presence store fails**:

```typescript
function handlePresenceFailure(userId: string): PresenceFallback {
  // Users default to "offline"
  const defaultPresence = {
    status: 'offline',
    activity: 'idle',
    locationTier: null,
    roomId: null
  }
  
  // Typing indicators disappear
  // Chat still works
  
  return {
    presence: defaultPresence,
    typingIndicators: false,
    chatEnabled: true,
    message: null // No message, presence is cosmetic
  }
}
```

**Rules**:
- ✅ **REQUIRED**: Users default to "offline" (safe default)
- ✅ **REQUIRED**: Typing indicators disappear (don't show stale)
- ✅ **REQUIRED**: Chat still works (messaging is sacred)
- ✅ **REQUIRED**: No error message (presence is cosmetic)
- ❌ **FORBIDDEN**: Breaking chat (messaging must work)

---

### Example 3: Customization Failure

**If a room asset fails to load**:

```typescript
function handleRoomAssetFailure(roomId: string, assetType: string): RoomFallback {
  // Render skeleton room
  const skeletonRoom = {
    layout: getDefaultLayout(),
    modules: getCoreModules(roomId), // Core modules only
    theme: getDefaultTheme(),
    effects: [] // Skip heavy effects
  }
  
  return {
    room: skeletonRoom,
    degraded: true,
    message: 'Room loading simplified mode',
    retryable: true
  }
}
```

**Rules**:
- ✅ **REQUIRED**: Render skeleton room (never crash)
- ✅ **REQUIRED**: Load core identity (essential content)
- ✅ **REQUIRED**: Skip heavy effects (graceful degradation)
- ✅ **REQUIRED**: Show subtle notice ("Room loading simplified mode")
- ❌ **FORBIDDEN**: Room crashes (must degrade gracefully)

---

## Chaos Injection (Intentional Failure)

**You deliberately break things in controlled ways.**

### Automated Chaos Tests

**Weekly or Continuous**:

```typescript
interface ChaosTest {
  name: string
  target: 'websocket' | 'redis' | 'kafka' | 'discovery' | 'media'
  action: 'kill' | 'delay' | 'corrupt' | 'spike'
  parameters: Record<string, any>
  environment: 'staging' | 'production'
  percentage?: number // For production (e.g., 1% of requests)
}

const chaosTests: ChaosTest[] = [
  {
    name: 'Kill WebSocket connections',
    target: 'websocket',
    action: 'kill',
    parameters: { percentage: 100 },
    environment: 'staging'
  },
  {
    name: 'Drop Redis',
    target: 'redis',
    action: 'kill',
    parameters: { duration: 30 }, // 30 seconds
    environment: 'staging'
  },
  {
    name: 'Delay Kafka consumers',
    target: 'kafka',
    action: 'delay',
    parameters: { delay: 5000 }, // 5 seconds
    environment: 'staging'
  },
  {
    name: 'Corrupt cached discovery results',
    target: 'discovery',
    action: 'corrupt',
    parameters: { percentage: 10 },
    environment: 'staging'
  },
  {
    name: 'Introduce latency spikes',
    target: 'media',
    action: 'spike',
    parameters: { latency: 500, percentage: 5 }, // 500ms, 5% of requests
    environment: 'production'
  }
]
```

**Rules**:
- ✅ **REQUIRED**: All chaos tests in staging (safe environment)
- ✅ **REQUIRED**: Some chaos tests in production at low percentage (real-world testing)
- ✅ **REQUIRED**: Automated (weekly or continuous)
- ❌ **FORBIDDEN**: Chaos tests that break core chat (messaging is sacred)
- ❌ **FORBIDDEN**: Chaos tests that expose unsafe states (safety is non-negotiable)

---

### Chaos Flags (Runtime)

```typescript
// Runtime toggles (without deploys)
interface ChaosFlags {
  CHAOS_DROP_WEBSOCKET: number // Percentage (e.g., 5%)
  CHAOS_SLOW_DISCOVERY: number // Milliseconds (e.g., 300ms)
  CHAOS_FAIL_MEDIA_UPLOAD: number // Percentage (e.g., 1%)
  CHAOS_CORRUPT_CACHE: number // Percentage (e.g., 0.1%)
  CHAOS_DELAY_KAFKA: number // Milliseconds (e.g., 1000ms)
}

const chaosFlags: ChaosFlags = {
  CHAOS_DROP_WEBSOCKET: 0, // Disabled by default
  CHAOS_SLOW_DISCOVERY: 0,
  CHAOS_FAIL_MEDIA_UPLOAD: 0,
  CHAOS_CORRUPT_CACHE: 0,
  CHAOS_DELAY_KAFKA: 0
}
```

**Rules**:
- ✅ **REQUIRED**: Toggled without deploys (runtime configuration)
- ✅ **REQUIRED**: Percentage-based (for production, low percentage)
- ✅ **REQUIRED**: If engineers fear these flags, the system isn't ready
- ❌ **FORBIDDEN**: Chaos flags that break core chat (messaging is sacred)

---

## Client-Side Resilience

### Clients Must

1. **Retry idempotently** (same request multiple times = same result)
2. **Reconnect automatically** (WebSocket, SSE fallback)
3. **Fall back visually** (degraded UI, not error)
4. **Preserve user input locally** (typed messages never lost)

### Retry Strategy

```typescript
function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let attempt = 0
  
  while (attempt < maxRetries) {
    try {
      return await fn()
    } catch (error) {
      attempt++
      if (attempt >= maxRetries) {
        throw error
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1)
      await sleep(delay)
    }
  }
  
  throw new Error('Max retries exceeded')
}
```

### Reconnection Strategy

```typescript
function reconnectWebSocket(userId: string): void {
  const ws = new WebSocket(WS_URL)
  
  ws.onopen = () => {
    // Reconnect successful
    subscribeToPresence(userId)
    subscribeToMessaging(userId)
  }
  
  ws.onerror = () => {
    // Fallback to SSE
    fallbackToSSE(userId)
  }
  
  ws.onclose = () => {
    // Auto-reconnect with exponential backoff
    setTimeout(() => reconnectWebSocket(userId), getReconnectDelay())
  }
}
```

### Input Preservation

```typescript
// Preserve typed messages locally
function preserveUserInput(message: string): void {
  localStorage.setItem('pending_message', message)
}

function restoreUserInput(): string | null {
  const message = localStorage.getItem('pending_message')
  if (message) {
    localStorage.removeItem('pending_message')
    return message
  }
  return null
}
```

**Rules**:
- ✅ **REQUIRED**: Retry idempotently (same request = same result)
- ✅ **REQUIRED**: Reconnect automatically (WebSocket → SSE fallback)
- ✅ **REQUIRED**: Fall back visually (degraded UI, not error)
- ✅ **REQUIRED**: Preserve user input locally (typed messages never lost)
- ❌ **FORBIDDEN**: Losing user input (must preserve locally)

---

## Replay & Recovery

### Because Everything is Event-Based

**You Can**:
- Replay state (rebuild from events)
- Rebuild projections (from authoritative store)
- Rehydrate presence (from events)
- Reconstruct conversations (from message events)

### Replay Strategy

```typescript
function replayState(userId: string, fromTimestamp: number): void {
  // Replay events from timestamp
  const events = getEventsSince(userId, fromTimestamp)
  
  for (const event of events) {
    // Replay event (idempotent)
    processEvent(event)
  }
}

function rebuildProjections(userId: string): void {
  // Rebuild graph projection from authoritative edges
  const edges = getAuthoritativeEdges(userId)
  const projection = buildProjection(edges)
  updateProjection(userId, projection)
}

function rehydratePresence(userId: string): void {
  // Rehydrate presence from recent events
  const events = getPresenceEventsSince(userId, Date.now() - 60000) // Last minute
  const presence = reconstructPresence(events)
  updatePresence(userId, presence)
}
```

**Rules**:
- ✅ **REQUIRED**: Event replay is a feature (not a failure)
- ✅ **REQUIRED**: Rebuild projections from authoritative store
- ✅ **REQUIRED**: Rehydrate presence from events
- ✅ **REQUIRED**: Reconstruct conversations from message events

---

## Observability Under Chaos

### Every Failure is Logged With

- **Domain** (which service failed)
- **User impact** (how many users affected)
- **Degradation path used** (which fallback was used)
- **Time to recovery** (how long until recovery)

### Metrics That Matter

```typescript
interface FailureMetrics {
  domain: string
  failureType: string
  userImpact: number // Number of users affected
  degradationPath: string // Which fallback was used
  timeToSafeState: number // Milliseconds to safe state
  timeToInteraction: number // Milliseconds to user interaction
  messagesLost: number // Should be zero
  userVisibleErrors: number // Should be rare
  recoveryTime: number // Milliseconds to full recovery
}
```

### Metrics Collection

```typescript
function logFailure(metrics: FailureMetrics): void {
  // Log failure metrics
  logMetrics({
    domain: metrics.domain,
    failureType: metrics.failureType,
    userImpact: metrics.userImpact,
    degradationPath: metrics.degradationPath,
    timeToSafeState: metrics.timeToSafeState,
    timeToInteraction: metrics.timeToInteraction,
    messagesLost: metrics.messagesLost,
    userVisibleErrors: metrics.userVisibleErrors,
    recoveryTime: metrics.recoveryTime,
    timestamp: Date.now()
  })
  
  // Alert if critical
  if (metrics.messagesLost > 0 || metrics.userVisibleErrors > 100) {
    alertTeam(metrics)
  }
}
```

**Rules**:
- ✅ **REQUIRED**: Log all failures (domain, impact, degradation path, recovery time)
- ✅ **REQUIRED**: Track metrics (time-to-safe-state, time-to-interaction, messages lost, errors)
- ✅ **REQUIRED**: Alert on critical failures (messages lost > 0, errors > threshold)
- ❌ **FORBIDDEN**: Silent failures (must be logged)

---

## The Social Contract with Users

### When Things Break

- **Be honest** (tell the truth)
- **Be calm** (don't panic)
- **Be brief** (no essay)
- **Never blame the user** (it's not their fault)

### Copy Example

```
"Some things are loading lighter right now. Chats are safe."
```

**That's it. No apology essay.**

### Error Message Rules

```typescript
function getUserFacingMessage(failure: Failure): string {
  // Be honest, be calm, be brief
  const messages = {
    'discovery': 'Showing recent nearby people',
    'presence': null, // No message, presence is cosmetic
    'customization': 'Room loading simplified mode',
    'media': 'Media loading slower than usual',
    'messaging': 'Messages may be delayed' // Only if critical
  }
  
  return messages[failure.domain] || null
}
```

**Rules**:
- ✅ **REQUIRED**: Be honest (tell the truth)
- ✅ **REQUIRED**: Be calm (don't panic)
- ✅ **REQUIRED**: Be brief (no essay)
- ✅ **REQUIRED**: Never blame the user (it's not their fault)
- ❌ **FORBIDDEN**: Apology essays (be brief)
- ❌ **FORBIDDEN**: Blaming the user (it's not their fault)

---

## Failure Domain Isolation

### Each Domain Must Fail Independently

```typescript
// Identity failure doesn't break messaging
function handleIdentityFailure(): void {
  // Fallback to cached identity
  // Messaging still works
}

// Presence failure doesn't break messaging
function handlePresenceFailure(): void {
  // Default to offline
  // Messaging still works
}

// Discovery failure doesn't break messaging
function handleDiscoveryFailure(): void {
  // Show fallback results
  // Messaging still works
}

// Customization failure doesn't break messaging
function handleCustomizationFailure(): void {
  // Render skeleton room
  // Messaging still works
}

// Media failure doesn't break messaging
function handleMediaFailure(): void {
  // Skip media, show text
  // Messaging still works
}

// Safety failure doesn't break messaging (but may restrict)
function handleSafetyFailure(): void {
  // Default to safe state
  // Messaging still works (but may be restricted)
}
```

**Rules**:
- ✅ **REQUIRED**: Each domain fails independently (no cascade)
- ✅ **REQUIRED**: Messaging never breaks (messaging is sacred)
- ✅ **REQUIRED**: Safety never breaks (safety is non-negotiable)
- ❌ **FORBIDDEN**: Cascading failures (domains must be isolated)

---

## Failure Testing Strategy

### Test Failure Scenarios

```typescript
interface FailureTest {
  name: string
  scenario: () => Promise<void>
  expectedDegradation: string
  expectedRecovery: number // Milliseconds
}

const failureTests: FailureTest[] = [
  {
    name: 'WebSocket disconnection',
    scenario: async () => {
      // Kill WebSocket connection
      killWebSocket()
      // Verify: Falls back to SSE, chat still works
    },
    expectedDegradation: 'SSE fallback',
    expectedRecovery: 5000 // 5 seconds
  },
  {
    name: 'Redis failure',
    scenario: async () => {
      // Kill Redis
      killRedis()
      // Verify: Presence defaults to offline, chat still works
    },
    expectedDegradation: 'Presence offline',
    expectedRecovery: 30000 // 30 seconds
  },
  {
    name: 'Discovery service failure',
    scenario: async () => {
      // Kill discovery service
      killDiscovery()
      // Verify: Shows cached results or fallback, chat still works
    },
    expectedDegradation: 'Cached results',
    expectedRecovery: 60000 // 60 seconds
  }
]
```

**Rules**:
- ✅ **REQUIRED**: Test all failure scenarios (automated tests)
- ✅ **REQUIRED**: Verify degradation paths (expected fallbacks)
- ✅ **REQUIRED**: Verify recovery times (expected recovery)
- ❌ **FORBIDDEN**: Skipping failure tests (must test all scenarios)

---

## Success Criteria

The failure injection and chaos strategy is successful when:

- ✅ Failure is assumed (design assumes failure from day one)
- ✅ Failure domains are isolated (each domain fails independently)
- ✅ Degradation rules are followed (never break core chat, never expose unsafe states, always show something, never lie)
- ✅ Chaos injection works (automated tests, runtime flags)
- ✅ Client-side resilience works (retry, reconnect, fallback, preserve input)
- ✅ Replay & recovery works (event replay, projection rebuild, presence rehydration)
- ✅ Observability works (failure logging, metrics, alerts)
- ✅ Social contract is maintained (honest, calm, brief, never blame user)

---

## Why This Matters

**This Combination**:
- **Permission lattice** prevents power abuse
- **Feature gating** prevents pay-to-win rot
- **Chaos strategy** prevents catastrophic failure
- **Degradation** preserves vibe and trust

**Assessment**: Most platforms optimize for growth first. WYA!? is optimizing for survivability and culture.

**That's why WYA!? can become a place, not an app.**

---

**CRITICAL**: This system prevents catastrophic failure and preserves trust. Failure is normal, not exceptional. If you don't practice failure, failure will teach you in public.

