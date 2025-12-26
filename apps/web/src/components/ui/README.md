# WYA!? — Glass System UI Primitives

**Purpose**: Reusable UI components with glassmorphism aesthetic

**Feel**: Ethereal, depth-aware, ambient glow

---

## Components

### GlassPanel

A glassmorphic panel that floats above the background.

**Feel**: Ethereal, depth-aware, ambient
- Appears to float above the background through blur and shadow
- Subtle border creates separation without harshness
- Hover state gently elevates the panel

```jsx
import { GlassPanel } from '@/components/ui';

<GlassPanel className="p-4">
  Content here
</GlassPanel>

<GlassPanel variant="hover" className="p-6">
  Interactive panel
</GlassPanel>
```

**Props**:
- `variant`: `"default"` | `"hover"` | `"active"` — Visual variant
- `className`: Additional CSS classes
- All standard div props

---

### GlowButton

Button with semantic glow that escalates on interaction.

**Feel**: Responsive, meaningful, alive
- Glow provides semantic meaning (purple=primary, cyan=info, etc.)
- Hover state escalates glow intensity (normal → active)
- Active state pulses gently (breathing, not flashing)

**Glow Semantics**:
- `purple`: Primary actions, creative expression
- `cyan`: Information, navigation
- `magenta`: Social, connections
- `amber`: Warnings, important
- `green`: Success, positive actions

```jsx
import { GlowButton } from '@/components/ui';

<GlowButton glow="purple" onClick={handleClick}>
  Primary Action
</GlowButton>

<GlowButton glow="cyan" variant="ghost" size="sm">
  Info Button
</GlowButton>
```

**Props**:
- `glow`: `"purple"` | `"cyan"` | `"magenta"` | `"amber"` | `"green"` — Glow color
- `variant`: `"default"` | `"solid"` | `"ghost"` — Button style
- `size`: `"sm"` | `"md"` | `"lg"` — Button size
- `disabled`: `boolean` — Disabled state
- All standard button props

---

### FloatingCard

A card that appears to float above the surface.

**Feel**: Elevated, weightless, responsive
- Appears to hover above the background through shadow and blur
- Subtle lift on hover creates depth perception
- Smooth transitions respect motion preferences

```jsx
import { FloatingCard } from '@/components/ui';

<FloatingCard elevation="md" className="p-6">
  Card content
</FloatingCard>
```

**Props**:
- `elevation`: `"sm"` | `"md"` | `"lg"` — Elevation level
- `className`: Additional CSS classes
- All standard div props

---

### PresenceDot

Visual indicator for user presence status.

**Feel**: Alive, breathing, informative
- Online status pulses gently (breathing, not flashing)
- Color provides immediate semantic meaning
- Respects reduced motion (no pulse if motion reduced)

**Status Semantics**:
- `online`: Green, gentle pulse
- `away`: Amber, subtle pulse
- `offline`: Gray, no pulse
- `busy`: Red, subtle pulse

```jsx
import { PresenceDot } from '@/components/ui';

<PresenceDot status="online" size="md" />
```

**Props**:
- `status`: `"online"` | `"away"` | `"offline"` | `"busy"` — Presence status
- `size`: `"sm"` | `"md"` | `"lg"` — Dot size
- `className`: Additional CSS classes
- All standard div props

---

### ModalOverlay

Overlay backdrop for modals with glass effect.

**Feel**: Immersive, focused, depth-aware
- Heavy blur creates depth separation
- Dark overlay focuses attention on modal content
- Smooth fade-in respects motion preferences
- Click outside to dismiss (if onClose provided)

```jsx
import { ModalOverlay } from '@/components/ui';

<ModalOverlay onClose={handleClose}>
  <GlassPanel className="p-6">
    Modal content
  </GlassPanel>
</ModalOverlay>
```

**Props**:
- `onClose`: `() => void` — Close handler (optional)
- `showCloseButton`: `boolean` — Show close button (default: `true`)
- `className`: Additional CSS classes for modal content container
- `overlayClassName`: Additional CSS classes for overlay
- All standard div props

---

## Design Principles

### 1. GPU-Safe Animations

All animations use GPU-accelerated properties:
- `transform` (translate, scale)
- `opacity`
- `filter` / `backdrop-filter`
- `box-shadow` (sparingly)

**Never use**: `width`, `height`, `top`, `left` for animations

### 2. Reduced Motion Support

All components respect `prefers-reduced-motion`:
- Animations disabled when motion is reduced
- Transitions become instant
- Pulse animations stop

### 3. Glow Semantics

Glow is a language, not decoration:
- Each color has semantic meaning
- Intensity escalates on interaction
- Glow decays smoothly when interaction ends

### 4. Depth Perception

Depth is perceptual, not literal:
- Blur creates separation
- Shadow creates elevation
- Z-index creates layering
- No real 3D transforms

---

## CSS Variables

All components use CSS variables defined in `styles/glass-system.css`:

```css
--glass-bg: rgba(26, 26, 30, 0.4);
--glass-blur: 12px;
--glow-purple: rgba(122, 90, 248, 0.6);
--transition-normal: 250ms;
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
```

See `styles/glass-system.css` for complete variable list.

---

## Usage Examples

See `GlassSystemExamples.jsx` for complete usage examples demonstrating:
- Individual component usage
- Combined component patterns
- Proper semantic glow usage
- Responsive behavior

---

## Alpha Constraints

- ✅ Tailwind + CSS variables only
- ✅ GPU-safe animations only
- ✅ Reduced-motion respected
- ✅ No heavy shaders
- ✅ No custom CSS beyond variables

---

## Post-Alpha Expansion

Future enhancements (not in Alpha):
- More glow color variants
- Advanced animation presets
- Custom easing functions
- Theme interpolation system

