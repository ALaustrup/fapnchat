/**
 * WYA!? — PresenceDot Component
 * 
 * Purpose: Visual indicator for user presence status
 * 
 * Feel: Alive, breathing, informative
 * - Online status pulses gently (breathing, not flashing)
 * - Color provides immediate semantic meaning
 * - Respects reduced motion (no pulse if motion reduced)
 * - Small but visible, doesn't distract
 * 
 * Status Semantics:
 * - online: Green, gentle pulse (breathing)
 * - away: Amber, subtle pulse
 * - offline: Gray, no pulse
 * - busy: Red, subtle pulse
 * 
 * Usage:
 * <PresenceDot status="online" size="sm" />
 */

import { forwardRef } from "react";

const PresenceDot = forwardRef(
  ({ status = "offline", size = "md", className = "", ...props }, ref) => {
    const statusColors = {
      online: "var(--presence-online)",
      away: "var(--presence-away)",
      offline: "var(--presence-offline)",
      busy: "var(--presence-busy)",
    };

    const sizes = {
      sm: "w-2 h-2",
      md: "w-3 h-3",
      lg: "w-4 h-4",
    };

    const color = statusColors[status] || statusColors.offline;
    const shouldPulse = status === "online" || status === "away" || status === "busy";

    return (
      <div
          ref={ref}
          className={`
            ${sizes[size]}
            rounded-full
            border-2
            border-[#161616]
            ${className}
          `}
          style={{
            backgroundColor: color,
            // Pulse animation (breathing, not flashing)
            animation: shouldPulse
              ? "presence-pulse 3s ease-in-out infinite"
              : "none",
            // GPU-accelerated
            willChange: shouldPulse ? "opacity" : "auto",
          }}
          {...props}
        />
      </>
    );
  }
);

PresenceDot.displayName = "PresenceDot";

export default PresenceDot;

