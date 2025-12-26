# MASTER CURSOR PROMPT 15
## DESIGN TOKENS & VISUAL CONTRACTS

**SYSTEM MODE**: DESIGN SYSTEM ENGINEER

You are translating the WYA!? Immersive UI/UX System into design tokens and enforceable constraints that govern all UI code.

---

## Input

- Full "Immersive UI/UX System" specification (MASTER_PROMPT_11)
- Visual Language & Motion System principles
- Product Governance Framework (non-negotiables)
- The 4 Sacred Invariants

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

### 1. Color Tokens

#### **Base Colors** (Foundation)

**Background Layers**:
```typescript
// Layer 0: Deepest background (furthest)
bg-layer-0: #0C0D0F (absolute black with slight warmth)

// Layer 1: Ambient background
bg-layer-1: #121218 (dark with subtle gradient)

// Layer 2: Content panels
bg-layer-2: #1A1A1E (slightly lighter, content surface)

// Layer 3: Interactive elements
bg-layer-3: #1E1E1F (interactive surfaces)

// Layer 4: Overlays
bg-layer-4: #242424 (modal/overlay backgrounds)
```

**Text Colors**:
```typescript
text-primary: #F4F4F5 (highest contrast, primary text)
text-secondary: #8B8B90 (medium contrast, secondary text)
text-tertiary: #555555 (low contrast, tertiary text)
text-disabled: #3A3A3C (disabled state)
```

**Border Colors**:
```typescript
border-default: #27272A (default borders)
border-hover: #3A3A3C (hover state borders)
border-focus: #7A5AF8 (focus state, purple accent)
border-active: #9D7DFF (active state, brighter purple)
```

#### **Accent Colors** (Semantic)

**Primary Accent** (Purple):
```typescript
accent-purple-500: #7A5AF8 (primary purple)
accent-purple-400: #9D7DFF (lighter purple, hover)
accent-purple-600: #5D3FD9 (darker purple, pressed)
accent-purple-300: #B8A5FF (light purple, subtle)
```

**Semantic Accents**:
```typescript
// Cyan: Information, navigation, neutral
accent-cyan: #00D9FF

// Magenta: Social, connections, relationships
accent-magenta: #FF00D9

// Amber: Warnings, important, attention
accent-amber: #FFB800

// Green: Success, positive, growth
accent-green: #00FF88
```

#### **Glow Colors** (Language, Not Decoration)

**Glow Intensity Tiers**:
```typescript
// Ambient (background, subtle)
glow-ambient-opacity: 0.2-0.4

// Normal (interactive elements)
glow-normal-opacity: 0.5-0.7

// Active (focused, active elements)
glow-active-opacity: 0.8-1.0

// Alert (notifications, warnings)
glow-alert-opacity: 1.0+ (with pulse)
```

**Glow Color Semantics**:
```typescript
// Cyan glow: Information, navigation
glow-cyan: rgba(0, 217, 255, <intensity>)

// Magenta glow: Social, connections
glow-magenta: rgba(255, 0, 217, <intensity>)

// Purple glow: Creative, personal, expression
glow-purple: rgba(122, 90, 248, <intensity>)

// Amber glow: Warnings, important
glow-amber: rgba(255, 184, 0, <intensity>)

// Green glow: Success, positive
glow-green: rgba(0, 255, 136, <intensity>)
```

**Glow Escalation Rules**:
- **Hover**: Normal → Active (0.5 → 0.8)
- **Focus**: Normal → Active (0.5 → 0.8)
- **Active**: Active → Alert (0.8 → 1.0)
- **Presence**: Ambient → Normal (0.2 → 0.5)
- **Typing**: Normal → Active (0.5 → 0.8)
- **Speaking**: Active → Alert (0.8 → 1.0)

**Glow Decay Timings**:
- **Immediate removal**: 200ms (hover out, blur)
- **Gradual decay**: 500ms (presence fade)
- **Slow decay**: 1000ms (mood transitions)
- **Never instant**: Always interpolate

#### **Semantic Colors** (Meaning)

**Status Colors**:
```typescript
status-online: #00FF88 (green)
status-away: #FFB800 (amber)
status-busy: #FF4444 (red)
status-offline: #8B8B90 (gray)
```

**Interaction Colors**:
```typescript
interaction-hover: accent-purple-400
interaction-focus: accent-purple-500
interaction-active: accent-purple-600
interaction-disabled: #3A3A3C
```

---

### 2. Opacity Ranges for Glass Surfaces

#### **Glass Surface Opacity Tiers**

**Background Glass** (Layer 0-1):
```typescript
glass-bg-opacity: 0.05-0.15 (very subtle, ambient)
// Use: Background overlays, ambient effects
// FORBIDDEN: Exceeding 0.15 (becomes opaque)
```

**Content Glass** (Layer 2):
```typescript
glass-content-opacity: 0.1-0.25 (subtle, readable)
// Use: Content panels, cards
// FORBIDDEN: Exceeding 0.25 (loses glass effect)
```

**Interactive Glass** (Layer 3):
```typescript
glass-interactive-opacity: 0.15-0.3 (visible, interactive)
// Use: Buttons, inputs, interactive elements
// FORBIDDEN: Exceeding 0.3 (becomes solid)
```

**Overlay Glass** (Layer 4):
```typescript
glass-overlay-opacity: 0.2-0.4 (clear, modal)
// Use: Modals, menus, overlays
// FORBIDDEN: Exceeding 0.4 (blocks content)
```

**Glass Backdrop** (Behind modals):
```typescript
glass-backdrop-opacity: 0.5-0.8 (darkens background)
// Use: Modal backdrops, overlays
// FORBIDDEN: Exceeding 0.8 (too dark)
```

#### **Glass Composition Rules**

**Backdrop Blur**:
```typescript
glass-blur-sm: 8px (subtle blur)
glass-blur-md: 16px (medium blur)
glass-blur-lg: 24px (strong blur)
glass-blur-xl: 32px (very strong blur)
// FORBIDDEN: Exceeding 32px (performance impact)
```

**Glass Formula**:
```css
background: rgba(<color>, <opacity>);
backdrop-filter: blur(<blur-value>);
-webkit-backdrop-filter: blur(<blur-value>);
```

**FORBIDDEN**: Using opacity without backdrop-filter (not glass, just transparent)

---

### 3. Blur Ranges and When Each is Allowed

#### **Blur Intensity Tiers**

**Background Blur** (Layer 0):
```typescript
blur-bg-heavy: 20-40px
// Use: Deepest background layers
// FORBIDDEN: Using on interactive elements
```

**Midground Blur** (Layer 1-2):
```typescript
blur-mid-medium: 10-20px
// Use: Content panels, midground elements
// FORBIDDEN: Using on foreground elements
```

**Foreground Blur** (Layer 3):
```typescript
blur-foreground-light: 5-10px
// Use: Subtle depth on foreground elements
// FORBIDDEN: Heavy blur on active elements
```

**Active Element Blur**:
```typescript
blur-active-none: 0px
// Use: Active, focused elements
// FORBIDDEN: Blur on active elements (breaks focus)
```

#### **Blur Usage Rules**

**Allowed**:
- ✅ Background layers (heavy blur for depth)
- ✅ Inactive content (medium blur for separation)
- ✅ Glass surfaces (backdrop blur)
- ✅ Depth perception (subtle blur for layers)

**FORBIDDEN**:
- ❌ Blur on active/focused elements
- ❌ Blur on interactive elements (buttons, inputs)
- ❌ Blur exceeding 40px (performance)
- ❌ Blur without opacity (not glass effect)

---

### 4. Glow Intensity Tiers and Decay Timings

#### **Glow Intensity Tiers** (Enforce These)

**Ambient Glow** (0.2-0.4 opacity):
```typescript
glow-intensity-ambient: 0.2-0.4
// Use: Background elements, ambient effects
// Duration: Persistent (no decay)
// FORBIDDEN: Exceeding 0.4 (becomes normal)
```

**Normal Glow** (0.5-0.7 opacity):
```typescript
glow-intensity-normal: 0.5-0.7
// Use: Interactive elements, default state
// Duration: Persistent until state change
// Decay: 200ms on removal
// FORBIDDEN: Exceeding 0.7 (becomes active)
```

**Active Glow** (0.8-1.0 opacity):
```typescript
glow-intensity-active: 0.8-1.0
// Use: Focused, active elements
// Duration: While active
// Decay: 300ms on removal
// FORBIDDEN: Exceeding 1.0 (becomes alert)
```

**Alert Glow** (1.0+ opacity with pulse):
```typescript
glow-intensity-alert: 1.0+ (with pulse animation)
// Use: Notifications, warnings, critical states
// Duration: Until dismissed
// Decay: 500ms on removal
// Pulse: 2-3s breathing cycle
// FORBIDDEN: Static alert glow (must pulse)
```

#### **Glow Decay Timings** (Enforce These)

**Immediate Decay** (200ms):
```typescript
glow-decay-immediate: 200ms
// Use: Hover out, blur, quick state changes
// Easing: ease-out
// FORBIDDEN: Instant removal (no decay)
```

**Gradual Decay** (500ms):
```typescript
glow-decay-gradual: 500ms
// Use: Presence fade, normal state changes
// Easing: ease-in-out
// FORBIDDEN: Faster than 300ms (jarring)
```

**Slow Decay** (1000ms):
```typescript
glow-decay-slow: 1000ms
// Use: Mood transitions, major state changes
// Easing: ease-in-out
// FORBIDDEN: Faster than 800ms (too abrupt)
```

**Never Instant**:
- ❌ **FORBIDDEN**: Instant glow removal (always decay)
- ❌ **FORBIDDEN**: Instant glow addition (always fade in)
- ✅ **REQUIRED**: All glow changes must interpolate

---

### 5. Shadow Layers and Depth Rules

#### **Shadow Intensity Tiers**

**Ambient Shadow** (Layer 0-1):
```typescript
shadow-ambient: 0 2px 8px rgba(0, 0, 0, 0.1)
// Use: Subtle depth, background layers
// FORBIDDEN: Exceeding 0.1 opacity
```

**Content Shadow** (Layer 2):
```typescript
shadow-content: 0 4px 16px rgba(0, 0, 0, 0.15)
// Use: Content panels, cards
// FORBIDDEN: Exceeding 0.2 opacity
```

**Interactive Shadow** (Layer 3):
```typescript
shadow-interactive: 0 8px 24px rgba(0, 0, 0, 0.2)
// Use: Buttons, inputs, interactive elements
// FORBIDDEN: Exceeding 0.3 opacity
```

**Overlay Shadow** (Layer 4):
```typescript
shadow-overlay: 0 16px 48px rgba(0, 0, 0, 0.3)
// Use: Modals, menus, overlays
// FORBIDDEN: Exceeding 0.4 opacity
```

#### **Depth Rules** (Perceptual, Not Literal)

**Z-Index Layers**:
```typescript
z-layer-0: -1 (background, furthest)
z-layer-1: 0 (ambient elements)
z-layer-2: 1 (content panels)
z-layer-3: 10 (interactive elements)
z-layer-4: 100 (overlays, modals)
z-layer-5: 1000 (UI chrome, navigation)
// FORBIDDEN: Exceeding 1000 (z-index hell)
```

**Parallax Offsets**:
```typescript
parallax-bg: 0.1x scroll speed (slowest)
parallax-mid: 0.3x scroll speed (medium)
parallax-foreground: 1x scroll speed (normal)
// FORBIDDEN: Exceeding 0.5x difference (motion sickness)
```

**Motion Offsets**:
```typescript
motion-offset-sm: 2-4px (subtle)
motion-offset-md: 4-8px (medium)
motion-offset-lg: 8-16px (strong)
// FORBIDDEN: Exceeding 16px (too much movement)
```

**FORBIDDEN Depth Patterns**:
- ❌ Real 3D transforms (perspective, rotate3d)
- ❌ Camera controls (orbit, pan, zoom)
- ❌ Physics layouts (gravity, collisions)
- ❌ Z-index exceeding 1000
- ❌ Parallax exceeding 0.5x difference

---

## Output Requirements

### Token Tables with Allowed Ranges

**Color Tokens**:
- Base colors (background, text, border)
- Accent colors (primary, semantic)
- Glow colors (intensity tiers, semantics)
- Semantic colors (status, interaction)

**Opacity Ranges**:
- Glass surface opacity (by layer)
- Glass composition rules
- Backdrop blur values

**Blur Ranges**:
- Blur intensity tiers (by layer)
- Blur usage rules (allowed/forbidden)

**Glow Intensity & Decay**:
- Glow intensity tiers (ambient, normal, active, alert)
- Glow decay timings (immediate, gradual, slow)
- Glow escalation rules (when/how glow changes)

**Shadow & Depth**:
- Shadow intensity tiers (by layer)
- Z-index layers (0-1000)
- Parallax offsets (0.1x-1x)
- Motion offsets (2-16px)

### Explicit "Do Not Exceed" Constraints

**FORBIDDEN Values**:
- Glass opacity > 0.4
- Blur > 40px
- Glow opacity > 1.0 (without pulse)
- Z-index > 1000
- Parallax difference > 0.5x
- Motion offset > 16px
- Instant glow changes (no decay)
- Real 3D transforms
- Camera controls
- Physics layouts

**REQUIRED Patterns**:
- All glow changes must interpolate
- Glass surfaces must use backdrop-filter
- Depth must be perceptual (parallax, blur, shadow)
- Mood changes must be slow and interpolate
- Motion cycles must be 30-60s (slow, ambient)

---

## Brand DNA Alignment

Every token must align with:

1. **Motion is ambient, not continuous** → Slow cycles, breathing pulses
2. **Glow is a language, not decoration** → Semantic meaning, intensity tiers
3. **Depth is perceptual, not literal** → Parallax, blur, shadow (no 3D)
4. **Moods are states, not skins** → Slow interpolation, no instant swaps

---

## Success Criteria

The design tokens are successful when:

- ✅ Any developer can use tokens without breaking invariants
- ✅ Tokens enforce visual language automatically
- ✅ "Do not exceed" constraints are clear and enforceable
- ✅ Glow has semantic meaning, not decorative
- ✅ Depth is perceptual, not literal
- ✅ Motion is ambient, not continuous
- ✅ Moods interpolate, never instant swap

---

**CRITICAL**: These tokens govern all UI code. Violating these constraints breaks the Immersive UI/UX System. Every component must use these tokens, not custom values.

