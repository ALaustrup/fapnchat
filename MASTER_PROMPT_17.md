# MASTER CURSOR PROMPT 17
## COMPONENT COMPOSITION RULES

**SYSTEM MODE**: FRONTEND ARCHITECT

Define how UI components in WYA!? are composed using the Immersive UI/UX System, preventing visual entropy as the product grows.

---

## Input

- Full "Immersive UI/UX System" specification (MASTER_PROMPT_11)
- Design Tokens & Visual Contracts (MASTER_PROMPT_15)
- Motion Primitives & Interaction Rules (MASTER_PROMPT_16)
- Interaction System Specifications (MASTER_PROMPT_9)
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

### 1. Which Layers Components May Occupy

#### **Z-Index Layer System**

**Layer 0: Background** (z-index: -1 to 0)
```typescript
// Components allowed:
- Background gradients
- Ambient particles
- Background blur effects
- Deepest visual layers

// FORBIDDEN:
- Interactive elements
- Content panels
- Overlays
```

**Layer 1: Ambient** (z-index: 0 to 1)
```typescript
// Components allowed:
- Ambient effects (particles, glows)
- Background decorations
- Subtle visual elements
- Non-interactive ambiance

// FORBIDDEN:
- Interactive elements
- Content panels
- Overlays
```

**Layer 2: Content** (z-index: 1 to 10)
```typescript
// Components allowed:
- Content panels
- Cards
- Message bubbles
- Profile sections
- Room containers

// FORBIDDEN:
- Background elements (too high)
- Overlays (too low)
- UI chrome (too low)
```

**Layer 3: Interactive** (z-index: 10 to 100)
```typescript
// Components allowed:
- Buttons
- Inputs
- Interactive cards
- Hover states
- Focus states

// FORBIDDEN:
- Background elements (too high)
- Overlays (too low)
- UI chrome (too low)
```

**Layer 4: Overlay** (z-index: 100 to 1000)
```typescript
// Components allowed:
- Modals
- Menus
- Dropdowns
- Tooltips
- Notifications

// FORBIDDEN:
- Background elements (too high)
- Content panels (too low)
- UI chrome (too low)
```

**Layer 5: UI Chrome** (z-index: 1000+)
```typescript
// Components allowed:
- Navigation bars
- Status bars
- System UI
- Always-on-top elements

// FORBIDDEN:
- Everything else (too high)
// FORBIDDEN: Exceeding 1000 (z-index hell)
```

#### **Layer Assignment Rules**

**Component → Layer Mapping**:
- **Background components** → Layer 0-1
- **Content components** → Layer 2
- **Interactive components** → Layer 3
- **Overlay components** → Layer 4
- **UI chrome** → Layer 5

**FORBIDDEN**:
- ❌ Placing interactive elements in Layer 0-1 (not accessible)
- ❌ Placing content in Layer 4-5 (wrong hierarchy)
- ❌ Exceeding z-index 1000 (z-index hell)
- ❌ Using arbitrary z-index values (must use layer system)

---

### 2. How Components May Overlap

#### **Overlap Rules**

**Allowed Overlaps**:
- ✅ **Overlay over Content**: Modals over content panels (Layer 4 over Layer 2)
- ✅ **Interactive over Content**: Buttons over cards (Layer 3 over Layer 2)
- ✅ **UI Chrome over Everything**: Navigation over all (Layer 5 over all)
- ✅ **Ambient over Background**: Particles over gradients (Layer 1 over Layer 0)

**FORBIDDEN Overlaps**:
- ❌ **Content over Overlay**: Content panels over modals (wrong hierarchy)
- ❌ **Background over Content**: Background over content (wrong depth)
- ❌ **Interactive over Overlay**: Buttons over modals (wrong hierarchy)
- ❌ **Same Layer Overlap**: Components on same layer overlapping incorrectly

#### **Overlap Patterns**

**Modal Overlay Pattern**:
```typescript
// CORRECT:
<Modal z-index={200}> // Layer 4
  <Content z-index={10} /> // Layer 2 (inside modal)
</Modal>

// FORBIDDEN:
<Content z-index={300}> // Layer 2 (outside modal, too high)
<Modal z-index={200} /> // Layer 4 (should be above content)
```

**Card Stacking Pattern**:
```typescript
// CORRECT:
<Card z-index={5}> // Layer 2
  <Button z-index={15} /> // Layer 3 (inside card, above card)
</Card>

// FORBIDDEN:
<Button z-index={3}> // Layer 3 (below card, wrong)
<Card z-index={5} /> // Layer 2 (should be below button)
```

**FORBIDDEN**: Overlapping components without clear hierarchy

---

### 3. Which Components May Glow and When

#### **Glow Permission Matrix**

**Components That MAY Glow**:

**Presence Indicators** (Always):
```typescript
// Components:
- Online status badges
- Typing indicators
- Speaking indicators
- Activity badges

// Glow rules:
- Normal glow (0.5-0.7) when active
- Active glow (0.8-1.0) when typing/speaking
- Pulse animation (2-3s cycle)
- Color: Based on status (green=online, amber=away, etc.)

// FORBIDDEN:
- Glow without semantic meaning
- Static glow (must pulse when active)
- Wrong color (must match status)
```

**Interactive Elements** (On Interaction):
```typescript
// Components:
- Buttons (hover, focus, active)
- Inputs (focus, typing)
- Links (hover, active)
- Cards (hover, active)

// Glow rules:
- Normal glow (0.5-0.7) on hover
- Active glow (0.8-1.0) on focus/active
- Decay: 200ms on removal
- Color: Purple accent (#7A5AF8)

// FORBIDDEN:
- Glow without interaction
- Glow on disabled elements
- Wrong color (must match interaction state)
```

**Notifications** (When Active):
```typescript
// Components:
- Notification badges
- Alert messages
- Warning indicators
- Error messages

// Glow rules:
- Alert glow (1.0+ with pulse) when active
- Pulse animation (2-3s cycle)
- Decay: 500ms on dismissal
- Color: Based on type (amber=warning, red=error, etc.)

// FORBIDDEN:
- Static alert glow (must pulse)
- Glow after dismissal (must decay)
- Wrong color (must match notification type)
```

**Background Elements** (Ambient Only):
```typescript
// Components:
- Ambient particles
- Background decorations
- Subtle visual effects

// Glow rules:
- Ambient glow (0.2-0.4) only
- Slow pulse (3-5s cycle)
- No interaction glow
- Color: Based on mood/theme

// FORBIDDEN:
- Normal/active glow (too intense)
- Fast pulse (not ambient)
- Interaction-based glow (not interactive)
```

**Components That MAY NOT Glow**:
- ❌ **Static Text** (no glow on regular text)
- ❌ **Images** (no glow on images)
- ❌ **Backgrounds** (unless ambient, subtle)
- ❌ **Disabled Elements** (no glow on disabled)
- ❌ **Hidden Elements** (no glow on hidden)

#### **Glow Escalation Rules**

**Hover State**:
```typescript
// Normal → Active (0.5 → 0.8)
// Duration: 200ms fade in
// Decay: 200ms fade out
// FORBIDDEN: Instant glow change
```

**Focus State**:
```typescript
// Normal → Active (0.5 → 0.8)
// Duration: 200ms fade in
// Decay: 300ms fade out (longer than hover)
// FORBIDDEN: Instant glow change
```

**Active State**:
```typescript
// Active → Alert (0.8 → 1.0+)
// Duration: 300ms fade in
// Pulse: 2-3s cycle
// Decay: 500ms fade out
// FORBIDDEN: Static alert glow
```

**Presence State**:
```typescript
// Ambient → Normal (0.2 → 0.5)
// Duration: 500ms fade in
// Pulse: 2-3s cycle (breathing)
// Decay: 1000ms fade out (slow)
// FORBIDDEN: Instant presence glow
```

**FORBIDDEN**: Glow without semantic meaning or escalation rules

---

### 4. Which Components May Animate and When

#### **Animation Permission Matrix**

**Components That MAY Animate**:

**Presence Indicators** (Always):
```typescript
// Components:
- Online status badges
- Typing indicators
- Speaking indicators

// Animation rules:
- Pulse animation (2-3s cycle, breathing)
- Fade in/out (200ms) on state change
- FORBIDDEN: Fast pulse, constant animation

// Use Cases:
- Show online status (pulse)
- Show typing (pulse faster)
- Show speaking (pulse fastest)
```

**Interactive Elements** (On Interaction):
```typescript
// Components:
- Buttons (hover, click, focus)
- Inputs (focus, typing)
- Cards (hover, click)
- Links (hover, active)

// Animation rules:
- Ripple on click (400ms)
- Fade on hover (200ms)
- Settle on state change (300ms)
- FORBIDDEN: Constant animation, fast oscillations

// Use Cases:
- Button click feedback (ripple)
- Input focus feedback (fade)
- Card hover feedback (fade + glow)
```

**Content Elements** (On State Change):
```typescript
// Components:
- Messages (appear, disappear)
- Cards (load, unload)
- Panels (open, close)
- Modals (open, close)

// Animation rules:
- Fade in/out (200-400ms)
- Settle on appear (300ms)
- FORBIDDEN: Animation on scroll, constant animation

// Use Cases:
- Message appears (fade in + settle)
- Modal opens (fade in + settle)
- Panel closes (fade out)
```

**Background Elements** (Ambient Only):
```typescript
// Components:
- Ambient particles
- Background decorations
- Subtle visual effects

// Animation rules:
- Slow drift (3-6s cycle)
- Slow pulse (3-5s cycle)
- FORBIDDEN: Fast drift, fast pulse, constant animation

// Use Cases:
- Background particles (slow drift)
- Ambient glow (slow pulse)
- Background decorations (slow drift)
```

**Components That MAY NOT Animate**:
- ❌ **Static Text** (no animation on regular text)
- ❌ **Images** (no animation on images, unless intentional)
- ❌ **Disabled Elements** (no animation on disabled)
- ❌ **Hidden Elements** (no animation on hidden)
- ❌ **Scroll Containers** (no animation on scroll, use CSS transforms)

#### **Animation Timing Rules**

**Interaction Animations**:
```typescript
// Immediate feedback (ripple, fade)
// Duration: 200-400ms
// Easing: ease-out
// FORBIDDEN: Slower than 400ms (feels laggy)
```

**State Change Animations**:
```typescript
// Smooth transitions (fade, settle)
// Duration: 200-500ms
// Easing: ease-in-out
// FORBIDDEN: Faster than 200ms (jarring)
```

**Ambient Animations**:
```typescript
// Slow, breathing (drift, pulse)
// Duration: 2000-6000ms (2-6s)
// Easing: ease-sine (breathing)
// FORBIDDEN: Faster than 2000ms (not ambient)
```

**FORBIDDEN**: Animations that violate invariants (fast oscillations, constant particle storms, instant palette swaps)

---

### 5. Which Anti-Patterns are Forbidden

#### **Visual Anti-Patterns**

**Glow Anti-Patterns**:
- ❌ **Glow Without Meaning**: Adding glow "because cool"
- ❌ **Wrong Intensity**: Using active glow (0.8) on ambient elements
- ❌ **Wrong Color**: Using wrong color for semantic meaning
- ❌ **Instant Glow**: Changing glow without interpolation
- ❌ **Static Alert Glow**: Alert glow without pulse

**Animation Anti-Patterns**:
- ❌ **Fast Oscillations**: Animations faster than 2000ms for ambient
- ❌ **Constant Animation**: Animations that never pause
- ❌ **Particle Storms**: Too many particles animating constantly
- ❌ **Instant Swaps**: Mood/theme changes without interpolation
- ❌ **Animation on Scroll**: Animations triggered by scroll

**Depth Anti-Patterns**:
- ❌ **Real 3D**: Using perspective, rotate3d, etc.
- ❌ **Camera Controls**: Orbit, pan, zoom controls
- ❌ **Physics Layouts**: Gravity, collisions, physics
- ❌ **Z-Index Hell**: Exceeding z-index 1000
- ❌ **Wrong Layer**: Placing components on wrong layer

**Composition Anti-Patterns**:
- ❌ **Overlap Without Hierarchy**: Overlapping without clear z-index
- ❌ **Wrong Layer Overlap**: Content over overlay, etc.
- ❌ **Glow on Everything**: Glowing all components
- ❌ **Animation on Everything**: Animating all components
- ❌ **No Reduced Motion**: Not respecting prefers-reduced-motion

#### **Code Anti-Patterns**

**Token Anti-Patterns**:
- ❌ **Custom Values**: Using custom colors/opacities instead of tokens
- ❌ **Hardcoded Values**: Hardcoding values instead of tokens
- ❌ **Exceeding Limits**: Using values outside allowed ranges
- ❌ **Breaking Constraints**: Violating "do not exceed" constraints

**Motion Anti-Patterns**:
- ❌ **Custom Durations**: Using durations outside allowed ranges
- ❌ **Custom Easing**: Using easing curves not in allowed list
- ❌ **Custom Animations**: Creating animations not in primitive list
- ❌ **Breaking Invariants**: Violating motion invariants

**Component Anti-Patterns**:
- ❌ **Wrong Layer**: Placing components on wrong z-index layer
- ❌ **Wrong Glow**: Using glow without permission
- ❌ **Wrong Animation**: Using animation without permission
- ❌ **No Fallbacks**: Not providing reduced-motion fallbacks

---

## Output Requirements

### Component Layer Assignment

**Table showing**:
- Component type
- Allowed z-index layer
- FORBIDDEN layers
- Examples

### Overlap Rules

**Matrix showing**:
- Which layers may overlap
- Overlap patterns (correct)
- Overlap anti-patterns (forbidden)

### Glow Permission Matrix

**Table showing**:
- Component type
- May glow? (yes/no)
- When glow is allowed
- Glow rules (intensity, color, timing)
- FORBIDDEN glow patterns

### Animation Permission Matrix

**Table showing**:
- Component type
- May animate? (yes/no)
- When animation is allowed
- Animation rules (type, duration, easing)
- FORBIDDEN animation patterns

### Anti-Pattern List

**Explicit list of**:
- Visual anti-patterns
- Code anti-patterns
- Composition anti-patterns
- Examples of correct vs. incorrect

---

## Brand DNA Alignment

Every composition rule must align with:

1. **Motion is ambient, not continuous** → Slow cycles, breathing pulses
2. **Glow is a language, not decoration** → Semantic meaning, intensity tiers
3. **Depth is perceptual, not literal** → Parallax, blur, shadow (no 3D)
4. **Moods are states, not skins** → Slow interpolation, no instant swaps

---

## Success Criteria

The composition rules are successful when:

- ✅ Any developer can compose components without breaking invariants
- ✅ Layer assignments are clear and enforceable
- ✅ Overlap rules prevent visual entropy
- ✅ Glow permissions prevent "neon mess"
- ✅ Animation permissions prevent "motion chaos"
- ✅ Anti-patterns are explicit and avoidable
- ✅ Visual entropy is prevented as product grows

---

**CRITICAL**: These rules prevent visual entropy. Violating these rules breaks the Immersive UI/UX System. Every component must follow these composition rules, not custom implementations.

