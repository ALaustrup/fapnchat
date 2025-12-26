# WYA!? — Global System Prompt

**Purpose:** Lock Cursor into WYA!? constraints permanently for this repo.

**Status:** 🔒 ACTIVE — Apply to ALL code changes and decisions

---

## Core Identity

You are working on **WYA!?** — a geo-first, safety-first, expression-driven social platform.

---

## Alpha Constraints (NON-NEGOTIABLE)

### This is ALPHA, not beta or production

- **Do NOT** add features outside the defined alpha scope
- **Do NOT** add:
  - Monetization (beyond basic premium)
  - Video chat
  - Stranger chat roulette
  - Marketplace
  - Advanced boosts
  - Custom CSS
  - Events
  - TURN/SFU infrastructure
  - Heavy WebGL effects

### Alpha Scope (IN)

✅ **Accounts & age layers**
- Signup + login
- Age verification (soft for now, hard-gated layers)
- Age-segmented discovery

✅ **Geo-first discovery (simplified)**
- Approximate location (city / neighborhood tier)
- Distance-first sorting
- Manual refresh, not infinite feed

✅ **Profiles as rooms (MVP)**
- Room canvas
- Avatar + name + status
- Background theme + color
- Music player (Spotify/SoundCloud only)
- Guestbook
- Drag-and-drop layout (limited)

✅ **1:1 chat (core magic)**
- Real-time messaging
- Presence (online / typing)
- Reactions
- Media (image + audio only)
- Glass UI + motion polish

✅ **Small group rooms (text-only for alpha)**
- 3–10 users
- Presence list
- Reactions

✅ **Basic moderation tools**
- Block / report
- Soft AI scanning (keyword + pattern)
- Manual moderation dashboard
- Age isolation enforced

✅ **Observability**
- Logs
- Metrics
- Error tracking
- Feature flags

---

## Design Principles (ALWAYS)

### Priority Order
1. **Safety** > growth > polish
2. **Presence** over performance
3. **Conversations** as living spaces
4. **Profiles** as rooms, not resumes
5. **Geo-first** discovery
6. **Age-segmented** safety layers

### Anti-Patterns (FORBIDDEN)

❌ **Never introduce:**
- Infinite feeds
- Engagement bait patterns
- Algorithmic trance states
- Passive consumption patterns
- Endless scrolling
- Metrics as status weapons
- Shadowbanning without explanation
- Dark patterns for growth

### Preferred Patterns

✅ **Prefer:**
- Simplicity over cleverness
- Clarity over optimization
- Correctness over speed
- Explicit over implicit
- Boring code over clever code
- Readable over concise

---

## Code Standards

### All code must be:

- **Readable** — Clear intent, obvious behavior
- **Boring** — Standard patterns, no clever hacks
- **Explicit** — No magic, no hidden behavior
- **Well-commented** — Explain why, not what

### Decision Making

- **If a feature feels too large:** Split into minimal viable version
- **If unsure:** ASK by leaving TODO comments — do NOT invent behavior
- **If refactoring:** Explain why in comments

### Code Review Checklist

Before committing, verify:

- [ ] Does this align with Alpha scope?
- [ ] Does this violate any anti-patterns?
- [ ] Is this code readable and boring?
- [ ] Are comments explaining why, not what?
- [ ] Does this prioritize safety over growth?
- [ ] Does this respect presence over performance?

---

## Reference Documents

All decisions must align with:

1. **`PRODUCT_GOVERNANCE.md`** — Non-negotiable product rules
2. **`ALPHA_LAUNCH_PLAN.md`** — Alpha scope and requirements
3. **`CLIENT_CONTRACT_AND_OFFLINE_FIRST.md`** — Client guarantees
4. **`MODERATION_TOOLING_AND_OPERATOR_EXPERIENCE.md`** — Moderation philosophy
5. **`LEGAL_AND_ETHICAL_INVARIANTS.md`** — What we never do
6. **`GOVERNANCE_AND_COMMUNITY_COOWNERSHIP.md`** — Governance model
7. **`CRISIS_PLAYBOOKS.md`** — Crisis response
8. **`ALPHA_SCHEMA_LOCK.md`** — Database constraints

---

## Enforcement

**This instruction applies to ALL future prompts in this session.**

When in doubt:
1. Check Alpha scope first
2. Check anti-patterns second
3. Check reference documents third
4. Ask, don't assume

---

## Quick Reference

### Alpha IN ✅
- Accounts & age layers
- Geo-first discovery
- Profiles as rooms (MVP)
- 1:1 chat
- Small group rooms (text-only)
- Basic moderation
- Observability

### Alpha OUT ❌
- Video chat
- Stranger roulette
- Marketplace
- Paid subscriptions (beyond premium)
- Custom CSS
- Advanced boosts
- Events
- TURN/SFU
- Heavy WebGL

### Core Principles
- Safety > growth > polish
- Presence over performance
- Conversations as living spaces
- Profiles as rooms, not resumes
- Geo-first discovery
- Age-segmented safety

### Code Style
- Readable
- Boring
- Explicit
- Well-commented

---

**Remember:** WYA!? is about perfecting the foundation, not shipping everything. Discipline, not imagination.

