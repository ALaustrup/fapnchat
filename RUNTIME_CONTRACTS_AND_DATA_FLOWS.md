# WYA!? — Runtime Contracts & Data Flows

## Core Rule of the System

**Every piece of data has exactly one owner. Everyone else subscribes.**

If you violate this rule, you get race conditions, ghost state, and trust collapse.

---

## 1. Runtime Domains (Who Owns What)

### Domain A: Identity & Access

**Owner**: Auth Service

**Owns**:
- User ID
- Age layer
- Verification state
- Permissions
- Feature eligibility

**Never Owns**:
- Presence
- Social graph
- Content

**Contract**:
- Immutable during a session
- Changes invalidate downstream subscriptions

---

### Domain B: Presence & Location

**Owner**: Presence Service

**Owns**:
- Online/offline
- Activity state
- Approximate location tier
- Room presence

**Characteristics**:
- Ephemeral
- Time-decayed
- Never stored long-term
- Cached aggressively

**Contract**:
- Event-driven only
- No synchronous queries
- Always approximate, never exact

---

### Domain C: Social Graph

**Owner**: Graph Service

**Owns**:
- Friends
- Follows
- Blocks
- Trust relationships
- Social score inputs (not final score)

**Characteristics**:
- Strong consistency
- Write-heavy
- Read-optimized via projections

**Contract**:
- Mutations are authoritative
- Consumers receive projections, never raw edges

---

### Domain D: Content & Rooms

**Owner**: Content Service

**Owns**:
- Profiles as rooms
- Room layout
- Media references
- Customization metadata
- Visibility rules

**Characteristics**:
- Heavy read
- CDN-backed
- Versioned
- Immutable snapshots

**Contract**:
- Writes produce a new version
- Clients never mutate in place
- Rollbacks are version switches

---

### Domain E: Real-Time Communication

**Owner**: Messaging Service

**Owns**:
- Chat messages
- Reactions
- Typing indicators
- Read receipts
- Room chat state

**Characteristics**:
- Append-only
- Ordered
- Eventually consistent across regions

**Contract**:
- Messages are immutable
- Edits create new events
- Clients reconcile via sequence numbers

---

### Domain F: Discovery & Matching

**Owner**: Discovery Engine

**Owns**:
- Ranked result sets
- Matching explanations
- Discovery eligibility

**Does NOT Own**:
- Location
- Interests
- Scores

**Contract**:
- Stateless computation over snapshots
- Fully explainable outputs
- No hidden boosts

---

### Domain G: Safety & Moderation

**Owner**: Safety Engine

**Owns**:
- Risk scores
- Intervention states
- Enforcement actions

**Characteristics**:
- Invisible until triggered
- Event-subscribed
- Human-in-the-loop

**Contract**:
- Never blocks core runtime synchronously
- Interventions are async overlays
- All actions are reversible unless critical

---

## 2. Event Backbone (Everything Talks Through This)

### Event Bus Philosophy

- **No direct cross-service mutation**
- **No shared databases**
- **No synchronous dependency chains**
- **Everything emits events. Everything reacts to events.**

---

### Core Event Types (Non-Exhaustive)

#### Identity Events
- `user.verified`
- `user.age_layer_changed`
- `user.permission_updated`

#### Presence Events
- `presence.joined`
- `presence.left`
- `presence.moved_tier`
- `presence.activity_changed`

#### Social Graph Events
- `graph.friend_added`
- `graph.blocked`
- `graph.trust_updated`

#### Content Events
- `room.updated`
- `room.published`
- `room.version_rolled_back`

#### Messaging Events
- `message.sent`
- `message.reacted`
- `message.reported`

#### Discovery Events
- `discovery.requested`
- `discovery.result_served`

#### Safety Events
- `safety.flagged`
- `safety.intervention_started`
- `safety.intervention_cleared`

---

## 3. Client Data Flow (What the Browser Actually Does)

### On Initial Load

**SSR Delivers**:
- Identity snapshot
- Room shell
- Minimal UI state

**Client Bootstraps**:
- Auth context
- Feature gates
- Theme variables

**WebSocket Connects**:
- Presence subscription
- Messaging subscription
- Discovery stream

**Rule**: Nothing blocks hydration except identity.

---

### On Presence Change

**Flow**:
1. Client emits `presence.joined`
2. Presence Service updates ephemeral state
3. Event fan-out:
   - Discovery recalculates proximity buckets
   - Friends receive ambient presence update
   - Client receives diff-only update

**Result**: No refetch. No rerender storm.

---

### On Room Visit

**Flow**:
1. Client requests room snapshot (CDN)
2. Presence emits `presence.room_entered`
3. Messaging subscribes to room channel
4. Music subsystem negotiates playback rules
5. Safety engine observes silently

**Rule**: Room data is immutable. Presence is live.

---

### On Customization Edit (Owner Only)

**Flow**:
1. Client enters edit mode (local only)
2. Changes staged locally
3. On publish:
   - Content Service creates new version
   - Emits `room.updated`
   - CDN invalidation triggered
   - Visitors receive update on next entry

**Rule**: No live mutation for visitors.

---

### On Message Send

**Flow**:
1. Client sends optimistic message
2. Messaging Service assigns sequence ID
3. Event emitted
4. Other clients reconcile order
5. Safety engine scans asynchronously

**Rule**: Messages never block on moderation.

---

## 4. Discovery Runtime (Critical Path)

### Discovery Never Queries Live State Directly

**It Operates On**:
- Presence snapshots
- Graph projections
- Interest vectors
- Safety filters

### Flow

1. Client requests discovery
2. Discovery Engine:
   - Pulls cached presence tiers
   - Applies age layer filter
   - Applies proximity weighting
   - Applies secondary factors
3. Returns:
   - Ranked list
   - Explanation metadata
4. Client renders with transparency UI

**Result**: Discovery is stateless and horizontally scalable.

---

## 5. Safety Runtime (Without Killing Fun)

### Safety Does Not Block Flows Synchronously

**Instead**:
- Observes events
- Builds risk context
- Applies overlays when needed

### Example

**Scenario**: Rapid messaging detected

**Flow**:
1. Safety emits `safety.soft_prompt`
2. Client shows gentle UI nudge
3. No chat interruption

**Rule**: Only critical risk escalates to enforcement.

---

## 6. Failure Modes (And How This Design Survives Them)

### WebSocket Failure

**Survival**:
- Client falls back to SSE
- Presence degrades gracefully
- Messaging queues locally

---

### CDN Stale Data

**Survival**:
- Versioned room snapshots
- Cache busting via version hashes

---

### Region Outage

**Survival**:
- Discovery recomputed regionally
- Messaging reconnects to nearest cluster
- Presence recalculated within minutes

---

### Safety False Positive

**Survival**:
- No permanent damage
- Interventions reversible
- Human review always final

---

## 7. Invariants (Never Break These)

1. **No service owns another service's data**
2. **No client mutates shared state directly**
3. **No safety action is irreversible without review**
4. **No discovery result is unexplained**
5. **No real-time feature blocks SSR**

**If these hold, WYA!? scales without losing trust.**

---

## Domain Ownership Matrix

| Data Type | Owner | Subscribers | Contract |
|-----------|-------|-------------|----------|
| User ID | Auth Service | All services | Immutable during session |
| Age Layer | Auth Service | Safety, Discovery | Changes invalidate subscriptions |
| Presence | Presence Service | Discovery, Messaging | Event-driven, approximate |
| Location Tier | Presence Service | Discovery | Time-decayed, cached |
| Friends | Graph Service | Discovery, Messaging | Projections, not raw edges |
| Blocks | Graph Service | Discovery, Messaging | Authoritative mutations |
| Room Content | Content Service | All clients | Versioned, immutable |
| Messages | Messaging Service | Clients | Append-only, ordered |
| Discovery Results | Discovery Engine | Clients | Stateless, explainable |
| Risk Scores | Safety Engine | Discovery, Interventions | Event-subscribed, async |

---

## Event Flow Examples

### Example 1: User Joins Room

```
Client → presence.joined → Presence Service
                              ↓
                        Updates ephemeral state
                              ↓
                        Emits presence.room_entered
                              ↓
        ┌─────────────────────┴─────────────────────┐
        ↓                                           ↓
Discovery Engine                            Messaging Service
(Recalculates proximity)                    (Subscribes to room channel)
        ↓                                           ↓
    Emits discovery.result_served              Emits message.channel_subscribed
        ↓                                           ↓
    Client receives update                    Client receives subscription
```

### Example 2: User Sends Message

```
Client → message.sent → Messaging Service
                           ↓
                    Assigns sequence ID
                           ↓
                    Emits message.sent event
                           ↓
        ┌──────────────────┴──────────────────┐
        ↓                                      ↓
Other Clients                          Safety Engine
(Reconcile order)                      (Scans asynchronously)
        ↓                                      ↓
    Render message                    Emits safety.flagged (if needed)
```

### Example 3: Room Customization Published

```
Owner Client → room.published → Content Service
                                    ↓
                            Creates new version
                                    ↓
                            Emits room.updated
                                    ↓
        ┌───────────────────────────┴───────────────────────────┐
        ↓                                                       ↓
CDN Invalidation                                        Event Bus
(Invalidates cache)                                      (Fan-out)
        ↓                                                       ↓
Next visitor gets new version                    Visitors receive update notification
```

---

## Data Flow Principles

### Principle 1: Single Source of Truth
- Each domain owns its data exclusively
- Other domains subscribe via events
- No shared mutable state

### Principle 2: Event-Driven Communication
- Services communicate via events only
- No direct service-to-service calls
- Event bus is the only cross-service communication

### Principle 3: Immutable Writes
- Content writes create new versions
- Messages are append-only
- Rollbacks are version switches

### Principle 4: Eventual Consistency
- Real-time features are eventually consistent
- Presence degrades gracefully
- Discovery recomputes from snapshots

### Principle 5: Non-Blocking Safety
- Safety observes, doesn't block
- Interventions are async overlays
- Only critical risk blocks synchronously

---

## Performance Characteristics

### Read-Heavy Domains
- **Content Service**: CDN-backed, versioned snapshots
- **Discovery Engine**: Stateless computation, cached results

### Write-Heavy Domains
- **Graph Service**: Write-optimized, read via projections
- **Messaging Service**: Append-only, ordered streams

### Real-Time Domains
- **Presence Service**: Ephemeral, cached aggressively
- **Messaging Service**: Eventually consistent, sequence-ordered

### Event-Driven Domains
- **Safety Engine**: Observes events, async interventions
- **Discovery Engine**: Reacts to presence/graph events

---

## Scalability Characteristics

### Horizontal Scaling
- **Discovery Engine**: Stateless, horizontally scalable
- **Presence Service**: Regional clusters, topic-based pub/sub
- **Messaging Service**: Regional clusters, eventually consistent

### Vertical Scaling
- **Content Service**: CDN-backed, read-optimized
- **Graph Service**: Read-optimized via projections

### Caching Strategy
- **Presence**: Aggressive caching, time-decayed
- **Content**: CDN caching, version-busted
- **Discovery**: Cached results, snapshot-based

---

## Failure Recovery

### WebSocket Failure
- **Fallback**: SSE (Server-Sent Events)
- **Degradation**: Presence degrades gracefully
- **Queueing**: Messaging queues locally

### CDN Failure
- **Fallback**: Direct service access
- **Degradation**: Slower but functional
- **Recovery**: Automatic CDN failover

### Region Outage
- **Fallback**: Nearest region
- **Degradation**: Regional recomputation
- **Recovery**: Automatic region failover

### Safety False Positive
- **Recovery**: Reversible interventions
- **Review**: Human review always final
- **Prevention**: Risk scoring, not binary decisions

---

## Final Reality Check

**This Runtime Design Is**:
- ✅ Scalable
- ✅ Debuggable
- ✅ Explainable
- ✅ Safe without being oppressive
- ✅ Expressive without being chaotic

**Assessment**: Most platforms never formalize this layer. That's why they collapse under their own weight. WYA!? didn't.

---

**Last Updated**: Runtime contracts and data flows defined. Production-ready architecture confirmed.

