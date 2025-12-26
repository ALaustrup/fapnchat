/**
 * WYA!? — GlowButton Component
 * 
 * Purpose: Button with semantic glow that escalates on interaction
 * 
 * Feel: Responsive, meaningful, alive
 * - Glow provides semantic meaning (purple=primary, cyan=info, etc.)
 * - Hover state escalates glow intensity (normal → active)
 * - Active state pulses gently (breathing, not flashing)
 * - Glow decays smoothly when interaction ends
 * 
 * Glow Semantics:
 * - purple: Primary actions, creative expression
 * - cyan: Information, navigation
 * - magenta: Social, connections
 * - amber: Warnings, important
 * - green: Success, positive actions
 * 
 * Usage:
 * <GlowButton glow="purple" onClick={handleClick}>
 *   Click me
 * </GlowButton>
 */

import { forwardRef, useState } from "react";

const GlowButton = forwardRef(
  (
    {
      children,
      className = "",
      glow = "purple",
      variant = "default",
      size = "md",
      disabled = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const [isActive, setIsActive] = useState(false);

    const glowColors = {
      purple: "var(--glow-purple)",
      "purple-strong": "var(--glow-purple-strong)",
      cyan: "var(--glow-cyan)",
      magenta: "var(--glow-magenta)",
      amber: "var(--glow-amber)",
      green: "var(--glow-green)",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    const variants = {
      default: "bg-[var(--glass-bg)]",
      solid: `bg-[${glowColors[glow]}]`,
      ghost: "bg-transparent",
    };

    const glowColor = glowColors[glow] || glowColors.purple;

    const handleMouseDown = () => {
      setIsActive(true);
    };

    const handleMouseUp = () => {
      setIsActive(false);
    };

    const handleMouseLeave = () => {
      setIsActive(false);
    };

    return (
      <button
        ref={ref}
        className={`
          ${variants[variant]}
          ${sizes[size]}
          backdrop-blur-[var(--glass-blur)]
          border
          border-[var(--glass-border)]
          rounded-lg
          font-medium
          text-white
          transition-all
          duration-[var(--transition-normal)]
          ease-[var(--ease-out)]
          disabled:opacity-50
          disabled:cursor-not-allowed
          relative
          overflow-hidden
          ${className}
        `}
        style={{
          // Glow effect using box-shadow
          boxShadow: disabled
            ? "none"
            : isActive
            ? `0 0 24px ${glowColor}, var(--shadow-md)`
            : `0 0 12px ${glowColor}40, var(--shadow-sm)`,
          // GPU-accelerated
          willChange: "box-shadow, transform",
          transform: isActive ? "scale(0.98)" : "scale(1)",
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        {/* Glow overlay for extra depth */}
        <span
          className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-[var(--transition-normal)] pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${glowColor}, transparent 70%)`,
          }}
        />
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

GlowButton.displayName = "GlowButton";

export default GlowButton;

