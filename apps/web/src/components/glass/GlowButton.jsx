import { motion } from "motion/react";

/**
 * GlowButton - Interactive button with semantic glow
 * 
 * Alpha Glass UI Component
 * Glow intensity follows interaction state:
 * - Normal: 0.5-0.7 opacity
 * - Hover/Focus: 0.8 opacity
 * - Active: 1.0 opacity
 * 
 * Props:
 * - children: React node
 * - onClick: Click handler
 * - disabled: boolean
 * - variant: 'primary' | 'secondary' | 'ghost'
 * - glowColor: CSS color (default: accent-purple)
 */
export default function GlowButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  glowColor = "#7A5AF8",
  className = "",
  ...props
}) {
  const baseStyles = {
    borderRadius: "8px",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
  };

  const variantStyles = {
    primary: {
      background: `linear-gradient(135deg, ${glowColor}, ${glowColor}dd)`,
      color: "white",
      padding: "12px 24px",
    },
    secondary: {
      background: `rgba(26, 26, 30, 0.15)`,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: `1px solid ${glowColor}40`,
      color: "white",
      padding: "12px 24px",
    },
    ghost: {
      background: "transparent",
      color: "white",
      padding: "8px 16px",
    },
  };

  const currentStyle = variantStyles[variant] || variantStyles.primary;

  return (
    <motion.button
      className={`glow-button ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        ...baseStyles,
        ...currentStyle,
        opacity: disabled ? 0.5 : 1,
        boxShadow: disabled
          ? "none"
          : `0 0 20px ${glowColor}40`,
      }}
      whileHover={disabled ? {} : {
        scale: 1.05,
        boxShadow: `0 0 30px ${glowColor}60`,
      }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

