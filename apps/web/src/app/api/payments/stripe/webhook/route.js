import sql from "@/app/api/utils/sql";

// Stripe webhook handler
// This endpoint receives events from Stripe when payments are completed

// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    // Uncomment when Stripe is installed:
    /*
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { user_id, package_id, bits } = session.metadata;

        // Check if already processed
        const existing = await sql`
          SELECT id FROM bits_purchases WHERE payment_id = ${session.payment_intent}
        `;
        
        if (existing.length > 0) {
          console.log("Payment already processed:", session.payment_intent);
          break;
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
          VALUES (${user_id}, ${package_id}, ${parseInt(bits)}, ${session.amount_total / 100}, 'stripe', ${session.payment_intent}, 'completed')
        `;

        console.log("Bits added for user:", user_id, "Amount:", bits);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log("PaymentIntent succeeded:", paymentIntent.id);
        // Handle if using Payment Intents directly
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log("Payment failed:", paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    */

    return Response.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

// Disable body parsing for webhooks (Stripe needs raw body)
export const config = {
  api: {
    bodyParser: false,
  },
};

