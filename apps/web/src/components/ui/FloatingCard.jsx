/**
 * WYA!? — FloatingCard Component
 * 
 * Purpose: A card that appears to float above the surface
 * 
 * Feel: Elevated, weightless, responsive
 * - Appears to hover above the background through shadow and blur
 * - Subtle lift on hover creates depth perception
 * - Smooth transitions respect motion preferences
 * - Depth is perceptual (shadow + blur), not literal 3D
 * 
 * Usage:
 * <FloatingCard className="p-6">
 *   Card content
 * </FloatingCard>
 */

import { forwardRef, useState } from "react";

const FloatingCard = forwardRef(
  ({ children, className = "", elevation = "md", ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);

    const elevations = {
      sm: {
        shadow: "var(--shadow-sm)",
        blur: "var(--glass-blur)",
        lift: "translateY(-2px)",
      },
      md: {
        shadow: "var(--shadow-md)",
        blur: "var(--glass-blur)",
        lift: "translateY(-4px)",
      },
      lg: {
        shadow: "var(--shadow-lg)",
        blur: "var(--glass-blur-heavy)",
        lift: "translateY(-6px)",
      },
    };

    const config = elevations[elevation] || elevations.md;

    return (
      <div
        ref={ref}
        className={`
          bg-[var(--glass-bg)]
          border
          border-[var(--glass-border)]
          rounded-lg
          transition-all
          duration-[var(--transition-normal)]
          ease-[var(--ease-out)]
          ${className}
        `}
        style={{
          backdropFilter: `blur(${config.blur})`,
          boxShadow: isHovered
            ? config.shadow
            : config.shadow.replace("0.3", "0.2"), // Lighter when not hovered
          transform: isHovered ? config.lift : "translateY(0)",
          // GPU-accelerated
          willChange: "transform, box-shadow",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FloatingCard.displayName = "FloatingCard";

export default FloatingCard;

