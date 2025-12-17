import { useState } from "react";
import { Coins, Plus, ChevronDown } from "lucide-react";
import useBits from "@/utils/useBits";
import BuyBitsModal from "./BuyBitsModal";

export default function BitsDisplay() {
  const { balance, loading } = useBits();
  const [showBuyModal, setShowBuyModal] = useState(false);

  const formatBalance = (bal) => {
    if (bal >= 1000000) return `${(bal / 1000000).toFixed(1)}M`;
    if (bal >= 1000) return `${(bal / 1000).toFixed(1)}K`;
    return bal.toLocaleString();
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {/* Bits Balance Button */}
        <button
          onClick={() => setShowBuyModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 hover:from-[#FFD700]/30 hover:to-[#FFA500]/30 border border-[#FFD700]/40 rounded-lg px-3 py-2 transition-all duration-200 group"
          aria-label="View bits balance"
        >
          <div className="relative">
            <Coins size={18} className="text-[#FFD700]" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#FFD700] rounded-full animate-pulse" />
          </div>
          <span className="font-semibold text-[#FFD700] text-sm min-w-[40px] text-right">
            {loading ? "..." : formatBalance(balance)}
          </span>
          <ChevronDown size={14} className="text-[#FFD700]/70 group-hover:text-[#FFD700] transition-colors" />
        </button>

        {/* Quick Buy Button */}
        <button
          onClick={() => setShowBuyModal(true)}
          className="w-8 h-8 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] hover:from-[#6D4CE5] hover:to-[#8B5CF6] rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg shadow-[#7A5AF8]/20"
          aria-label="Buy bits"
        >
          <Plus size={16} className="text-white" />
        </button>
      </div>

      {showBuyModal && <BuyBitsModal onClose={() => setShowBuyModal(false)} />}
    </>
  );
}

