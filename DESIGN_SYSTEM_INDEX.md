# WYA!? — Design System Index

## Overview

This directory contains the complete design system, product governance, and architectural specifications for WYA!? — a persistent, expressive social environment.

---

## 🔒 Non-Negotiables (Print These)

These rules are immutable. If a feature violates one, it does not ship.

1. **No Infinite Feeds** — No endless scrolling, passive consumption, or algorithmic trance
2. **Profiles Are Spaces, Not Summaries** — Optimize for expression, not polish
3. **Metrics Never Dominate Emotion** — Numbers inform, never drive behavior
4. **Algorithms Assist, They Never Dictate** — User intent always wins
5. **The Platform Must Feel Like a Place** — Spaces, not tools, dashboards, or content machines

See `PRODUCT_GOVERNANCE.md` for full details.

## 🛡️ The 4 Sacred Invariants (Enforce These)

These invariants are sacred. If violated, the experience collapses.

1. **Motion is Ambient, Not Continuous** — Cycles are slow (30–60s), pulses are breathing, interactions animate in response
2. **Glow is a Language, Not Decoration** — Intensity tiers, color semantics, escalation rules, decay timings
3. **Depth is Perceptual, Not Literal** — Parallax, blur, shadow, z-index, motion offset (NO real 3D)
4. **Moods are States, Not Skins** — Slow interpolation, no instant palette swaps

See `MASTER_PROMPT_15.md`, `MASTER_PROMPT_16.md`, `MASTER_PROMPT_17.md` for enforcement.

---

## Core Documents

### Brand & Philosophy
- **PRODUCT_GOVERNANCE.md** — The non-negotiables and conflict resolution framework
- **Brand DNA** (referenced throughout) — Immersion over scrolling, Profile as space, Presence over performance, Anti-algorithm, Room metaphor

### Interaction Systems
- **MASTER_PROMPT_9** (Interaction System Spec) — Component architecture, states, motion rules, performance, accessibility
- **MASTER_PROMPT_10** (Real-Time Data & Presence Model) — Presence signals, update frequencies, client/server split, failure modes
- **MASTER_PROMPT_11** (Visual Language & Motion System) — Motion primitives, glow rules, depth rules, background ambience

### Product Rules
- **MASTER_PROMPT_12** (Experience Principles → Product Rules) — What must always/never happen, acceptable/forbidden tradeoffs, conflict resolution

### World Structure
- **MASTER_PROMPT_13** (Core Navigation & World Structure) — Spatial navigation, presence-driven movement, intentional discovery, spatial awareness
- **MASTER_PROMPT_14** (Profile Worlds & Customization System) — Customization layers, visitor experience, evolution over time

### Engineering Contracts
- **MASTER_PROMPT_15** (Design Tokens & Visual Contracts) — Color tokens, opacity ranges, blur ranges, glow intensity tiers, shadow layers, depth rules
- **MASTER_PROMPT_16** (Motion Primitives & Interaction Rules) — Allowed animation types, duration ranges, easing curves, forbidden patterns, reduced-motion fallbacks
- **MASTER_PROMPT_17** (Component Composition Rules) — Layer assignments, overlap rules, glow permissions, animation permissions, anti-patterns

### Systems Architecture
- **MASTER_PROMPT_18** (Room Engine & Module System) — Room lifecycle, module mounting, z-layer enforcement, performance budgets, progressive loading
- **MASTER_PROMPT_19** (Customization Editor & Safety Model) — Editor modes, permission checks, content moderation, rollback/recovery, abuse prevention
- **MASTER_PROMPT_20** (Profile Discovery & Recommendation) — Non-algorithmic discovery, transparent similarity, proximity influence, opt-in recommendations, popularity bias prevention
- **MASTER_PROMPT_21** (Proximity Engine & Location Privacy Model) — Distance tiers, location updates, privacy levels, spoofing detection, proximity confidence
- **MASTER_PROMPT_22** (Social Score & Trust System) — Score components, decay rates, context scoring, false report penalties, appeals/recovery, caste prevention
- **MASTER_PROMPT_23** (Discovery Pipeline & Explanation Engine) — Ranking flow, weight application, diversity enforcement, plain language explanations, user controls

### Trust & Safety Systems
- **MASTER_PROMPT_24** (Safety Event Pipeline & Risk Engine) — Safety signals, risk scoring, thresholds, human review triggers, false positive handling
- **MASTER_PROMPT_25** (Intervention UX & Copy System) — Soft prompts, warnings, restrictions/bans, timing rules, localization, accessibility
- **MASTER_PROMPT_26** (Reporting, Appeals & Transparency System) — Report intake, review workflow, status updates, appeal process, auditability, abuse prevention

### Monetization Systems
- **MASTER_PROMPT_27** (Subscription, Entitlement & Feature Gating System) — Feature entitlements, entitlement checks, free user protection, upgrade/downgrade flows, edge cases
- **MASTER_PROMPT_28** (Marketplace & Creator Economy Engine) — Asset submission, pricing rules, revenue split, creator reputation, abuse prevention, refunds
- **MASTER_PROMPT_29** (Boosts, Promotion & Transparency System) — Boost mechanics, labeling requirements, proximity-first integration, anti-addiction safeguards, user controls

---

## Architectural Truths

### What WYA!? Is NOT Building
- ❌ A social network
- ❌ A dating app
- ❌ A chat app

### What WYA!? IS Building
✅ **A persistent, expressive social environment**

### Reference Points
- **Early Habbo / IMVU** (in spirit)
- **AIM / MySpace** (emotionally)
- **Modern SSR + real-time infra** (technically)

---

## Design System Hierarchy

```
Brand DNA (Philosophy)
    ↓
Product Governance (Rules)
    ↓
World Structure (Navigation, Spaces)
    ↓
Interaction Systems (Components, States)
    ↓
Visual Language (Motion, Glow, Depth)
    ↓
Implementation (Code)
```

---

## Usage Guidelines

### For Developers
1. **Check every feature** against `PRODUCT_GOVERNANCE.md`
2. **Reference Brand DNA** in every decision
3. **Follow interaction specs** for component design
4. **Respect world structure** for navigation
5. **Apply visual language** consistently

### For Designers
1. **Start with Brand DNA** — every design must align
2. **Use interaction specs** — components and states are defined
3. **Follow world structure** — navigation is spatial, not page-based
4. **Apply visual language** — motion, glow, depth rules
5. **Test against non-negotiables** — if it violates, redesign

### For Product Managers
1. **Enforce non-negotiables** — no exceptions
2. **Resolve conflicts** using governance framework
3. **Preserve Brand DNA** — don't dilute for metrics
4. **Maintain world structure** — keep spatial metaphor
5. **Protect customization** — never remove for scale

---

## Next Steps

### Immediate Priorities
1. ✅ Complete design system specifications
2. ✅ Establish product governance framework
3. ✅ Define world structure and navigation
4. ⏳ **Next**: Implement first 3 spaces (MVP)
5. ⏳ **Next**: Define age-aware layers experientially

### Future Work
- Visual design system (colors, typography, spacing)
- Component library implementation
- Animation library selection
- WebGL vs CSS decisions
- Recommendation system (if needed, anti-algorithm compliant)

---

## Critical Reminders

### Every Feature Must:
- ✅ Reference Brand DNA explicitly
- ✅ Pass non-negotiable checks
- ✅ Feel like a place, not a tool
- ✅ Prioritize presence over performance
- ✅ Respect user intent over algorithms

### Never:
- ❌ Add infinite feeds
- ❌ Remove customization for scale
- ❌ Use metrics to drive behavior
- ❌ Override user intent with algorithms
- ❌ Break the "place" feeling

---

## Document Status

- ✅ **PRODUCT_GOVERNANCE.md** — Complete
- ✅ **MASTER_PROMPT_12.md** — Complete
- ✅ **MASTER_PROMPT_13.md** — Complete
- ✅ **MASTER_PROMPT_14.md** — Complete
- ✅ **MASTER_PROMPT_15.md** — Complete (Design Tokens & Visual Contracts)
- ✅ **MASTER_PROMPT_16.md** — Complete (Motion Primitives & Interaction Rules)
- ✅ **MASTER_PROMPT_17.md** — Complete (Component Composition Rules)
- ✅ **MASTER_PROMPT_18.md** — Complete (Room Engine & Module System)
- ✅ **MASTER_PROMPT_19.md** — Complete (Customization Editor & Safety Model)
- ✅ **MASTER_PROMPT_20.md** — Complete (Profile Discovery & Recommendation)
- ✅ **MASTER_PROMPT_21.md** — Complete (Proximity Engine & Location Privacy Model)
- ✅ **MASTER_PROMPT_22.md** — Complete (Social Score & Trust System)
- ✅ **MASTER_PROMPT_23.md** — Complete (Discovery Pipeline & Explanation Engine)
- ✅ **MASTER_PROMPT_24.md** — Complete (Safety Event Pipeline & Risk Engine)
- ✅ **MASTER_PROMPT_25.md** — Complete (Intervention UX & Copy System)
- ✅ **MASTER_PROMPT_26.md** — Complete (Reporting, Appeals & Transparency System)
- ✅ **MASTER_PROMPT_27.md** — Complete (Subscription, Entitlement & Feature Gating System)
- ✅ **MASTER_PROMPT_28.md** — Complete (Marketplace & Creator Economy Engine)
- ✅ **MASTER_PROMPT_29.md** — Complete (Boosts, Promotion & Transparency System)
- ✅ **Interaction System Specs** — Complete (Prompts 9-11)
- ✅ **Real-Time & Presence Model** — Complete (Prompt 10)
- ✅ **Visual Language** — Complete (Prompt 11)

---

**Last Updated**: Design system foundation complete. Engineering contracts locked. Systems architecture defined. Technical architecture validated. Runtime contracts and data flows defined. Data schemas and storage strategy defined. Event taxonomy and versioning rules defined. Permission lattice and feature gating defined. Failure injection and chaos strategy defined. Ready for MVP implementation.

## Operational Law

- ✅ **Permission lattice** (capabilities, not roles; contextual, explainable, revocable)
- ✅ **Feature gating** (hard gates for safety, soft gates for intensity, contextual gates for dynamic permissions)
- ✅ **Failure injection** (chaos testing, runtime flags, intentional failure)
- ✅ **Chaos strategy** (failure domains, degradation rules, client resilience, replay & recovery)
- ✅ **Observability under chaos** (failure logging, metrics, social contract)

See `PERMISSION_LATTICE_AND_FEATURE_GATING.md` and `FAILURE_INJECTION_AND_CHAOS_STRATEGY.md` for full operational law.

## Data Layer Architecture

- ✅ **Data schemas** (7 domain stores, optimized access patterns)
- ✅ **Storage strategy** (no shared DBs, append-only, snapshots for reads)
- ✅ **Event taxonomy** (strict categories, universal envelope)
- ✅ **Versioning rules** (events never change, N-1 support, payloads only expand)
- ✅ **Ordering guarantees** (per aggregate, sequence numbers, timestamps)
- ✅ **Idempotency** (replay-safe, tolerant of duplication)
- ✅ **Dead-letter policy** (retry with backoff, never block stream)

See `DATA_SCHEMAS_AND_STORAGE_STRATEGY.md` and `EVENT_TAXONOMY_AND_VERSIONING.md` for full data layer architecture.

## Runtime Architecture

- ✅ **Runtime contracts** (7 domains, clear ownership, event-driven)
- ✅ **Data flows** (client patterns, discovery runtime, safety runtime)
- ✅ **Failure modes** (WebSocket, CDN, region, safety false positives)
- ✅ **Invariants** (never break these, scales without losing trust)

See `RUNTIME_CONTRACTS_AND_DATA_FLOWS.md` for full runtime architecture.

## Technical Architecture Validation

- ✅ **Production-grade architecture** (not aspirational, internally consistent)
- ✅ **Scalable to millions** (without rewriting)
- ✅ **React Router v7 + Hono + SSR** (streaming SSR, selective hydration)
- ✅ **Layered state model** (server truth, live truth, UI intent, ephemeral)
- ✅ **Conservative animation strategy** (CSS first, JS when needed, WebGL isolated)
- ✅ **Progressive enhancement tiers** (low-end not punished, high-end not bored)

See `TECHNICAL_ARCHITECTURE_VALIDATION.md` for full technical assessment.

## Build Order (Critical)

The correct build order to prevent fracturing:

1. **Phase 1**: Room Engine (no content yet) — Frame, layer system, module mounting, z-index, performance budgets
2. **Phase 2**: Core Identity + Navigation — Identity card, status board, connection hub, entry/exit transitions, recent rooms memory
3. **Phase 3**: Passive Expression Modules — Posters, text blocks, photo walls, mood boards (view only)
4. **Phase 4**: Interactive & Social Modules — Guestbook, polls, pets, mini-games, music player (after room metaphor feels solid)
5. **Phase 5**: Power-User Extensions — CSS sandbox, templates, marketplace, advanced animations (last, not first)

