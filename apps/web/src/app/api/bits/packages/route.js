// GET - Get available bits packages
export async function GET() {
  const packages = [
    { id: "bits_100", bits: 100, price: 0.5, label: "100 Bits", popular: false },
    { id: "bits_500", bits: 500, price: 2.5, label: "500 Bits", popular: false },
    { id: "bits_1000", bits: 1000, price: 5.0, label: "1,000 Bits", popular: true },
    { id: "bits_2500", bits: 2500, price: 10.0, label: "2,500 Bits", popular: false },
    { id: "bits_5000", bits: 5000, price: 20.0, label: "5,000 Bits", popular: false },
    { id: "bits_10000", bits: 10000, price: 35.0, label: "10,000 Bits", bonus: "Best Value!", popular: false },
  ];

  const paymentMethods = [
    { id: "stripe", name: "Credit/Debit Card", icon: "💳", enabled: true },
    { id: "cashapp", name: "Cash App Pay", icon: "💵", enabled: true },
    { id: "metamask", name: "MetaMask", icon: "🦊", enabled: true },
    { id: "coinbase", name: "Coinbase Wallet", icon: "🔵", enabled: true },
    { id: "phantom", name: "Phantom (Solana)", icon: "👻", enabled: true },
  ];

  return Response.json({ packages, paymentMethods });
}

