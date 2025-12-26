/**
 * WYA!? — ModalOverlay Component
 * 
 * Purpose: Overlay backdrop for modals with glass effect
 * 
 * Feel: Immersive, focused, depth-aware
 * - Heavy blur creates depth separation
 * - Dark overlay focuses attention on modal content
 * - Smooth fade-in respects motion preferences
 * - Click outside to dismiss (if onClose provided)
 * 
 * Usage:
 * <ModalOverlay onClose={handleClose}>
 *   <ModalContent />
 * </ModalOverlay>
 */

import { forwardRef, useEffect } from "react";
import { X } from "lucide-react";

const ModalOverlay = forwardRef(
  (
    {
      children,
      onClose,
      showCloseButton = true,
      className = "",
      overlayClassName = "",
      ...props
    },
    ref
  ) => {
    // Prevent body scroll when modal is open
    useEffect(() => {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }, []);

    const handleOverlayClick = (e) => {
      // Only close if clicking the overlay itself, not children
      if (e.target === e.currentTarget && onClose) {
        onClose();
      }
    };

    return (
      <div
        ref={ref}
        className={`
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          p-4
          ${overlayClassName}
        `}
        onClick={handleOverlayClick}
        style={{
          // Heavy backdrop blur for depth
          backdropFilter: `blur(${CSS.supports("backdrop-filter", "blur(20px)") ? "var(--glass-blur-heavy)" : "none"})`,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          // Smooth fade-in
          animation: "modal-fade-in var(--transition-normal) var(--ease-out)",
          // GPU-accelerated
          willChange: "opacity",
        }}
        {...props}
      >
        <div
          className={`
            relative
            max-w-lg
            w-full
            max-h-[90vh]
            overflow-y-auto
            ${className}
          `}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
        >
          {showCloseButton && onClose && (
            <button
              onClick={onClose}
              className="
                absolute
                top-4
                right-4
                z-10
                w-8
                h-8
                flex
                items-center
                justify-center
                bg-[var(--glass-bg)]
                backdrop-blur-[var(--glass-blur)]
                border
                border-[var(--glass-border)]
                rounded-lg
                text-[#8B8B90]
                hover:text-white
                hover:bg-[var(--glass-bg-hover)]
                transition-all
                duration-[var(--transition-fast)]
                ease-[var(--ease-out)]
              "
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          )}
          {children}
        </div>
      </div>
    );
  }
);

ModalOverlay.displayName = "ModalOverlay";

export default ModalOverlay;

