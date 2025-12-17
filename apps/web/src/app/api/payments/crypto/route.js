import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

// Crypto payment handler for MetaMask, Coinbase, Phantom
// This creates payment requests and verifies on-chain transactions

const BITS_PACKAGES = {
  bits_100: { bits: 100, priceUsd: 0.5 },
  bits_500: { bits: 500, priceUsd: 2.5 },
  bits_1000: { bits: 1000, priceUsd: 5.0 },
  bits_2500: { bits: 2500, priceUsd: 10.0 },
  bits_5000: { bits: 5000, priceUsd: 20.0 },
  bits_10000: { bits: 10000, priceUsd: 35.0 },
};

// Wallet addresses for receiving payments (set these in env)
const WALLET_ADDRESSES = {
  ethereum: process.env.ETH_WALLET_ADDRESS,
  solana: process.env.SOL_WALLET_ADDRESS,
};

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, package_id, wallet_type, tx_hash, chain } = body;

    if (action === "create-payment") {
      const pkg = BITS_PACKAGES[package_id];
      if (!pkg) {
        return Response.json({ error: "Invalid package" }, { status: 400 });
      }

      // Generate unique payment ID
      const paymentId = `crypto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Get current crypto prices (in production, use a price oracle)
      // For now, use placeholder rates
      const rates = {
        ETH: 2000, // 1 ETH = $2000
        SOL: 100,  // 1 SOL = $100
        USDC: 1,
        USDT: 1,
      };

      const walletAddress = wallet_type === "phantom" 
        ? WALLET_ADDRESSES.solana 
        : WALLET_ADDRESSES.ethereum;

      // Calculate amounts
      const amounts = {
        ETH: (pkg.priceUsd / rates.ETH).toFixed(6),
        SOL: (pkg.priceUsd / rates.SOL).toFixed(4),
        USDC: pkg.priceUsd.toFixed(2),
        USDT: pkg.priceUsd.toFixed(2),
      };

      // Store pending payment
      await sql`
        INSERT INTO crypto_payments (payment_id, user_id, package_id, bits_amount, price_usd, wallet_type, status)
        VALUES (${paymentId}, ${session.user.id}, ${package_id}, ${pkg.bits}, ${pkg.priceUsd}, ${wallet_type}, 'pending')
      `;

      return Response.json({
        paymentId,
        walletAddress,
        amounts,
        priceUsd: pkg.priceUsd,
        bits: pkg.bits,
        expiresIn: 30 * 60, // 30 minutes
      });
    }

    if (action === "verify-payment") {
      const { payment_id } = body;

      if (!tx_hash || !payment_id) {
        return Response.json({ error: "Transaction hash and payment ID required" }, { status: 400 });
      }

      // Get pending payment
      const payments = await sql`
        SELECT * FROM crypto_payments 
        WHERE payment_id = ${payment_id} AND user_id = ${session.user.id} AND status = 'pending'
      `;

      if (payments.length === 0) {
        return Response.json({ error: "Payment not found or already processed" }, { status: 404 });
      }

      const payment = payments[0];

      // In production, verify the transaction on-chain:
      // - For Ethereum: Use ethers.js or web3.js to check tx receipt
      // - For Solana: Use @solana/web3.js to confirm transaction
      // - Verify amount, recipient, and confirmation count

      // For now, mark as completed (DEMO ONLY - remove in production!)
      await sql`
        UPDATE crypto_payments 
        SET status = 'completed', tx_hash = ${tx_hash}, completed_at = NOW()
        WHERE payment_id = ${payment_id}
      `;

      // Add bits to user
      await sql`
        INSERT INTO user_bits (user_id, balance)
        VALUES (${session.user.id}, ${payment.bits_amount})
        ON CONFLICT (user_id) DO UPDATE SET balance = user_bits.balance + ${payment.bits_amount}
      `;

      // Record in bits_purchases
      await sql`
        INSERT INTO bits_purchases (user_id, package_id, bits_amount, price_usd, payment_method, payment_id, status)
        VALUES (${session.user.id}, ${payment.package_id}, ${payment.bits_amount}, ${payment.price_usd}, ${payment.wallet_type}, ${tx_hash}, 'completed')
      `;

      const newBalance = await sql`SELECT balance FROM user_bits WHERE user_id = ${session.user.id}`;

      return Response.json({
        success: true,
        bits_added: payment.bits_amount,
        new_balance: newBalance[0].balance,
      });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("POST /api/payments/crypto error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("payment_id");

    if (paymentId) {
      // Check payment status
      const payments = await sql`
        SELECT * FROM crypto_payments 
        WHERE payment_id = ${paymentId} AND user_id = ${session.user.id}
      `;

      if (payments.length === 0) {
        return Response.json({ error: "Payment not found" }, { status: 404 });
      }

      return Response.json({ payment: payments[0] });
    }

    // Get user's crypto payment history
    const payments = await sql`
      SELECT * FROM crypto_payments 
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    return Response.json({ payments });
  } catch (err) {
    console.error("GET /api/payments/crypto error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

