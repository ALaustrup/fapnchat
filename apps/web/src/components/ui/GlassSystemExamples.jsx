/**
 * WYA!? — Glass System Usage Examples
 * 
 * Purpose: Demonstrate proper usage of glass system primitives
 * 
 * This file shows how to use each component correctly and demonstrates
 * the intended "feel" of the glass system.
 */

import { useState } from "react";
import GlassPanel from "./GlassPanel";
import GlowButton from "./GlowButton";
import FloatingCard from "./FloatingCard";
import PresenceDot from "./PresenceDot";
import ModalOverlay from "./ModalOverlay";

export default function GlassSystemExamples() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F0F0F] p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Glass System Examples
        </h1>

        {/* GlassPanel Examples */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">GlassPanel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassPanel className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Default Panel
              </h3>
              <p className="text-[#8B8B90] text-sm">
                A basic glass panel with backdrop blur and subtle border.
              </p>
            </GlassPanel>

            <GlassPanel variant="hover" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Hover Panel
              </h3>
              <p className="text-[#8B8B90] text-sm">
                Elevates slightly on hover for interactive feel.
              </p>
            </GlassPanel>
          </div>
        </section>

        {/* GlowButton Examples */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">GlowButton</h2>
          <div className="flex flex-wrap gap-4">
            <GlowButton glow="purple">Primary Action</GlowButton>
            <GlowButton glow="cyan">Information</GlowButton>
            <GlowButton glow="magenta">Social</GlowButton>
            <GlowButton glow="amber">Warning</GlowButton>
            <GlowButton glow="green">Success</GlowButton>
            <GlowButton glow="purple" variant="ghost">
              Ghost Button
            </GlowButton>
            <GlowButton glow="purple" disabled>
              Disabled
            </GlowButton>
          </div>
        </section>

        {/* FloatingCard Examples */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">
            FloatingCard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FloatingCard elevation="sm" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Small Elevation
              </h3>
              <p className="text-[#8B8B90] text-sm">
                Subtle lift on hover.
              </p>
            </FloatingCard>

            <FloatingCard elevation="md" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Medium Elevation
              </h3>
              <p className="text-[#8B8B90] text-sm">
                Standard floating card.
              </p>
            </FloatingCard>

            <FloatingCard elevation="lg" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Large Elevation
              </h3>
              <p className="text-[#8B8B90] text-sm">
                More pronounced depth.
              </p>
            </FloatingCard>
          </div>
        </section>

        {/* PresenceDot Examples */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">
            PresenceDot
          </h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <PresenceDot status="online" size="sm" />
              <span className="text-white text-sm">Online (Small)</span>
            </div>
            <div className="flex items-center gap-2">
              <PresenceDot status="away" size="md" />
              <span className="text-white text-sm">Away (Medium)</span>
            </div>
            <div className="flex items-center gap-2">
              <PresenceDot status="offline" size="lg" />
              <span className="text-white text-sm">Offline (Large)</span>
            </div>
            <div className="flex items-center gap-2">
              <PresenceDot status="busy" size="md" />
              <span className="text-white text-sm">Busy</span>
            </div>
          </div>
        </section>

        {/* ModalOverlay Example */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">
            ModalOverlay
          </h2>
          <GlowButton glow="purple" onClick={() => setShowModal(true)}>
            Open Modal
          </GlowButton>

          {showModal && (
            <ModalOverlay onClose={() => setShowModal(false)}>
              <GlassPanel className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Example Modal
                </h2>
                <p className="text-[#8B8B90] mb-6">
                  This modal demonstrates the glass overlay effect with heavy
                  backdrop blur. Click outside or use the close button to dismiss.
                </p>
                <div className="flex gap-3">
                  <GlowButton glow="purple" onClick={() => setShowModal(false)}>
                    Close
                  </GlowButton>
                  <GlowButton
                    glow="cyan"
                    variant="ghost"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </GlowButton>
                </div>
              </GlassPanel>
            </ModalOverlay>
          )}
        </section>

        {/* Combined Example */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">
            Combined Example
          </h2>
          <FloatingCard elevation="md" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-full flex items-center justify-center">
                <span className="text-white font-bold">U</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">
                    User Name
                  </h3>
                  <PresenceDot status="online" size="sm" />
                </div>
                <p className="text-[#8B8B90] text-sm">Last seen 2 minutes ago</p>
              </div>
            </div>
            <p className="text-[#D4D4D8] mb-4">
              This card combines multiple glass system primitives to create a
              cohesive, depth-aware interface.
            </p>
            <div className="flex gap-2">
              <GlowButton glow="purple" size="sm">
                Message
              </GlowButton>
              <GlowButton glow="cyan" variant="ghost" size="sm">
                View Profile
              </GlowButton>
            </div>
          </FloatingCard>
        </section>
      </div>
    </div>
  );
}

