import { useState, useEffect } from "react";
import { X, Coins, Check, CreditCard, Wallet, Copy, ExternalLink, Loader } from "lucide-react";
import useBits from "@/utils/useBits";

export default function BuyBitsModal({ onClose }) {
  const { balance, purchaseBits, refetch } = useBits();
  const [packages, setPackages] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [cryptoPayment, setCryptoPayment] = useState(null);
  const [step, setStep] = useState("select"); // 'select', 'crypto', 'processing'

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/bits/packages");
      const data = await res.json();
      setPackages(data.packages);
      setPaymentMethods(data.paymentMethods);
      setSelectedPackage(data.packages.find((p) => p.popular) || data.packages[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-checkout",
          package_id: selectedPackage.id,
        }),
      });

      const data = await res.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else if (data.message) {
        // Stripe not configured, use demo mode
        await handleDemoPayment();
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const handleCryptoPayment = async (walletType) => {
    setProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-payment",
          package_id: selectedPackage.id,
          wallet_type: walletType,
        }),
      });

      const data = await res.json();

      if (data.paymentId) {
        setCryptoPayment({
          ...data,
          walletType,
        });
        setStep("crypto");
      } else {
        throw new Error("Failed to create payment");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyCrypto = async (txHash) => {
    if (!txHash || !cryptoPayment) return;

    setProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-payment",
          payment_id: cryptoPayment.paymentId,
          tx_hash: txHash,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess({
          bits: data.bits_added,
          newBalance: data.new_balance,
        });
        refetch();
      } else {
        throw new Error(data.error || "Verification failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDemoPayment = async () => {
    // Demo mode - simulates payment success
    const result = await purchaseBits(selectedPackage.id, selectedPayment, "demo_token");

    if (result.success) {
      setSuccess({
        bits: result.data.bits_added,
        newBalance: result.data.new_balance,
      });
    } else {
      setError(result.error);
    }
    setProcessing(false);
  };

  const handlePurchase = async () => {
    if (!selectedPackage || !selectedPayment) return;

    if (selectedPayment === "stripe") {
      await handleStripePayment();
    } else if (["metamask", "coinbase", "phantom"].includes(selectedPayment)) {
      await handleCryptoPayment(selectedPayment);
    } else {
      // CashApp or other - use demo for now
      await handleDemoPayment();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getPaymentIcon = (methodId) => {
    switch (methodId) {
      case "stripe":
        return <CreditCard size={20} />;
      case "cashapp":
        return <span className="text-lg">💵</span>;
      case "metamask":
        return <span className="text-lg">🦊</span>;
      case "coinbase":
        return <span className="text-lg">🔵</span>;
      case "phantom":
        return <span className="text-lg">👻</span>;
      default:
        return <Wallet size={20} />;
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#1A1A1E] border border-[#27272A] rounded-2xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Purchase Complete!</h2>
          <p className="text-[#8B8B90] mb-4">
            You received <span className="text-[#FFD700] font-bold">{success.bits.toLocaleString()} Bits</span>
          </p>
          <div className="bg-[#0F0F0F] rounded-xl p-4 mb-6">
            <p className="text-sm text-[#8B8B90]">New Balance</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Coins size={24} className="text-[#FFD700]" />
              <span className="text-3xl font-bold text-[#FFD700]">{success.newBalance.toLocaleString()}</span>
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

  // Crypto payment screen
  if (step === "crypto" && cryptoPayment) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#1A1A1E] border border-[#27272A] rounded-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Complete Payment</h2>
            <button onClick={() => { setStep("select"); setCryptoPayment(null); }} className="text-[#8B8B90] hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="bg-[#0F0F0F] rounded-xl p-4 mb-4">
            <p className="text-sm text-[#8B8B90] mb-2">Send payment to:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-[#1A1A1E] text-white text-xs p-2 rounded overflow-x-auto">
                {cryptoPayment.walletAddress || "Wallet not configured"}
              </code>
              <button
                onClick={() => copyToClipboard(cryptoPayment.walletAddress)}
                className="p-2 bg-[#27272A] rounded hover:bg-[#3A3A3D]"
              >
                <Copy size={16} className="text-white" />
              </button>
            </div>
          </div>

          <div className="bg-[#0F0F0F] rounded-xl p-4 mb-4">
            <p className="text-sm text-[#8B8B90] mb-2">Amount:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {cryptoPayment.walletType === "phantom" ? (
                <div className="bg-[#1A1A1E] p-2 rounded">
                  <span className="text-[#8B8B90]">SOL:</span>{" "}
                  <span className="text-white font-mono">{cryptoPayment.amounts?.SOL}</span>
                </div>
              ) : (
                <>
                  <div className="bg-[#1A1A1E] p-2 rounded">
                    <span className="text-[#8B8B90]">ETH:</span>{" "}
                    <span className="text-white font-mono">{cryptoPayment.amounts?.ETH}</span>
                  </div>
                  <div className="bg-[#1A1A1E] p-2 rounded">
                    <span className="text-[#8B8B90]">USDC:</span>{" "}
                    <span className="text-white font-mono">{cryptoPayment.amounts?.USDC}</span>
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-[#555555] mt-2">≈ ${cryptoPayment.priceUsd} USD</p>
          </div>

          <div className="mb-4">
            <p className="text-sm text-[#8B8B90] mb-2">After sending, paste your transaction hash:</p>
            <input
              type="text"
              id="txHash"
              placeholder="0x..."
              className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={() => {
              const txHash = document.getElementById("txHash").value;
              handleVerifyCrypto(txHash);
            }}
            disabled={processing}
            className="w-full bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] text-white py-3 rounded-xl font-bold hover:from-[#6D4CE5] hover:to-[#8B5CF6] transition-all disabled:opacity-50"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader size={18} className="animate-spin" />
                Verifying...
              </span>
            ) : (
              "Verify Payment"
            )}
          </button>

          <p className="text-xs text-[#555555] text-center mt-4">
            Payment expires in {Math.floor(cryptoPayment.expiresIn / 60)} minutes
          </p>
        </div>
      </div>
    );
  }

  // Main selection screen
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1E] border border-[#27272A] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#27272A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-xl flex items-center justify-center">
              <Coins size={20} className="text-black" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Buy Bits</h2>
              <p className="text-xs text-[#8B8B90]">
                Current Balance: <span className="text-[#FFD700]">{balance.toLocaleString()}</span>
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

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-[#7A5AF8] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Package Selection */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Select Package</h3>
              <div className="grid grid-cols-2 gap-2">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                      selectedPackage?.id === pkg.id
                        ? "border-[#7A5AF8] bg-[#7A5AF8]/10"
                        : "border-[#27272A] hover:border-[#3A3A3D]"
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2 left-3 bg-[#7A5AF8] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                        POPULAR
                      </span>
                    )}
                    {pkg.bonus && (
                      <span className="absolute -top-2 right-3 bg-[#FFD700] text-black text-[10px] px-2 py-0.5 rounded-full font-semibold">
                        {pkg.bonus}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <Coins size={16} className="text-[#FFD700]" />
                      <span className="font-bold text-white">{pkg.label}</span>
                    </div>
                    <span className="text-lg font-bold text-[#7A5AF8]">${pkg.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Payment Method</h3>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    disabled={!method.enabled}
                    className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      selectedPayment === method.id
                        ? "border-[#7A5AF8] bg-[#7A5AF8]/10"
                        : "border-[#27272A] hover:border-[#3A3A3D]"
                    } ${!method.enabled && "opacity-50 cursor-not-allowed"}`}
                  >
                    {getPaymentIcon(method.id)}
                    <span className="font-medium text-white">{method.name}</span>
                    {selectedPayment === method.id && (
                      <Check size={16} className="text-[#7A5AF8] ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Purchase Button */}
            <button
              onClick={handlePurchase}
              disabled={!selectedPackage || !selectedPayment || processing}
              className="w-full bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] text-white py-4 rounded-xl font-bold text-lg hover:from-[#6D4CE5] hover:to-[#8B5CF6] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size={20} className="animate-spin" />
                  Processing...
                </span>
              ) : selectedPackage ? (
                `Buy ${selectedPackage.label} for $${selectedPackage.price.toFixed(2)}`
              ) : (
                "Select a package"
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-[#555555] text-center">
              All purchases are final. Bits do not expire and cannot be refunded.
              By purchasing, you agree to our Terms of Service.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
