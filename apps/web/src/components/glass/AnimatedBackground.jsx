import { motion } from "motion/react";

/**
 * AnimatedBackground - Ambient background with slow motion
 * 
 * Alpha Glass UI Component
 * Slow cycles (30-60s) for ambient motion
 * Perceptual depth, not literal 3D
 * 
 * Props:
 * - variant: 'gradient' | 'particles' | 'waves'
 * - mood: 'calm' | 'energetic' | 'focused'
 */
export default function AnimatedBackground({
  variant = "gradient",
  mood = "calm",
  className = "",
}) {
  const moodColors = {
    calm: {
      from: "#121218",
      to: "#1A1B25",
      accent: "#7A5AF8",
    },
    energetic: {
      from: "#1A0B2E",
      to: "#16213E",
      accent: "#9F7AEA",
    },
    focused: {
      from: "#0F0F14",
      to: "#16161A",
      accent: "#5B4B8A",
    },
  };

  const colors = moodColors[mood] || moodColors.calm;

  if (variant === "gradient") {
    return (
      <motion.div
        className={`animated-background ${className}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
        }}
        animate={{
          background: [
            `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
            `linear-gradient(225deg, ${colors.to}, ${colors.from})`,
            `linear-gradient(315deg, ${colors.from}, ${colors.to})`,
            `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
          ],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    );
  }

  // Particles variant (simplified for Alpha)
  return (
    <div
      className={`animated-background particles ${className}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
        overflow: "hidden",
      }}
    >
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: colors.accent,
            opacity: 0.3,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 30 + Math.random() * 30,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

