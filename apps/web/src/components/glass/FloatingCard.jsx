import { motion } from "motion/react";
import GlassPanel from "./GlassPanel";

/**
 * FloatingCard - Elevated glass card with depth
 * 
 * Alpha Glass UI Component
 * Uses parallax offset and shadow for depth perception
 * 
 * Props:
 * - children: React node
 * - className: Additional CSS classes
 * - elevation: 1-5 (shadow intensity)
 * - hover: boolean - Enable hover lift
 */
export default function FloatingCard({
  children,
  className = "",
  elevation = 2,
  hover = true,
  ...props
}) {
  const shadowIntensity = elevation * 4;
  const shadowOpacity = Math.min(0.3, elevation * 0.06);

  return (
    <motion.div
      className={`floating-card ${className}`}
      style={{
        position: "relative",
      }}
      whileHover={hover ? {
        y: -4,
        transition: { duration: 0.2 },
      } : {}}
      {...props}
    >
      <GlassPanel
        opacity={0.2}
        blur="lg"
        glow={elevation >= 3}
        style={{
          boxShadow: `0 ${shadowIntensity}px ${shadowIntensity * 2}px rgba(0, 0, 0, ${shadowOpacity})`,
          padding: "24px",
        }}
      >
        {children}
      </GlassPanel>
    </motion.div>
  );
}

