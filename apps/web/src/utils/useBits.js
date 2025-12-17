import { useState, useEffect, useCallback } from "react";

export default function useBits() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/bits");
      if (!res.ok) throw new Error("Failed to fetch balance");
      const data = await res.json();
      setBalance(data.balance);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const purchaseBits = async (packageId, paymentMethod, paymentToken) => {
    try {
      const res = await fetch("/api/bits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_id: packageId,
          payment_method: paymentMethod,
          payment_token: paymentToken,
        }),
      });
      if (!res.ok) throw new Error("Purchase failed");
      const data = await res.json();
      setBalance(data.new_balance);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const sendTip = async (recipientId, amount, message, context) => {
    try {
      const res = await fetch("/api/bits/tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: recipientId,
          amount,
          message,
          context,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Tip failed");
      }
      const data = await res.json();
      setBalance(data.new_balance);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
    purchaseBits,
    sendTip,
  };
}

