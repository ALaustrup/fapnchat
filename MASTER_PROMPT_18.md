# MASTER PROMPT 18
## ROOM ENGINE & MODULE SYSTEM

**SYSTEM MODE**: FRONTEND SYSTEMS ARCHITECT

Design the Room Engine that powers WYA!? profile rooms—the structural engine that all rooms run on.

---

## Input

- Full "Profiles as virtual rooms" specification (MASTER_PROMPT_14)
- Component Composition Rules (MASTER_PROMPT_17)
- Design Tokens & Visual Contracts (MASTER_PROMPT_15)
- Motion Primitives & Interaction Rules (MASTER_PROMPT_16)
- The 4 Sacred Invariants
- Product Governance Framework

---

## Architectural Truths

### Why This Profile System Works

**A. Identity Separated from Expression**
- Identity core: Persistent, minimal, reliable
- Expression layer: Volatile, creative, expansive
- **Consequence**: Moderation operates without destroying personality
- **Consequence**: Users evolve without losing continuity
- **Consequence**: Safety exists without sterilization

**B. Customization is Tiered, Not Binary**
- Level 1: Aesthetic freedom
- Level 2: Spatial control
- Level 3: Media expression
- Level 4: Power-user extension
- **Consequence**: Gradual onboarding, age-appropriate gating, monetization without coercion

**C. Visiting a Profile is an Experience**
- Entrance ritual → Spatial exploration → Personality discovery → Memory persistence
- **Consequence**: Profiles become destinations, not cards

---

## The Constraints That Must Never Break

### Constraint #1: Rooms Must Load Progressively
- ❌ **FORBIDDEN**: Blocking interaction on full load
- ❌ **FORBIDDEN**: Stalling because of media
- ❌ **FORBIDDEN**: Exceeding performance budgets silently
- ✅ **REQUIRED**: Loading preview, fade-in, warnings

### Constraint #2: Customization Must Be Reversible
- ✅ **REQUIRED**: Version history
- ✅ **REQUIRED**: Undo, rollback, recover
- **Rationale**: Creativity requires psychological safety

### Constraint #3: Music is Ambient, Never Hijacking
- ✅ **REQUIRED**: Autoplay off
- ✅ **REQUIRED**: Volume capped
- ✅ **REQUIRED**: One source at a time
- ✅ **REQUIRED**: Always-visible mute

### Constraint #4: Discovery Never Forces Exposure
- ✅ **REQUIRED**: Public default, but friends-only, private, age-restricted, strict mode are first-class
- **Rationale**: Protects vulnerable users, preserves trust

---

## Define

### 1. Room Lifecycle

#### **Lifecycle States**

**Unloaded** (Initial State):
```typescript
state: 'unloaded'
// Room data not yet fetched
// No modules mounted
// No resources loaded
// Performance: Zero cost
```

**Loading** (Fetching Data):
```typescript
state: 'loading'
// Room metadata fetched
// Module list determined
// Resources queued
// Performance: Minimal (metadata only)
// UI: Loading preview shown
```

**Loaded** (Ready to Enter):
```typescript
state: 'loaded'
// Room data available
// Modules registered (not yet mounted)
// Resources preloaded (optional)
// Performance: Low (data only, no rendering)
// UI: Ready to enter
```

**Entering** (Transition In):
```typescript
state: 'entering'
// Entrance animation playing
// Modules mounting progressively
// Resources loading on-demand
// Performance: Controlled (progressive)
// UI: Entrance transition (fade-in, door opening)
```

**Active** (User Present):
```typescript
state: 'active'
// All modules mounted
// Resources loaded (or loading)
// Interactions enabled
// Performance: Full (within budget)
// UI: Full room experience
```

**Exiting** (Transition Out):
```typescript
state: 'exiting'
// Exit animation playing
// Modules unmounting
// Resources cleaning up
// Performance: Controlled (cleanup)
// UI: Exit transition (fade-out, door closing)
```

**Unmounting** (Cleanup):
```typescript
state: 'unmounting'
// Modules unmounted
// Resources released
// Memory freed
// Performance: Zero cost
// UI: Room removed from view
```

#### **Lifecycle Transitions**

**State Machine**:
```
unloaded → loading → loaded → entering → active → exiting → unmounting → unloaded
```

**Transition Rules**:
- ✅ **REQUIRED**: Progressive loading (never block on full load)
- ✅ **REQUIRED**: Graceful degradation (load fails → show error, don't crash)
- ✅ **REQUIRED**: Performance budgets enforced at each state
- ❌ **FORBIDDEN**: Skipping states (e.g., unloaded → active)
- ❌ **FORBIDDEN**: Blocking transitions (must be non-blocking)

---

### 2. Module Mounting System

#### **Module Types**

**Passive Modules** (View Only):
```typescript
type: 'passive'
// Examples: Posters, text blocks, photo walls, mood boards
// Interaction: View only (no user input)
// Performance: Low (static content)
// Mounting: Immediate (no dependencies)
```

**Interactive Modules** (User Input):
```typescript
type: 'interactive'
// Examples: Guestbook, polls, pets, mini-games
// Interaction: User can interact
// Performance: Medium (event handlers)
// Mounting: After passive modules
```

**Media Modules** (Audio/Video):
```typescript
type: 'media'
// Examples: Music player, video player
// Interaction: Playback controls
// Performance: High (media resources)
// Mounting: Last (after interactive modules)
// Constraints: One source at a time, autoplay off, volume capped
```

**Power-User Modules** (Advanced):
```typescript
type: 'power-user'
// Examples: CSS sandbox, advanced animations
// Interaction: Custom code execution
// Performance: Variable (depends on code)
// Mounting: After all other modules
// Constraints: Sandboxed, no JavaScript, CSS only
```

#### **Module Mounting Order**

**Mounting Sequence**:
1. **Passive modules** (immediate, no dependencies)
2. **Interactive modules** (after passive, may depend on passive)
3. **Media modules** (last, highest performance cost)
4. **Power-user modules** (after all, sandboxed)

**Mounting Rules**:
- ✅ **REQUIRED**: Progressive mounting (not all at once)
- ✅ **REQUIRED**: Dependency resolution (modules wait for dependencies)
- ✅ **REQUIRED**: Performance budgets per module type
- ✅ **REQUIRED**: Graceful failure (module fails → skip, don't crash)
- ❌ **FORBIDDEN**: Blocking on module load (must be async)
- ❌ **FORBIDDEN**: Mounting all modules simultaneously (performance)

#### **Module Registration**

**Module Registry**:
```typescript
interface ModuleDefinition {
  id: string
  type: 'passive' | 'interactive' | 'media' | 'power-user'
  component: React.ComponentType
  dependencies?: string[] // Module IDs this depends on
  performanceBudget?: {
    maxLoadTime: number // ms
    maxMemory: number // bytes
    maxRenderTime: number // ms
  }
  permissions?: {
    ageGate?: number // Minimum age
    subscription?: string // Required subscription tier
    trust?: number // Minimum trust score
  }
}
```

**Registration Flow**:
1. Room loads → Module list fetched
2. Modules registered in registry
3. Dependencies resolved
4. Mounting order determined
5. Modules mounted progressively

---

### 3. Z-Layer and Depth Enforcement

#### **Room Layer System**

**Layer 0: Background** (z-index: -1 to 0):
```typescript
// Components: Background gradients, ambient effects
// Modules: Background modules only
// FORBIDDEN: Interactive elements, content modules
```

**Layer 1: Ambient** (z-index: 0 to 1):
```typescript
// Components: Ambient particles, decorations
// Modules: Ambient modules only
// FORBIDDEN: Interactive elements, content modules
```

**Layer 2: Content** (z-index: 1 to 10):
```typescript
// Components: Content panels, cards, modules
// Modules: Passive, interactive modules
// FORBIDDEN: Background elements, overlays
```

**Layer 3: Interactive** (z-index: 10 to 100):
```typescript
// Components: Buttons, inputs, interactive elements
// Modules: Interactive modules (controls)
// FORBIDDEN: Background elements, overlays
```

**Layer 4: Overlay** (z-index: 100 to 1000):
```typescript
// Components: Modals, menus, tooltips
// Modules: Overlay modules (guestbook, polls)
// FORBIDDEN: Background elements, content modules
```

**Layer 5: UI Chrome** (z-index: 1000+):
```typescript
// Components: Navigation, status bars
// Modules: System UI modules
// FORBIDDEN: Everything else
```

#### **Depth Enforcement Rules**

**Module → Layer Assignment**:
- **Background modules** → Layer 0-1
- **Passive modules** → Layer 2
- **Interactive modules** → Layer 3
- **Overlay modules** → Layer 4
- **System UI** → Layer 5

**Enforcement**:
- ✅ **REQUIRED**: Modules assigned to correct layer
- ✅ **REQUIRED**: Z-index within layer range
- ✅ **REQUIRED**: Depth from parallax, blur, shadow (not 3D)
- ❌ **FORBIDDEN**: Modules on wrong layer
- ❌ **FORBIDDEN**: Z-index exceeding 1000
- ❌ **FORBIDDEN**: Real 3D transforms

---

### 4. Performance Budgets Per Room

#### **Performance Budget Tiers**

**Light Room** (Minimal Modules):
```typescript
budget: {
  maxLoadTime: 1000, // ms (1s)
  maxMemory: 50 * 1024 * 1024, // 50MB
  maxRenderTime: 16, // ms (60fps)
  maxModules: 5, // Maximum modules
  maxMediaSources: 0 // No media
}
```

**Standard Room** (Normal Modules):
```typescript
budget: {
  maxLoadTime: 2000, // ms (2s)
  maxMemory: 100 * 1024 * 1024, // 100MB
  maxRenderTime: 16, // ms (60fps)
  maxModules: 10, // Maximum modules
  maxMediaSources: 1 // One media source
}
```

**Heavy Room** (Many Modules):
```typescript
budget: {
  maxLoadTime: 3000, // ms (3s)
  maxMemory: 200 * 1024 * 1024, // 200MB
  maxRenderTime: 16, // ms (60fps)
  maxModules: 20, // Maximum modules
  maxMediaSources: 1 // One media source (still capped)
}
```

**Power-User Room** (Advanced):
```typescript
budget: {
  maxLoadTime: 5000, // ms (5s)
  maxMemory: 500 * 1024 * 1024, // 500MB
  maxRenderTime: 16, // ms (60fps)
  maxModules: 30, // Maximum modules
  maxMediaSources: 1 // One media source (still capped)
}
```

#### **Performance Budget Enforcement**

**Load Time Budget**:
- ✅ **REQUIRED**: Progressive loading (don't block on full load)
- ✅ **REQUIRED**: Show loading preview within 500ms
- ✅ **REQUIRED**: Warn if approaching budget
- ❌ **FORBIDDEN**: Exceeding budget silently
- ❌ **FORBIDDEN**: Blocking interaction on load

**Memory Budget**:
- ✅ **REQUIRED**: Monitor memory usage
- ✅ **REQUIRED**: Unload unused modules
- ✅ **REQUIRED**: Warn if approaching budget
- ❌ **FORBIDDEN**: Exceeding budget silently
- ❌ **FORBIDDEN**: Memory leaks (must cleanup)

**Render Time Budget**:
- ✅ **REQUIRED**: Maintain 60fps (16ms frame budget)
- ✅ **REQUIRED**: Skip frames if necessary (graceful degradation)
- ✅ **REQUIRED**: Warn if consistently exceeding budget
- ❌ **FORBIDDEN**: Dropping below 30fps (unacceptable)
- ❌ **FORBIDDEN**: Blocking main thread

**Module Budget**:
- ✅ **REQUIRED**: Enforce maximum modules per room
- ✅ **REQUIRED**: Warn if approaching limit
- ✅ **REQUIRED**: Prevent adding modules beyond limit
- ❌ **FORBIDDEN**: Unlimited modules (performance)

**Media Budget**:
- ✅ **REQUIRED**: One media source at a time (always)
- ✅ **REQUIRED**: Autoplay off (always)
- ✅ **REQUIRED**: Volume capped (always)
- ✅ **REQUIRED**: Always-visible mute (always)
- ❌ **FORBIDDEN**: Multiple media sources simultaneously
- ❌ **FORBIDDEN**: Autoplay enabled
- ❌ **FORBIDDEN**: Volume exceeding cap

---

### 5. Progressive Loading Strategy

#### **Loading Phases**

**Phase 1: Metadata** (0-500ms):
```typescript
// Load: Room metadata, module list, user permissions
// Show: Loading preview (skeleton, placeholder)
// Performance: Minimal (metadata only)
// Interaction: None (loading state)
```

**Phase 2: Critical Modules** (500-1000ms):
```typescript
// Load: Identity card, status board, connection hub
// Show: Core room structure (frame, navigation)
// Performance: Low (critical modules only)
// Interaction: Navigation enabled (can exit)
```

**Phase 3: Passive Modules** (1000-2000ms):
```typescript
// Load: Posters, text blocks, photo walls, mood boards
// Show: Content visible (fade-in)
// Performance: Medium (content modules)
// Interaction: View content (no interaction yet)
```

**Phase 4: Interactive Modules** (2000-3000ms):
```typescript
// Load: Guestbook, polls, pets, mini-games
// Show: Interactive elements enabled
// Performance: Medium-High (interactive modules)
// Interaction: Full interaction enabled
```

**Phase 5: Media Modules** (3000ms+, Optional):
```typescript
// Load: Music player, video player (on-demand)
// Show: Media controls (autoplay off)
// Performance: High (media resources)
// Interaction: Media playback (user-initiated)
```

#### **Progressive Loading Rules**

**Loading Strategy**:
- ✅ **REQUIRED**: Show loading preview within 500ms
- ✅ **REQUIRED**: Enable interaction (exit) within 1000ms
- ✅ **REQUIRED**: Show content progressively (fade-in)
- ✅ **REQUIRED**: Load media on-demand (not automatically)
- ✅ **REQUIRED**: Graceful degradation (module fails → skip)
- ❌ **FORBIDDEN**: Blocking on full load
- ❌ **FORBIDDEN**: Stalling because of media
- ❌ **FORBIDDEN**: Exceeding performance budgets silently

**Loading Indicators**:
- ✅ **REQUIRED**: Show loading progress (percentage, modules loaded)
- ✅ **REQUIRED**: Warn if approaching budget (time, memory)
- ✅ **REQUIRED**: Show errors gracefully (module failed → skip)
- ❌ **FORBIDDEN**: Infinite loading (must timeout)
- ❌ **FORBIDDEN**: Silent failures (must show error)

---

## Output Requirements

### Room Engine Architecture

**Core Systems**:
1. **Lifecycle Manager** (state machine, transitions)
2. **Module Registry** (registration, dependency resolution)
3. **Module Loader** (progressive loading, performance budgets)
4. **Layer Manager** (z-index enforcement, depth rules)
5. **Performance Monitor** (budget enforcement, warnings)

### Module System Specification

**Module Definition**:
- Module types (passive, interactive, media, power-user)
- Module registration (registry, dependencies)
- Module mounting (order, progressive, async)
- Module unmounting (cleanup, memory release)

### Performance Budget System

**Budget Tiers**:
- Light, Standard, Heavy, Power-User rooms
- Budget enforcement (load time, memory, render time, modules, media)
- Budget warnings (approaching limit, exceeded)

### Progressive Loading System

**Loading Phases**:
- Phase 1: Metadata (0-500ms)
- Phase 2: Critical modules (500-1000ms)
- Phase 3: Passive modules (1000-2000ms)
- Phase 4: Interactive modules (2000-3000ms)
- Phase 5: Media modules (3000ms+, optional)

**Loading Rules**:
- Progressive loading (never block)
- Loading indicators (progress, warnings)
- Graceful degradation (failures handled)

---

## Brand DNA Alignment

Every room engine decision must align with:

1. **Motion is ambient, not continuous** → Slow loading, breathing animations
2. **Glow is a language, not decoration** → Glow during loading, semantic meaning
3. **Depth is perceptual, not literal** → Layer system, parallax, blur
4. **Moods are states, not skins** → Mood transitions during loading

---

## Success Criteria

The room engine is successful when:

- ✅ Rooms load progressively (never block)
- ✅ Performance budgets enforced (warnings, limits)
- ✅ Modules mount correctly (order, dependencies)
- ✅ Depth system works (layers, z-index)
- ✅ Loading feels smooth (preview, fade-in)
- ✅ Media never hijacks (autoplay off, volume capped)
- ✅ Customization reversible (version history)
- ✅ Discovery respects privacy (first-class privacy controls)

---

**CRITICAL**: This is the structural engine. No UI, no styling. Pure systems architecture. All rooms run on this engine. Violating these rules breaks the room system.

