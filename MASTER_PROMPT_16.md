# MASTER CURSOR PROMPT 16
## MOTION PRIMITIVES & INTERACTION RULES

**SYSTEM MODE**: MOTION SYSTEM ARCHITECT

Convert the WYA!? motion philosophy into a finite set of motion primitives with strict rules and constraints.

---

## Input

- Full "Immersive UI/UX System" specification (MASTER_PROMPT_11)
- Design Tokens & Visual Contracts (MASTER_PROMPT_15)
- The 4 Sacred Invariants
- Product Governance Framework

---

## The 4 Sacred Invariants (Enforce These)

### Invariant #1: Motion is Ambient, Not Continuous
- Cycles are slow (30–60s)
- Pulses are breathing, not flashing
- Interactions animate in response, not constantly
- **FORBIDDEN**: Looping spinners, fast oscillations, constant particle storms

### Invariant #2: Glow is a Language, Not Decoration
- Intensity tiers with semantic meaning
- Color semantics (cyan, magenta, purple, amber, green)
- Escalation rules (when glow increases/decreases)
- Decay timings (how glow fades)
- **FORBIDDEN**: Adding glow "because cool" without semantic meaning

### Invariant #3: Depth is Perceptual, Not Literal
- Depth from parallax, blur, shadow, z-index, motion offset
- **FORBIDDEN**: Real 3D, camera controls, physics layouts

### Invariant #4: Moods are States, Not Skins
- Moods are color systems, glow palettes, emotional contexts
- Mood changes must be slow and interpolate
- **FORBIDDEN**: Instant palette swaps, theme toggles without interpolation

---

## Define

### 1. Allowed Animation Types

#### **Fade** (Opacity Transitions)

**Purpose**: Smooth appearance/disappearance

**Duration Range**:
```typescript
fade-fast: 150-200ms (quick state changes)
fade-normal: 200-400ms (standard transitions)
fade-slow: 400-600ms (major state changes)
// FORBIDDEN: Faster than 150ms (jarring)
// FORBIDDEN: Slower than 600ms (too slow)
```

**Easing Curves**:
```typescript
fade-ease-out: cubic-bezier(0.0, 0.0, 0.2, 1.0) // Standard fade out
fade-ease-in: cubic-bezier(0.4, 0.0, 1.0, 1.0) // Standard fade in
fade-ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1.0) // Smooth fade both
// FORBIDDEN: Linear easing (feels mechanical)
// FORBIDDEN: Bounce/elastic easing (too playful)
```

**Use Cases**:
- ✅ Messages appearing/disappearing
- ✅ Modals opening/closing
- ✅ Overlays showing/hiding
- ✅ Content loading/unloading

**FORBIDDEN**:
- ❌ Fade on scroll (performance)
- ❌ Fade on every keystroke (too much)
- ❌ Fade faster than 150ms (jarring)

---

#### **Drift** (Subtle Movement)

**Purpose**: Organic, living feeling

**Duration Range**:
```typescript
drift-slow: 2000-5000ms (2-5s, very slow)
drift-normal: 3000-6000ms (3-6s, slow)
drift-fast: 4000-8000ms (4-8s, still slow)
// FORBIDDEN: Faster than 2000ms (not ambient)
// FORBIDDEN: Slower than 8000ms (too slow to notice)
```

**Easing Curves**:
```typescript
drift-ease-in-out: cubic-bezier(0.4, 0.0, 0.6, 1.0) // Smooth, organic
drift-ease-sine: cubic-bezier(0.45, 0.0, 0.55, 1.0) // Sine wave, breathing
// FORBIDDEN: Linear easing (not organic)
// FORBIDDEN: Ease-out only (not continuous)
```

**Movement Range**:
```typescript
drift-offset-sm: 2-4px (subtle movement)
drift-offset-md: 4-8px (medium movement)
drift-offset-lg: 8-16px (strong movement)
// FORBIDDEN: Exceeding 16px (too much movement)
```

**Use Cases**:
- ✅ Background particles (slow drift)
- ✅ Floating elements (organic movement)
- ✅ Parallax effects (slow, ambient)
- ✅ Ambient animations (breathing, living)

**FORBIDDEN**:
- ❌ Fast drift (not ambient)
- ❌ Constant drift (must pause/resume)
- ❌ Drift on interactive elements (distracting)

---

#### **Pulse** (Breathing Effect)

**Purpose**: Draw attention, show life

**Duration Range**:
```typescript
pulse-slow: 2000-3000ms (2-3s, breathing cycle)
pulse-normal: 2500-3500ms (2.5-3.5s, standard)
pulse-fast: 3000-4000ms (3-4s, still slow)
// FORBIDDEN: Faster than 2000ms (flashing, not breathing)
// FORBIDDEN: Slower than 4000ms (too slow to notice)
```

**Easing Curves**:
```typescript
pulse-ease-sine: cubic-bezier(0.45, 0.0, 0.55, 1.0) // Sine wave, breathing
pulse-ease-in-out: cubic-bezier(0.4, 0.0, 0.6, 1.0) // Smooth pulse
// FORBIDDEN: Linear easing (not breathing)
// FORBIDDEN: Bounce/elastic (too playful)
```

**Intensity Range**:
```typescript
pulse-intensity-sm: 0.1-0.2 opacity change (subtle)
pulse-intensity-md: 0.2-0.3 opacity change (normal)
pulse-intensity-lg: 0.3-0.4 opacity change (strong)
// FORBIDDEN: Exceeding 0.4 opacity change (too intense)
```

**Use Cases**:
- ✅ Presence indicators (online, typing, speaking)
- ✅ Notifications (draw attention)
- ✅ Active elements (show activity)
- ✅ Alerts (critical states)

**FORBIDDEN**:
- ❌ Fast pulse (flashing, not breathing)
- ❌ Constant pulse (must pause/resume)
- ❌ Pulse on everything (visual noise)

---

#### **Settle** (Smooth Landing)

**Purpose**: Natural settling after movement

**Duration Range**:
```typescript
settle-fast: 200-300ms (quick settle)
settle-normal: 300-500ms (standard settle)
settle-slow: 500-700ms (slow settle)
// FORBIDDEN: Faster than 200ms (jarring)
// FORBIDDEN: Slower than 700ms (too slow)
```

**Easing Curves**:
```typescript
settle-ease-out: cubic-bezier(0.0, 0.0, 0.2, 1.0) // Smooth landing
settle-ease-out-bounce: cubic-bezier(0.34, 1.56, 0.64, 1.0) // Slight bounce
// FORBIDDEN: Heavy bounce (too playful)
// FORBIDDEN: Linear easing (not natural)
```

**Use Cases**:
- ✅ Messages landing (after send)
- ✅ Panels opening (smooth expansion)
- ✅ Drag-and-drop (smooth placement)
- ✅ State changes (smooth transitions)

**FORBIDDEN**:
- ❌ Settle on scroll (performance)
- ❌ Heavy bounce (too playful)
- ❌ Instant settle (no animation)

---

#### **Ripple** (Interaction Feedback)

**Purpose**: Immediate feedback on interaction

**Duration Range**:
```typescript
ripple-fast: 300-400ms (quick feedback)
ripple-normal: 400-600ms (standard feedback)
ripple-slow: 600-800ms (slow feedback)
// FORBIDDEN: Faster than 300ms (too quick)
// FORBIDDEN: Slower than 800ms (too slow)
```

**Easing Curves**:
```typescript
ripple-ease-out: cubic-bezier(0.0, 0.0, 0.2, 1.0) // Smooth expansion
ripple-ease-in-out: cubic-bezier(0.4, 0.0, 0.6, 1.0) // Smooth both
// FORBIDDEN: Linear easing (not natural)
// FORBIDDEN: Bounce/elastic (too playful)
```

**Use Cases**:
- ✅ Button clicks (immediate feedback)
- ✅ Input focus (visual feedback)
- ✅ Card interactions (hover feedback)
- ✅ Touch interactions (mobile feedback)

**FORBIDDEN**:
- ❌ Ripple on scroll (performance)
- ❌ Multiple ripples simultaneously (visual noise)
- ❌ Ripple without interaction (no reason)

---

### 2. Duration Ranges for Each Animation Type

#### **Animation Duration Matrix**

| Animation Type | Fast | Normal | Slow | FORBIDDEN |
|----------------|------|--------|------|-----------|
| **Fade** | 150-200ms | 200-400ms | 400-600ms | <150ms, >600ms |
| **Drift** | 2000-5000ms | 3000-6000ms | 4000-8000ms | <2000ms, >8000ms |
| **Pulse** | 2000-3000ms | 2500-3500ms | 3000-4000ms | <2000ms, >4000ms |
| **Settle** | 200-300ms | 300-500ms | 500-700ms | <200ms, >700ms |
| **Ripple** | 300-400ms | 400-600ms | 600-800ms | <300ms, >800ms |

**Rules**:
- ✅ Use "fast" for quick state changes
- ✅ Use "normal" for standard transitions
- ✅ Use "slow" for major state changes or ambient effects
- ❌ **FORBIDDEN**: Exceeding allowed ranges
- ❌ **FORBIDDEN**: Using wrong duration for animation type

---

### 3. Easing Curves Allowed

#### **Allowed Easing Curves**

**Standard Easing**:
```typescript
ease-out: cubic-bezier(0.0, 0.0, 0.2, 1.0) // Smooth deceleration
ease-in: cubic-bezier(0.4, 0.0, 1.0, 1.0) // Smooth acceleration
ease-in-out: cubic-bezier(0.4, 0.0, 0.6, 1.0) // Smooth both
```

**Organic Easing**:
```typescript
ease-sine: cubic-bezier(0.45, 0.0, 0.55, 1.0) // Sine wave, breathing
ease-organic: cubic-bezier(0.4, 0.0, 0.6, 1.0) // Organic, natural
```

**Slight Bounce** (for settle only):
```typescript
ease-out-bounce: cubic-bezier(0.34, 1.56, 0.64, 1.0) // Slight bounce
```

**FORBIDDEN Easing Curves**:
- ❌ Linear (`linear`) — feels mechanical
- ❌ Heavy bounce (`cubic-bezier(0.68, -0.55, 0.27, 1.55)`) — too playful
- ❌ Elastic (`cubic-bezier(0.68, -0.6, 0.32, 1.6)`) — too bouncy
- ❌ Custom curves outside allowed range

---

### 4. When Animations are Forbidden

#### **FORBIDDEN Animation Patterns**

**Performance Forbidden**:
- ❌ Animations on scroll (use CSS transforms only)
- ❌ Animations on every keystroke (debounce/throttle)
- ❌ Multiple heavy animations simultaneously (max 5 concurrent)
- ❌ Animations on hidden elements (waste resources)

**UX Forbidden**:
- ❌ Animations that block interaction (must be non-blocking)
- ❌ Animations that cause motion sickness (excessive parallax)
- ❌ Animations that distract from content (too much motion)
- ❌ Animations without purpose (decorative only)

**Invariant Forbidden**:
- ❌ Fast oscillations (violates ambient motion)
- ❌ Constant particle storms (violates ambient motion)
- ❌ Looping spinners everywhere (violates ambient motion)
- ❌ Instant palette swaps (violates mood interpolation)

**Accessibility Forbidden**:
- ❌ Animations when `prefers-reduced-motion` is set (must respect)
- ❌ Animations that flash (epilepsy risk)
- ❌ Animations that auto-play (distracting)

---

### 5. Reduced-Motion Fallbacks

#### **Reduced Motion Mode**

**When `prefers-reduced-motion` is enabled**:

**Fade**:
- ✅ Keep fade (essential for state changes)
- ✅ Reduce duration (faster, less noticeable)
- ✅ Remove decorative fades (non-essential)

**Drift**:
- ❌ Disable drift (not essential)
- ✅ Use static positioning (no movement)
- ✅ Keep parallax disabled (motion sickness)

**Pulse**:
- ✅ Keep pulse (essential for presence)
- ✅ Reduce intensity (subtle, not distracting)
- ✅ Remove decorative pulses (non-essential)

**Settle**:
- ✅ Keep settle (essential for interactions)
- ✅ Reduce duration (faster, less noticeable)
- ✅ Remove bounce (motion reduction)

**Ripple**:
- ✅ Keep ripple (essential for feedback)
- ✅ Reduce duration (faster, less noticeable)
- ✅ Remove decorative ripples (non-essential)

#### **Reduced Motion Implementation**

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable ambient animations */
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  /* Keep essential animations (presence, feedback) */
  .presence-indicator,
  .interaction-feedback {
    animation-duration: 200ms !important;
  }
  
  /* Disable parallax */
  .parallax {
    transform: none !important;
  }
}
```

---

## Output Requirements

### Motion Primitive Definitions

**For Each Animation Type**:
1. **Purpose** (what it's for)
2. **Duration Range** (fast, normal, slow)
3. **Easing Curves** (allowed curves)
4. **Use Cases** (when to use)
5. **FORBIDDEN Patterns** (what not to do)

### Duration Matrix

**Table showing**:
- Animation type
- Fast/Normal/Slow durations
- FORBIDDEN ranges

### Easing Curve Library

**List of allowed easing curves**:
- Standard easing (ease-out, ease-in, ease-in-out)
- Organic easing (ease-sine, ease-organic)
- Special easing (ease-out-bounce for settle)

### Forbidden Patterns List

**Explicit list of**:
- Performance forbidden patterns
- UX forbidden patterns
- Invariant forbidden patterns
- Accessibility forbidden patterns

### Reduced Motion Fallbacks

**Implementation guide for**:
- `prefers-reduced-motion` support
- Essential vs. non-essential animations
- Duration reduction rules
- Disabled animation patterns

---

## Brand DNA Alignment

Every motion primitive must align with:

1. **Motion is ambient, not continuous** → Slow cycles (30-60s), breathing pulses
2. **Glow is a language, not decoration** → Glow changes animate smoothly
3. **Depth is perceptual, not literal** → Parallax uses slow drift
4. **Moods are states, not skins** → Mood changes use slow fade

---

## Success Criteria

The motion primitives are successful when:

- ✅ Any developer can use primitives without breaking invariants
- ✅ Duration ranges are strict and enforceable
- ✅ Easing curves are limited and purposeful
- ✅ Forbidden patterns are clear and explicit
- ✅ Reduced motion is fully supported
- ✅ Motion feels ambient, not continuous
- ✅ Interactions feel responsive, not distracting

---

**CRITICAL**: This is not a playground. It's a contract. Violating these rules breaks the Immersive UI/UX System. Every animation must use these primitives, not custom implementations.

