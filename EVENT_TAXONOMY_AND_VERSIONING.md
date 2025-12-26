# WYA!? — Event Taxonomy & Versioning Rules

## Core Principle

**This is the nervous system. If this is sloppy, everything rots.**

---

## Event Envelope (Universal)

Every event must look like this:

```typescript
interface EventEnvelope {
  event_id: string // UUID
  event_type: string // e.g., "user.created", "presence.joined"
  event_version: number // Integer, starts at 1
  source: string // Service name (e.g., "auth-service", "presence-service")
  occurred_at: number // Timestamp (Unix epoch milliseconds)
  actor_id: string // User ID or "system"
  payload: Record<string, any> // Event-specific payload
}
```

**No exceptions.**

---

## Event Categories (Strict)

### Identity Events

```typescript
// User lifecycle
'user.created'
'user.verified'
'user.age_layer_changed'
'user.suspended'
'user.unsuspended'
'user.banned'
'user.deleted'

// Permission changes
'user.permission_granted'
'user.permission_revoked'
```

### Presence Events

```typescript
// Presence lifecycle
'presence.joined'
'presence.left'
'presence.room_entered'
'presence.room_exited'
'presence.moved_tier'

// Activity changes
'presence.activity_changed'
'presence.typing_started'
'presence.typing_stopped'
'presence.speaking_started'
'presence.speaking_stopped'
```

### Social Graph Events

```typescript
// Relationship changes
'graph.friend_added'
'graph.friend_removed'
'graph.follow_added'
'graph.follow_removed'
'graph.blocked'
'graph.unblocked'

// Trust changes
'graph.trust_updated'
'graph.report_submitted'
```

### Content Events

```typescript
// Room lifecycle
'room.created'
'room.updated'
'room.deleted'

// Version management
'room.version_published'
'room.version_rolled_back'

// Visibility changes
'room.visibility_changed'
```

### Messaging Events

```typescript
// Message lifecycle
'message.sent'
'message.reacted'
'message.edited'
'message.deleted'
'message.reported'

// Conversation lifecycle
'conversation.created'
'conversation.archived'
```

### Discovery Events

```typescript
// Discovery requests
'discovery.requested'
'discovery.served'

// Boost events
'discovery.boosted'
'discovery.boost_expired'
```

### Safety Events

```typescript
// Safety signals
'safety.flagged'
'safety.signal_processed'

// Interventions
'safety.soft_intervention'
'safety.warning_issued'
'safety.restriction_applied'
'safety.ban_applied'

// Resolution
'safety.cleared'
'safety.appeal_submitted'
'safety.appeal_resolved'
```

---

## Versioning Rules (Non-Negotiable)

### Rule 1: Events Never Change

**If the meaning changes, new event type or new version.**

**Bad**:
```typescript
// message.sent meaning changes silently
{
  event_type: 'message.sent',
  payload: { text: 'Hello' } // v1: just text
  // Later: payload: { text: 'Hello', mentions: [] } // v2: added mentions, but same type
}
```

**Correct**:
```typescript
// Option 1: New version
{
  event_type: 'message.sent',
  event_version: 2,
  payload: { text: 'Hello', mentions: [] }
}

// Option 2: New event type
{
  event_type: 'message.sent.rich',
  event_version: 1,
  payload: { blocks: [], metadata: {} }
}
```

---

### Rule 2: Consumers Must Support N-1

**Every consumer must handle**:
- Current version
- Previous version (N-1)

**No forced deploy chains.**

**Example**:
```typescript
function handleMessageSent(event: EventEnvelope) {
  if (event.event_version === 1) {
    // Handle v1 payload
    const text = event.payload.text
    processMessage(text)
  } else if (event.event_version === 2) {
    // Handle v2 payload (backward compatible)
    const text = event.payload.text
    const mentions = event.payload.mentions || [] // Optional field
    processMessage(text, mentions)
  } else {
    // Unknown version, log and skip
    logUnknownVersion(event)
  }
}
```

---

### Rule 3: Payloads Only Expand

**You May**:
- ✅ Add fields
- ✅ Add optional metadata
- ✅ Add new event types

**You May Not**:
- ❌ Remove fields
- ❌ Change meaning of existing fields
- ❌ Repurpose keys

**Example - Valid Expansion**:
```typescript
// v1
{
  event_type: 'message.sent',
  event_version: 1,
  payload: {
    text: 'Hello'
  }
}

// v2 (valid: added optional field)
{
  event_type: 'message.sent',
  event_version: 2,
  payload: {
    text: 'Hello',
    mentions: [] // New optional field
  }
}

// v3 (valid: added more optional fields)
{
  event_type: 'message.sent',
  event_version: 3,
  payload: {
    text: 'Hello',
    mentions: [],
    metadata: { // New optional field
      client: 'web',
      version: '1.0.0'
    }
  }
}
```

**Example - Invalid Change**:
```typescript
// v1
{
  event_type: 'message.sent',
  event_version: 1,
  payload: {
    text: 'Hello'
  }
}

// v2 (invalid: changed meaning of 'text')
{
  event_type: 'message.sent',
  event_version: 2,
  payload: {
    text: { blocks: [] } // Changed from string to object - INVALID
  }
}
```

---

## Example Versioned Event

### v1

```typescript
{
  event_id: 'evt-123',
  event_type: 'message.sent',
  event_version: 1,
  source: 'messaging-service',
  occurred_at: 1609459200000,
  actor_id: 'user-456',
  payload: {
    text: 'Hello, world!'
  }
}
```

### v2

```typescript
{
  event_id: 'evt-124',
  event_type: 'message.sent',
  event_version: 2,
  source: 'messaging-service',
  occurred_at: 1609459201000,
  actor_id: 'user-456',
  payload: {
    text: 'Hello, world!',
    mentions: ['user-789'] // Added optional field
  }
}
```

### v3 (New Event Type)

```typescript
{
  event_id: 'evt-125',
  event_type: 'message.sent.rich',
  event_version: 1,
  source: 'messaging-service',
  occurred_at: 1609459202000,
  actor_id: 'user-456',
  payload: {
    blocks: [
      { type: 'text', content: 'Hello, world!' },
      { type: 'mention', user_id: 'user-789' }
    ],
    metadata: {
      format: 'rich',
      version: '2.0'
    }
  }
}
```

---

## Event Ordering Guarantees

### Ordering Guaranteed Per Aggregate

**No global ordering assumption.**

**Aggregates**:
- **User**: All events for a specific user_id
- **Room**: All events for a specific room_id
- **Conversation**: All events for a specific conversation_id

**Example**:
```typescript
// Events for user-123 are ordered
presence.joined (user-123) → sequence 1
presence.room_entered (user-123) → sequence 2
presence.left (user-123) → sequence 3

// But events for user-456 may interleave
presence.joined (user-123) → sequence 1
presence.joined (user-456) → sequence 1 (different aggregate)
presence.room_entered (user-123) → sequence 2
```

### Clients Reconcile Using

- **Sequence numbers** (per aggregate)
- **Timestamps** (causal ordering)
- **Causal chains** (event dependencies)

**Example Reconciliation**:
```typescript
function reconcileMessages(events: EventEnvelope[]): Message[] {
  // Sort by sequence number (per conversation)
  const sorted = events.sort((a, b) => {
    if (a.payload.conversation_id !== b.payload.conversation_id) {
      return 0 // Different aggregates, order doesn't matter
    }
    return a.payload.sequence_number - b.payload.sequence_number
  })
  
  // Reconstruct messages
  return sorted.map(event => reconstructMessage(event))
}
```

---

## Idempotency Rules

### Every Event Consumer Must Be

- **Idempotent** (same event processed twice = same result)
- **Replay-safe** (can replay events without side effects)
- **Tolerant of duplication** (duplicate events don't break)

**Example - Idempotent Handler**:
```typescript
function handleFriendAdded(event: EventEnvelope): void {
  const { from_user, to_user } = event.payload
  
  // Check if edge already exists (idempotent)
  const existing = db.query(
    'SELECT * FROM edges WHERE from_user = ? AND to_user = ? AND type = ?',
    [from_user, to_user, 'friend']
  )
  
  if (existing.length > 0) {
    // Already processed, skip (idempotent)
    return
  }
  
  // Create edge (idempotent: same input = same output)
  db.insert('edges', {
    from_user,
    to_user,
    type: 'friend',
    created_at: event.occurred_at
  })
  
  // Update projection (idempotent: can run multiple times)
  updateGraphProjection(from_user, to_user, 'friend', 'add')
}
```

**Event Replay is a Feature, Not a Failure**:
- Consumers can replay events to recover from failures
- Consumers can replay events to rebuild state
- Consumers can replay events to migrate to new versions

---

## Dead-Letter Policy

### If an Event Fails Processing

**Flow**:
1. **Retry with backoff** (exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s)
2. **Move to dead-letter queue** (after max retries)
3. **Never block the stream** (broken consumers don't stall the system)

**Dead-Letter Queue Schema**:
```typescript
interface DeadLetterEvent {
  event_id: string
  original_event: EventEnvelope
  failure_reason: string
  failure_count: number
  last_attempt: number
  next_retry: number
  consumer: string // Which consumer failed
}
```

**Dead-Letter Processing**:
```typescript
function processDeadLetter(event: DeadLetterEvent): void {
  // Log for investigation
  logDeadLetter(event)
  
  // Notify team (if critical)
  if (isCriticalEvent(event.original_event)) {
    notifyTeam(event)
  }
  
  // Attempt manual reprocessing (if possible)
  if (event.failure_count < MAX_MANUAL_RETRIES) {
    scheduleManualRetry(event)
  } else {
    // Archive for investigation
    archiveDeadLetter(event)
  }
}
```

**Dead-Letter Rules**:
- ✅ **REQUIRED**: Retry with exponential backoff
- ✅ **REQUIRED**: Move to dead-letter queue after max retries
- ✅ **REQUIRED**: Never block the stream
- ✅ **REQUIRED**: Log and notify for investigation
- ❌ **FORBIDDEN**: Blocking the stream (broken consumers don't stall system)
- ❌ **FORBIDDEN**: Silently dropping events (must log dead letters)

---

## Event Schema Validation

### Schema Registry

**Every event type must have a schema**:

```typescript
interface EventSchema {
  event_type: string
  event_version: number
  payload_schema: JSONSchema
  required_fields: string[]
  optional_fields: string[]
  examples: EventEnvelope[]
}

// Example schema
const messageSentV1Schema: EventSchema = {
  event_type: 'message.sent',
  event_version: 1,
  payload_schema: {
    type: 'object',
    properties: {
      text: { type: 'string', minLength: 1, maxLength: 10000 },
      conversation_id: { type: 'string', format: 'uuid' }
    },
    required: ['text', 'conversation_id']
  },
  required_fields: ['text', 'conversation_id'],
  optional_fields: [],
  examples: [
    {
      event_id: 'evt-example',
      event_type: 'message.sent',
      event_version: 1,
      source: 'messaging-service',
      occurred_at: 1609459200000,
      actor_id: 'user-123',
      payload: {
        text: 'Hello, world!',
        conversation_id: 'conv-456'
      }
    }
  ]
}
```

### Validation Rules

- ✅ **REQUIRED**: Validate event envelope (event_id, event_type, event_version, source, occurred_at, actor_id)
- ✅ **REQUIRED**: Validate payload against schema (JSONSchema validation)
- ✅ **REQUIRED**: Reject invalid events (don't process, log error)
- ❌ **FORBIDDEN**: Processing invalid events (must validate first)

---

## Event Versioning Strategy

### Versioning Approach

**Option 1: In-Place Versioning** (Same Event Type, New Version)
- Use when: Payload expands, backward compatible
- Example: `message.sent` v1 → v2 → v3

**Option 2: New Event Type** (New Event Type, New Version)
- Use when: Meaning changes significantly, not backward compatible
- Example: `message.sent` → `message.sent.rich`

**Decision Matrix**:
- **Backward compatible expansion** → In-place versioning
- **Breaking change** → New event type
- **Uncertain** → New event type (safer)

---

## Event Migration Strategy

### Migrating Consumers

**When a new event version is introduced**:

1. **Deploy consumer supporting N-1** (handles current and previous version)
2. **Deploy event producer** (emits new version)
3. **Monitor** (ensure no dead letters)
4. **Deprecate old version** (after all consumers updated)

**Example Migration**:
```typescript
// Phase 1: Consumer supports both v1 and v2
function handleMessageSent(event: EventEnvelope) {
  if (event.event_version === 1) {
    handleV1(event)
  } else if (event.event_version === 2) {
    handleV2(event)
  }
}

// Phase 2: Producer emits v2
emitEvent({
  event_type: 'message.sent',
  event_version: 2, // New version
  payload: { text: 'Hello', mentions: [] }
})

// Phase 3: After all consumers updated, deprecate v1
// (Still handle v1 for backward compatibility, but log deprecation warning)
```

---

## Event Backward Compatibility

### Backward Compatibility Rules

- ✅ **REQUIRED**: Consumers support N-1 (current and previous version)
- ✅ **REQUIRED**: Payloads only expand (never remove fields)
- ✅ **REQUIRED**: Optional fields are truly optional (defaults provided)
- ❌ **FORBIDDEN**: Breaking changes in same event type (use new event type)

### Backward Compatibility Examples

**Valid (Backward Compatible)**:
```typescript
// v1 consumer can handle v2 event
function handleV1(event: EventEnvelope) {
  const text = event.payload.text // v1 field
  // v2 adds 'mentions', but v1 consumer ignores it (backward compatible)
  processMessage(text)
}
```

**Invalid (Breaking Change)**:
```typescript
// v1 consumer cannot handle v2 event (breaking change)
function handleV1(event: EventEnvelope) {
  const text = event.payload.text // v1 field
  // v2 changes 'text' to 'content', breaking v1 consumer
  processMessage(text) // ERROR: 'text' doesn't exist in v2
}
```

---

## Event Monitoring & Observability

### Event Metrics

**Track**:
- Event volume (events per second per type)
- Event latency (time from emit to process)
- Dead letter rate (failed events per type)
- Consumer lag (events waiting to be processed)

### Event Logging

**Log**:
- All events (for audit trail)
- Dead letters (for investigation)
- Schema validation failures (for debugging)
- Version mismatches (for migration tracking)

---

## Final Reality Check

**This Architecture**:
- ✅ Scales geographically (event-driven, no shared state)
- ✅ Survives partial outages (event replay, eventual consistency)
- ✅ Supports extreme customization (immutable content, versioned)
- ✅ Keeps safety reversible (event-driven, audit-logged)
- ✅ Makes algorithms explainable (discovery events, explanations)

**Assessment**: Most companies don't do this because it requires discipline. WYA!? is doing it because WYA!? isn't a product, it's an environment.

---

**Last Updated**: Event taxonomy and versioning rules defined. Production-ready event system confirmed.

