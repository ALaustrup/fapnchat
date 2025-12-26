# WYA!? — Client contract & offline-first guarantees

## Core promise to users

**WYA!? never punishes you for bad connectivity.**

If the network flakes:

- Your words are not lost
- Your intent is preserved
- Your experience degrades gracefully
- You always remain in control

This is a hard contract, not "best effort".

---

## Client contract (explicit guarantees)

The client guarantees:

- Messages you type will not be lost
- Actions you take will eventually resolve
- State you see is explainable
- You will always know whether something is sent, pending, or failed
- The app never freezes waiting on the network

---

## Offline-first mental model

**The client is authoritative for intent.**  
**The server is authoritative for validation and distribution.**

The client does not wait to act.

---

## Message lifecycle (canonical)

Every message has a deterministic state machine:

```
draft
→ queued
→ sent
→ delivered
→ read
→ archived
```

Offline adds one state:

- `queued (offline)`

### Rules:

- Messages are queued immediately
- UI reflects state instantly
- Network state never blocks composition
- Ordering is preserved per conversation

---

## Local persistence (non-optional)

The client persists locally:

- Draft messages
- Queued messages
- Conversation state
- Scroll position
- Customization state
- Presence intent (not presence truth)

### Storage:

- **IndexedDB** (primary)
- **Memory cache** (hot)
- Fallback to localStorage only for critical flags

**If the browser crashes, state survives.**

---

## Offline behaviors (explicit)

### While offline

- Typing works
- Drafts save
- Messages queue
- Media uploads queue (with size warnings)
- Presence becomes "last seen recently"
- Discovery freezes (cached only)

**Nothing silently fails.**

### Reconnection behavior

On reconnect:

- Presence sync
- Message replay (idempotent)
- Media upload resume
- Read receipts reconcile
- UI transitions back smoothly

**No duplicate messages. Ever.**

---

## Optimistic UI rules

Optimism is mandatory, but truthful.

- Messages appear immediately
- Pending state is visible (subtle)
- Failure is visible (never silent)
- Retrying is user-controlled or automatic (safe ops only)

If a message fails permanently:

- It stays visible
- It is marked clearly
- It can be retried or edited

---

## Eventual consistency contract

The client accepts:

- Temporary divergence
- Eventual reconciliation
- Minor reorderings within bounds

The server guarantees:

- Idempotent processing
- Conflict resolution
- Canonical ordering

**The user never sees a lie.**

---

## Presence contract

Presence is best-effort, never guaranteed.

### Rules:

- Presence failure never blocks chat
- Presence is cosmetic
- Messaging does not depend on presence truth

If presence is uncertain:

- UI degrades to neutral
- No "online now" claims are made

---

## Media handling (offline-safe)

### Uploads

- Chunked
- Resumable
- Progress visible
- Cancelable

Offline uploads:

- Queued
- Size-capped
- Warned clearly

### Downloads

- Cached opportunistically
- Prefetched only on Wi-Fi by default
- Evicted intelligently

---

## Error handling philosophy

Errors are:

- Human-readable
- Contextual
- Non-blocking
- Actionable

Never:

- Stack traces
- "Something went wrong"
- Silent failures

**Example:**  
"Message queued. Will send when connected."

---

## Offline UX indicators (subtle)

- Small network indicator
- No scary warnings
- No modals
- No panic colors

**The goal is calm confidence.**

---

## Version tolerance

Clients must tolerate:

- New fields
- Missing fields
- Deprecated fields
- Partial payloads

**The app never hard-crashes on schema drift.**

---

## Client responsibilities summary

The client must:

- Preserve intent
- Never lose data
- Never block creativity
- Never lie about state
- Fail gracefully

**This is why WYA!? feels solid even when everything else is breaking.**

