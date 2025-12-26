import { motion } from "motion/react";

/**
 * PresenceDot - Online status indicator with semantic glow
 * 
 * Alpha Glass UI Component
 * Glow intensity reflects presence state:
 * - online: green glow (0.7-1.0)
 * - away: amber glow (0.5-0.7)
 * - busy: red glow (0.7-1.0)
 * - offline: gray, no glow
 * 
 * Props:
 * - status: 'online' | 'away' | 'busy' | 'offline'
 * - size: number (default: 12)
 * - pulse: boolean - Enable breathing pulse
 */
export default function PresenceDot({
  status = "offline",
  size = 12,
  pulse = true,
  className = "",
}) {
  const statusColors = {
    online: "#00FF88",
    away: "#FFB800",
    busy: "#FF4444",
    offline: "#8B8B90",
  };

  const color = statusColors[status] || statusColors.offline;
  const hasGlow = status !== "offline";

  return (
    <motion.div
      className={`presence-dot ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: color,
        boxShadow: hasGlow
          ? `0 0 ${size * 2}px ${color}80`
          : "none",
      }}
      animate={pulse && hasGlow ? {
        scale: [1, 1.2, 1],
        opacity: [0.8, 1, 0.8],
      } : {}}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

