import { useState } from "react";
import { Bell, MoreVertical, X, Menu } from "lucide-react";
import BitsDisplay from "./BitsDisplay";

export default function TopHeader({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleClearSearch = () => {
    setSearchValue("");
  };

  return (
    <div className="bg-[#0E0E10] w-full" role="banner" aria-label="Site search">
      <div
        className="bg-[#1B1B1E] px-3 md:px-6 py-3 flex items-center gap-2 md:gap-4 shadow-inner"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
      >
        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 bg-gradient-to-b from-[#252528] to-[#1E1E21] rounded-lg border border-[#353538] flex items-center justify-center text-[#F4F4F5] hover:bg-[#2E2E31] hover:text-white active:bg-[#1A1A1D] focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] focus:ring-offset-2 focus:ring-offset-[#0E0E10] transition-all duration-200"
            aria-label="Open menu"
          >
            <Menu size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Search Input Field */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search users, posts, forums..."
            className={`w-full bg-transparent text-[#F4F4F5] placeholder-[#77787A] font-inter font-medium text-sm md:text-base leading-6 py-2 px-0 border-0 border-b transition-colors duration-150 ease-out focus:outline-none ${
              isFocused ? "border-b-[#7A5AF8]" : "border-b-[#2A2A2D]"
            }`}
            aria-label="Search input"
          />

          {/* Clear button */}
          {searchValue && isFocused && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#77787A] hover:text-[#F4F4F5] active:text-white transition-colors duration-150"
              aria-label="Clear search"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Bits Display */}
          <BitsDisplay />

          {/* Notifications Button */}
          <button
            className="relative w-10 h-10 md:w-11 md:h-11 bg-gradient-to-b from-[#252528] to-[#1E1E21] rounded-lg border border-[#353538] flex items-center justify-center text-[#F4F4F5] hover:bg-[#2E2E31] hover:text-white active:bg-[#1A1A1D] focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] focus:ring-offset-2 focus:ring-offset-[#0E0E10] transition-all duration-200"
            aria-label="Notifications"
          >
            <Bell size={16} strokeWidth={1.5} />
          </button>

          {/* More Options Button */}
          <button
            className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-b from-[#252528] to-[#1E1E21] rounded-lg border border-[#353538] flex items-center justify-center text-[#F4F4F5] hover:bg-[#2E2E31] hover:text-white active:bg-[#1A1A1D] focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] focus:ring-offset-2 focus:ring-offset-[#0E0E10] transition-all duration-200"
            aria-label="More options"
          >
            <MoreVertical size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .font-inter {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        input::placeholder {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
