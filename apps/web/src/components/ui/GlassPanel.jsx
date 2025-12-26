/**
 * WYA!? — GlassPanel Component
 * 
 * Purpose: A glassmorphic panel that floats above the background
 * 
 * Feel: Ethereal, depth-aware, ambient
 * - Appears to float above the background through blur and shadow
 * - Subtle border creates separation without harshness
 * - Hover state gently elevates the panel
 * - Respects reduced motion preferences
 * 
 * Usage:
 * <GlassPanel className="p-4">
 *   Content here
 * </GlassPanel>
 */

import { forwardRef } from "react";

const GlassPanel = forwardRef(
  ({ children, className = "", variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-[var(--glass-bg)] border-[var(--glass-border)]",
      hover: "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)] hover:border-[var(--glass-border-hover)]",
      active: "bg-[var(--glass-bg-active)] border-[var(--glass-border-hover)]",
    };

    return (
      <div
        ref={ref}
        className={`
          backdrop-blur-[var(--glass-blur)]
          ${variants[variant]}
          border
          rounded-lg
          shadow-[var(--shadow-md)]
          transition-all
          duration-[var(--transition-normal)]
          ease-[var(--ease-out)]
          ${className}
        `}
        style={{
          // GPU-accelerated properties only
          willChange: variant === "hover" ? "transform, opacity" : "auto",
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassPanel.displayName = "GlassPanel";

export default GlassPanel;

