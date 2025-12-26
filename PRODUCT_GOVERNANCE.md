# WYA!? — Product Governance Framework

## 🔒 THE NON-NEGOTIABLES

These rules are immutable. If a feature violates one of these, it does not ship.

---

### Non-Negotiable #1: No Infinite Feeds

**Rule**: No feature may introduce endless scrolling, passive consumption, or algorithmic trance.

**Violations**:
- Endless scrolling
- Passive consumption patterns
- Algorithmic trance states

**Rationale**: Violates **Immersion over scrolling** principle.

**Enforcement**: 
- All lists must have explicit boundaries
- Pagination or "load more" must be intentional user action
- No auto-loading beyond viewport without user consent

---

### Non-Negotiable #2: Profiles Are Spaces, Not Summaries

**Rule**: Profile features must optimize for personal expression, not polish or uniformity.

**Violations**:
- Optimizing for "best self" presentation
- Pushing polish over personality
- Removing customization in favor of uniformity

**Rationale**: Violates **Profile as personal space** principle.

**Enforcement**:
- Profiles must support deep customization
- No standardized templates that remove personality
- Customization options must expand, not contract over time

---

### Non-Negotiable #3: Metrics Never Dominate Emotion

**Rule**: Numbers must never become status weapons or drive behavior more than connection.

**Violations**:
- Metrics becoming status weapons
- Numbers driving behavior more than connection
- Creating performative pressure through metrics

**Rationale**: Violates **Presence over performance** principle.

**Enforcement**:
- Metrics are informational, not competitive
- No leaderboards or rankings based on metrics
- Metrics cannot be primary navigation or discovery mechanism

---

### Non-Negotiable #4: Algorithms Assist, They Never Dictate

**Rule**: Discovery may suggest, surface, and contextualize, but never override user intent or hide chronology without consent.

**Violations**:
- Overriding user intent
- Hiding chronology without consent
- Replacing human choice with algorithmic choice

**Rationale**: Violates **Anti-algorithm philosophy**.

**Enforcement**:
- All algorithmic suggestions must be clearly labeled
- Chronological order is default, algorithmic order is opt-in
- Users can always see "why" a suggestion was made
- No algorithmic filtering without explicit user consent

---

### Non-Negotiable #5: The Platform Must Feel Like a Place

**Rule**: Features must feel like spaces, not tools, dashboards, or content machines.

**Violations**:
- Features feeling like tools
- Features feeling like dashboards
- Features feeling like content machines

**Rationale**: Violates the **room / space metaphor**.

**Enforcement**:
- UI must be stateful, not stateless
- Navigation must feel like movement, not clicking
- Features must have spatial context
- No feature can exist in isolation from the "place" metaphor

---

## Architectural Implications

### What WYA!? Is NOT Building

- ❌ A social network
- ❌ A dating app
- ❌ A chat app

### What WYA!? IS Building

✅ **A persistent, expressive social environment**

### Consequences

1. **UI must be stateful, not stateless**
   - Presence is first-class data
   - State persists across sessions
   - Context matters more than actions

2. **Presence is first-class data**
   - Presence drives navigation
   - Presence influences discovery
   - Presence creates context

3. **Time is secondary to co-presence**
   - Chronological order is default, not primary
   - Co-presence creates relevance
   - "Who's here now" matters more than "what happened then"

4. **Navigation must feel like movement, not clicking**
   - Spatial navigation metaphors
   - Movement animations, not page transitions
   - Contextual awareness of "where you are"

### Reference Points

WYA!? is closer to:
- **Early Habbo / IMVU** (in spirit)
- **AIM / MySpace** (emotionally)
- **Modern SSR + real-time infra** (technically)

...than anything mainstream today.

---

## Brand DNA Reference

Every feature decision must reference these pillars:

1. **Immersion over scrolling**
2. **Profile as personal space**
3. **Presence over performance**
4. **Anti-algorithm philosophy**
5. **Room / space metaphor**

---

## Conflict Resolution

When principles conflict:

1. **Safety > Immersion**: Age gates, content moderation override immersion
2. **Presence > Performance**: Real-time presence prioritized over metrics
3. **User Intent > Algorithm**: User choice always overrides algorithmic suggestion
4. **Expression > Polish**: Personality prioritized over presentation polish

---

## Review Process

Before any feature ships:

1. ✅ Does it violate any non-negotiable?
2. ✅ Does it align with Brand DNA?
3. ✅ Does it feel like a place, not a tool?
4. ✅ Does it prioritize presence over performance?
5. ✅ Does it respect user intent over algorithms?

If any answer is "no", the feature must be redesigned or rejected.

