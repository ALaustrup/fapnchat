import { useState } from "react";
import { X, Coins, Send, Check } from "lucide-react";
import useBits from "@/utils/useBits";

export default function SendBitsModal({ recipient, onClose, context = "direct" }) {
  const { balance, sendTip } = useBits();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  const handleSend = async () => {
    const tipAmount = parseInt(amount);
    if (!tipAmount || tipAmount < 1) {
      setError("Please enter a valid amount");
      return;
    }
    if (tipAmount > balance) {
      setError("Insufficient bits");
      return;
    }

    setSending(true);
    setError(null);

    const result = await sendTip(recipient.id, tipAmount, message, context);

    if (result.success) {
      setSuccess({
        amount: result.data.amount_sent,
        recipientName: result.data.recipient_name,
        newBalance: result.data.new_balance,
      });
    } else {
      setError(result.error);
    }

    setSending(false);
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#1A1A1E] border border-[#27272A] rounded-2xl max-w-sm w-full p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Tip Sent!</h2>
          <p className="text-[#8B8B90] mb-4">
            You sent <span className="text-[#FFD700] font-bold">{success.amount.toLocaleString()} Bits</span> to{" "}
            <span className="text-white font-semibold">{success.recipientName}</span>
          </p>
          <div className="bg-[#0F0F0F] rounded-xl p-3 mb-4">
            <p className="text-xs text-[#8B8B90]">Your New Balance</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Coins size={18} className="text-[#FFD700]" />
              <span className="text-xl font-bold text-[#FFD700]">{success.newBalance.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] text-white py-3 rounded-xl font-semibold hover:from-[#6D4CE5] hover:to-[#8B5CF6] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1E] border border-[#27272A] rounded-2xl max-w-sm w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#27272A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {recipient.display_name?.[0] || recipient.name?.[0] || recipient.email?.[0] || "U"}
              </span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Send Bits</h2>
              <p className="text-xs text-[#8B8B90]">
                to {recipient.display_name || recipient.name || recipient.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#27272A] hover:bg-[#3A3A3D] flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-[#8B8B90]" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Balance Display */}
          <div className="bg-[#0F0F0F] rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm text-[#8B8B90]">Your Balance</span>
            <div className="flex items-center gap-2">
              <Coins size={16} className="text-[#FFD700]" />
              <span className="font-bold text-[#FFD700]">{balance.toLocaleString()}</span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm text-[#8B8B90] mb-2 block">Amount</label>
            <div className="relative">
              <Coins size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFD700]" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                max={balance}
                className="w-full bg-[#0F0F0F] text-white placeholder-[#555555] border border-[#27272A] rounded-xl pl-10 pr-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
              />
            </div>
          </div>

          {/* Quick Amounts */}
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt.toString())}
                disabled={amt > balance}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  parseInt(amount) === amt
                    ? "bg-[#7A5AF8] text-white"
                    : amt > balance
                    ? "bg-[#27272A] text-[#555555] cursor-not-allowed"
                    : "bg-[#27272A] text-white hover:bg-[#3A3A3D]"
                }`}
              >
                {amt}
              </button>
            ))}
          </div>

          {/* Message */}
          <div>
            <label className="text-sm text-[#8B8B90] mb-2 block">Message (optional)</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message..."
              maxLength={100}
              className="w-full bg-[#0F0F0F] text-white placeholder-[#555555] border border-[#27272A] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!amount || parseInt(amount) < 1 || sending}
            className="w-full bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-[#6D4CE5] hover:to-[#8B5CF6] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Send {amount ? `${parseInt(amount).toLocaleString()} Bits` : "Bits"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

