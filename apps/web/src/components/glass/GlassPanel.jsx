import { motion } from "motion/react";

/**
 * GlassPanel - Core glassmorphism primitive
 * 
 * Alpha Glass UI Component
 * Uses backdrop-filter blur with controlled opacity
 * 
 * Props:
 * - children: React node
 * - className: Additional CSS classes
 * - opacity: 0.05-0.4 (glass-content-opacity range)
 * - blur: 'sm' | 'md' | 'lg' | 'xl' (8px, 16px, 24px, 32px)
 * - glow: boolean - Enable subtle glow
 * - onClick: Click handler
 */
export default function GlassPanel({
  children,
  className = "",
  opacity = 0.15,
  blur = "md",
  glow = false,
  onClick,
  ...props
}) {
  // Enforce opacity limits (glass-content-opacity: 0.1-0.25)
  const safeOpacity = Math.max(0.1, Math.min(0.25, opacity));
  
  const blurMap = {
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  };

  const blurValue = blurMap[blur] || blurMap.md;

  return (
    <motion.div
      className={`glass-panel ${className}`}
      onClick={onClick}
      style={{
        background: `rgba(26, 26, 30, ${safeOpacity})`,
        backdropFilter: `blur(${blurValue})`,
        WebkitBackdropFilter: `blur(${blurValue})`,
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        boxShadow: glow
          ? `0 8px 32px rgba(122, 90, 248, 0.2)`
          : "none",
      }}
      whileHover={onClick ? { scale: 1.02 } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

