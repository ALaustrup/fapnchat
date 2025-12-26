# WYA!? — Data Schemas & Storage Strategy

## Core Storage Philosophy

- **No shared databases**
- **No polymorphic junk tables**
- **Append-only wherever possible**
- **Snapshots for reads, events for truth**
- **Cold data is cheap, hot data is fast**

**Rule**: Every domain has its own store, optimized for its access pattern.

---

## 1. Identity & Access Store (Authoritative)

### Storage Type
**Relational (Postgres)**

### Why
Strong consistency, transactional guarantees, legal accountability

### Schema (Simplified)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  handle VARCHAR(50) UNIQUE NOT NULL,
  age_layer ENUM('minor', 'transitional', 'adult') NOT NULL,
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned'))
);

-- Permissions table
CREATE TABLE permissions (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  capability VARCHAR(100) NOT NULL,
  granted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, capability)
);

-- Indexes
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_age_layer ON users(age_layer);
CREATE INDEX idx_permissions_user ON permissions(user_id);
```

### Rules
- ✅ **REQUIRED**: Immutable identity fields after creation
- ✅ **REQUIRED**: Age layer changes emit events
- ✅ **REQUIRED**: Never joined directly by other services
- ❌ **FORBIDDEN**: Direct queries from other services (use events)

---

## 2. Presence & Location Store (Ephemeral)

### Storage Type
**In-Memory + TTL (Redis / Valkey)**

### Why
Ultra-hot, disposable, privacy-sensitive

### Schema (Conceptual)

```redis
# Presence key: presence:{user_id}
# TTL: 60-120 seconds
{
  "status": "online" | "away" | "offline",
  "activity": "chatting" | "browsing" | "idle",
  "location_tier": "immediate" | "nearby" | "local" | "city",
  "room_id": "uuid" | null,
  "updated_at": timestamp
}
```

### Rules
- ✅ **REQUIRED**: No historical storage
- ✅ **REQUIRED**: Auto-expire (TTL 60-120s)
- ✅ **REQUIRED**: Rebuilt continuously from events
- ✅ **REQUIRED**: Never queried synchronously by discovery
- ❌ **FORBIDDEN**: Long-term persistence (privacy, performance)

---

## 3. Social Graph Store (Authoritative + Projections)

### Storage Type
**Graph DB or Relational with Adjacency Lists + Projections**

### Why
Relationship-heavy, traversal-based

### Authoritative Edges

```sql
-- Edges table (authoritative)
CREATE TABLE edges (
  from_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('friend', 'follow', 'block')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (from_user, to_user, type)
);

-- Indexes
CREATE INDEX idx_edges_from ON edges(from_user);
CREATE INDEX idx_edges_to ON edges(to_user);
CREATE INDEX idx_edges_type ON edges(type);
```

### Read Projections (Denormalized)

```redis
# Graph projection key: graph_projection:{user_id}
# TTL: 5 minutes
{
  "friends": ["user_id1", "user_id2", ...],
  "followers": ["user_id3", "user_id4", ...],
  "blocks": ["user_id5", "user_id6", ...],
  "trust_score": 0.75,
  "updated_at": timestamp
}
```

### Rules
- ✅ **REQUIRED**: Writes go to authoritative store
- ✅ **REQUIRED**: Projections rebuilt async
- ✅ **REQUIRED**: Clients never see raw edges
- ❌ **FORBIDDEN**: Direct edge queries from clients (use projections)

---

## 4. Content & Rooms Store (Versioned)

### Storage Type
**Object Storage (S3-compatible) + Metadata DB**

### Why
Immutable snapshots, CDN-friendly

### Room Version Object

**Path**: `room/{room_id}/{version}.json`

```json
{
  "layout": {
    "type": "grid",
    "columns": 3,
    "rows": 2
  },
  "modules": [
    {
      "id": "module-1",
      "type": "text-block",
      "content": "...",
      "position": {"x": 0, "y": 0}
    }
  ],
  "theme": {
    "background": "#0C0D0F",
    "accent": "#7A5AF8"
  },
  "visibility": {
    "public": true,
    "friends_only": false
  },
  "created_at": "2024-01-01T00:00:00Z",
  "created_by": "user_id"
}
```

### Metadata Table

```sql
-- Rooms metadata table
CREATE TABLE rooms (
  room_id UUID PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  active_version INTEGER NOT NULL,
  visibility VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_rooms_owner ON rooms(owner_id);
CREATE INDEX idx_rooms_visibility ON rooms(visibility);
```

### Rules
- ✅ **REQUIRED**: Never mutate a version
- ✅ **REQUIRED**: Rollback = pointer switch (update `active_version`)
- ✅ **REQUIRED**: Visitors always fetch immutable blobs
- ❌ **FORBIDDEN**: In-place mutations (create new version)

---

## 5. Messaging Store (Append-Only)

### Storage Type
**Log-Based Store (Kafka-like) + Message DB**

### Why
Ordering, replay, scale

### Message Schema

```sql
-- Message events table
CREATE TABLE message_events (
  message_id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'reaction', 'edit', 'delete')),
  payload JSONB NOT NULL,
  sequence_number BIGSERIAL NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_message_events_conversation ON message_events(conversation_id, sequence_number);
CREATE INDEX idx_message_events_sender ON message_events(sender_id);
CREATE INDEX idx_message_events_created ON message_events(created_at);
```

### Rules
- ✅ **REQUIRED**: Messages immutable
- ✅ **REQUIRED**: Edits = new events (type: 'edit')
- ✅ **REQUIRED**: Reads reconstructed via sequence
- ❌ **FORBIDDEN**: In-place message edits (create edit event)

---

## 6. Discovery Store (Computed)

### Storage Type
**Cache + Ephemeral Snapshots**

### Why
No truth stored here

### Discovery Result Schema

```redis
# Discovery result key: discovery_result:{user_id}
# TTL: 5 minutes
{
  "user_id": "uuid",
  "ranked_users": [
    {
      "user_id": "uuid",
      "score": 0.85,
      "explanation": "Very close to you • High trust score • Your friend"
    }
  ],
  "explanation_map": {
    "user_id": "explanation string"
  },
  "generated_at": timestamp
}
```

### Rules
- ✅ **REQUIRED**: Not persisted long-term
- ✅ **REQUIRED**: Recomputed constantly
- ✅ **REQUIRED**: Fully disposable
- ❌ **FORBIDDEN**: Long-term persistence (recompute from snapshots)

---

## 7. Safety & Moderation Store (Protected)

### Storage Type
**Encrypted Relational + Audit Log**

### Why
Legal, sensitive, human-reviewed

### Schema

```sql
-- Risk profiles table
CREATE TABLE risk_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('monitor', 'guide', 'intervene', 'protect')),
  signals JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Moderation actions table (append-only audit log)
CREATE TABLE moderation_actions (
  action_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  reversible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) -- Moderator ID
);

-- Indexes
CREATE INDEX idx_risk_profiles_level ON risk_profiles(risk_level);
CREATE INDEX idx_moderation_actions_user ON moderation_actions(user_id);
CREATE INDEX idx_moderation_actions_created ON moderation_actions(created_at);
```

### Rules
- ✅ **REQUIRED**: Append-only audit log
- ✅ **REQUIRED**: No silent changes
- ✅ **REQUIRED**: All actions explainable
- ❌ **FORBIDDEN**: Deletions from audit log (immutable)
- ❌ **FORBIDDEN**: Unencrypted sensitive data

---

## Storage Strategy Summary

| Domain | Storage Type | Access Pattern | Persistence |
|--------|-------------|----------------|-------------|
| Identity & Access | Postgres | Strong consistency, transactional | Permanent |
| Presence & Location | Redis/Valkey | Ultra-hot, ephemeral | TTL 60-120s |
| Social Graph | Postgres + Redis | Write-heavy, read-optimized | Permanent + cached |
| Content & Rooms | S3 + Postgres | Immutable snapshots, CDN-friendly | Permanent versions |
| Messaging | Kafka-like + Postgres | Append-only, ordered | Permanent log |
| Discovery | Redis | Computed, ephemeral | TTL 5 minutes |
| Safety & Moderation | Encrypted Postgres | Protected, audit-logged | Permanent |

---

## Data Access Patterns

### Read Patterns
- **Identity**: Direct queries (authoritative)
- **Presence**: Cached lookups (ephemeral)
- **Graph**: Projection lookups (denormalized)
- **Content**: CDN + object storage (immutable)
- **Messages**: Sequence-based reconstruction (ordered)
- **Discovery**: Cached results (computed)
- **Safety**: Encrypted queries (protected)

### Write Patterns
- **Identity**: Transactional writes (strong consistency)
- **Presence**: TTL updates (ephemeral)
- **Graph**: Edge writes + async projections (eventual consistency)
- **Content**: Version creation + pointer update (immutable)
- **Messages**: Append-only events (ordered)
- **Discovery**: Computed writes (ephemeral)
- **Safety**: Append-only audit log (protected)

---

## Data Consistency Guarantees

### Strong Consistency
- **Identity & Access**: Transactional guarantees
- **Social Graph**: Authoritative edges (projections eventual)
- **Safety & Moderation**: Audit log immutable

### Eventual Consistency
- **Presence**: Rebuilt from events, TTL-based
- **Graph Projections**: Async rebuild from authoritative edges
- **Discovery**: Recomputed from snapshots

### Immutable
- **Content & Rooms**: Versioned snapshots
- **Messages**: Append-only events
- **Safety Audit Log**: Append-only

---

## Data Privacy & Security

### Encryption
- **Safety & Moderation**: Encrypted at rest
- **Identity**: Sensitive fields encrypted
- **Messages**: End-to-end encryption (future)

### Access Control
- **Identity**: Auth service only
- **Presence**: Ephemeral, auto-expire
- **Graph**: Projections only (no raw edges)
- **Content**: CDN + visibility rules
- **Messages**: Conversation participants only
- **Discovery**: User-specific results
- **Safety**: Moderators only, audit-logged

### Data Retention
- **Identity**: Permanent (legal requirement)
- **Presence**: TTL 60-120s (ephemeral)
- **Graph**: Permanent edges, cached projections
- **Content**: Permanent versions
- **Messages**: Permanent log
- **Discovery**: TTL 5 minutes (ephemeral)
- **Safety**: Permanent audit log

---

## Scalability Characteristics

### Horizontal Scaling
- **Presence**: Redis cluster, sharded by user_id
- **Graph Projections**: Redis cluster, sharded by user_id
- **Content**: S3-compatible (infinite scale)
- **Messages**: Kafka-like (partitioned by conversation_id)
- **Discovery**: Redis cluster, sharded by user_id

### Vertical Scaling
- **Identity**: Postgres (read replicas)
- **Graph Edges**: Postgres (read replicas)
- **Safety**: Postgres (read replicas)

### Caching Strategy
- **Presence**: Aggressive caching, TTL-based
- **Graph Projections**: Cached, async rebuild
- **Content**: CDN caching, version-busted
- **Discovery**: Cached results, recomputed

---

**Last Updated**: Data schemas and storage strategy defined. Production-ready data layer confirmed.

