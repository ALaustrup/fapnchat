import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";
import Stripe from 'stripe';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

const BITS_PACKAGES = {
  bits_100: { bits: 100, price: 50, name: "100 Bits" }, // price in cents
  bits_500: { bits: 500, price: 250, name: "500 Bits" },
  bits_1000: { bits: 1000, price: 500, name: "1,000 Bits" },
  bits_2500: { bits: 2500, price: 1000, name: "2,500 Bits" },
  bits_5000: { bits: 5000, price: 2000, name: "5,000 Bits" },
  bits_10000: { bits: 10000, price: 3500, name: "10,000 Bits" },
};

// POST - Create checkout session or process payment
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, package_id, payment_method_id } = body;

    if (action === "create-checkout") {
      // Create Stripe Checkout Session
      const pkg = BITS_PACKAGES[package_id];
      if (!pkg) {
        return Response.json({ error: "Invalid package" }, { status: 400 });
      }

      const stripe = getStripe();
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: pkg.name,
                description: `Purchase ${pkg.bits} Bits for FapNChat`,
              },
              unit_amount: pkg.price,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?payment=cancelled`,
        metadata: {
          user_id: session.user.id,
          package_id: package_id,
          bits: pkg.bits.toString(),
        },
      });

      return Response.json({ 
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
      });
    }

    if (action === "create-payment-intent") {
      // Create Payment Intent for custom payment flow
      const pkg = BITS_PACKAGES[package_id];
      if (!pkg) {
        return Response.json({ error: "Invalid package" }, { status: 400 });
      }

      const stripe = getStripe();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: pkg.price,
        currency: 'usd',
        metadata: {
          user_id: session.user.id,
          package_id: package_id,
          bits: pkg.bits.toString(),
        },
      });

      return Response.json({
        clientSecret: paymentIntent.client_secret,
      });
    }

    if (action === "confirm-payment") {
      // Confirm payment and add bits (called after successful payment)
      const { payment_intent_id } = body;

      const stripe = getStripe();
      const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
      
      if (paymentIntent.status !== 'succeeded') {
        return Response.json({ error: "Payment not completed" }, { status: 400 });
      }

      const { user_id, package_id: pkgId, bits } = paymentIntent.metadata;
      
      if (user_id !== session.user.id) {
        return Response.json({ error: "Unauthorized" }, { status: 403 });
      }

      // Check if already processed
      const existing = await sql`
        SELECT id FROM bits_purchases WHERE payment_id = ${payment_intent_id}
      `;
      
      if (existing.length > 0) {
        return Response.json({ error: "Payment already processed" }, { status: 400 });
      }

      // Add bits to user
      await sql`
        INSERT INTO user_bits (user_id, balance)
        VALUES (${user_id}, ${parseInt(bits)})
        ON CONFLICT (user_id) DO UPDATE SET balance = user_bits.balance + ${parseInt(bits)}
      `;

      // Record purchase
      await sql`
        INSERT INTO bits_purchases (user_id, package_id, bits_amount, price_usd, payment_method, payment_id, status)
        VALUES (${user_id}, ${pkgId}, ${parseInt(bits)}, ${paymentIntent.amount / 100}, 'stripe', ${payment_intent_id}, 'completed')
      `;

      const newBalance = await sql`SELECT balance FROM user_bits WHERE user_id = ${user_id}`;

      return Response.json({
        success: true,
        bits_added: parseInt(bits),
        new_balance: newBalance[0].balance,
      });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("POST /api/payments/stripe error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

