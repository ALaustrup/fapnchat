import { auth } from "@/auth";
import sql from "../utils/sql";

// GET - Get user's bits balance
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user bits balance
    const result = await sql`
      SELECT balance FROM user_bits WHERE user_id = ${session.user.id}
    `;

    if (result.length === 0) {
      // Create initial balance of 0
      await sql`
        INSERT INTO user_bits (user_id, balance) VALUES (${session.user.id}, 0)
        ON CONFLICT (user_id) DO NOTHING
      `;
      return Response.json({ balance: 0 });
    }

    return Response.json({ balance: result[0].balance });
  } catch (error) {
    console.error("Error fetching bits balance:", error);
    return Response.json({ error: "Failed to fetch balance" }, { status: 500 });
  }
}

// POST - Purchase bits (placeholder for payment integration)
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { package_id, payment_method, payment_token } = await request.json();

    // Bits packages
    const packages = {
      bits_100: { bits: 100, price: 0.5 },
      bits_500: { bits: 500, price: 2.5 },
      bits_1000: { bits: 1000, price: 5.0 },
      bits_2500: { bits: 2500, price: 10.0 },
      bits_5000: { bits: 5000, price: 20.0 },
      bits_10000: { bits: 10000, price: 35.0 },
    };

    const selectedPackage = packages[package_id];
    if (!selectedPackage) {
      return Response.json({ error: "Invalid package" }, { status: 400 });
    }

    // TODO: Process payment based on payment_method
    // payment_method can be: 'stripe', 'cashapp', 'metamask', 'coinbase', 'phantom'
    // For now, we'll simulate successful payment

    // Record the purchase
    await sql`
      INSERT INTO bits_purchases (user_id, package_id, bits_amount, price_usd, payment_method, payment_token, status)
      VALUES (${session.user.id}, ${package_id}, ${selectedPackage.bits}, ${selectedPackage.price}, ${payment_method || 'pending'}, ${payment_token || null}, 'completed')
    `;

    // Add bits to user balance
    await sql`
      INSERT INTO user_bits (user_id, balance)
      VALUES (${session.user.id}, ${selectedPackage.bits})
      ON CONFLICT (user_id) DO UPDATE SET balance = user_bits.balance + ${selectedPackage.bits}
    `;

    // Get updated balance
    const result = await sql`
      SELECT balance FROM user_bits WHERE user_id = ${session.user.id}
    `;

    return Response.json({
      success: true,
      bits_added: selectedPackage.bits,
      new_balance: result[0].balance,
    });
  } catch (error) {
    console.error("Error purchasing bits:", error);
    return Response.json({ error: "Failed to purchase bits" }, { status: 500 });
  }
}

