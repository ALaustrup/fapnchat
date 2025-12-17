import { auth } from "@/auth";
import sql from "../../utils/sql";

// POST - Send bits to another user
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipient_id, amount, message, context } = await request.json();

    if (!recipient_id || !amount) {
      return Response.json({ error: "Recipient and amount required" }, { status: 400 });
    }

    if (amount < 1) {
      return Response.json({ error: "Minimum tip is 1 bit" }, { status: 400 });
    }

    if (recipient_id === session.user.id) {
      return Response.json({ error: "Cannot tip yourself" }, { status: 400 });
    }

    // Check sender balance
    const senderBalance = await sql`
      SELECT balance FROM user_bits WHERE user_id = ${session.user.id}
    `;

    if (senderBalance.length === 0 || senderBalance[0].balance < amount) {
      return Response.json({ error: "Insufficient bits" }, { status: 400 });
    }

    // Check recipient exists
    const recipient = await sql`
      SELECT id, name, email FROM auth_users WHERE id = ${recipient_id}
    `;

    if (recipient.length === 0) {
      return Response.json({ error: "Recipient not found" }, { status: 404 });
    }

    // Deduct from sender
    await sql`
      UPDATE user_bits SET balance = balance - ${amount} WHERE user_id = ${session.user.id}
    `;

    // Add to recipient (create if doesn't exist)
    await sql`
      INSERT INTO user_bits (user_id, balance)
      VALUES (${recipient_id}, ${amount})
      ON CONFLICT (user_id) DO UPDATE SET balance = user_bits.balance + ${amount}
    `;

    // Record the transaction
    await sql`
      INSERT INTO bits_transactions (sender_id, recipient_id, amount, message, context)
      VALUES (${session.user.id}, ${recipient_id}, ${amount}, ${message || null}, ${context || 'direct'})
    `;

    // Get updated sender balance
    const newBalance = await sql`
      SELECT balance FROM user_bits WHERE user_id = ${session.user.id}
    `;

    return Response.json({
      success: true,
      amount_sent: amount,
      recipient_name: recipient[0].name || recipient[0].email,
      new_balance: newBalance[0].balance,
    });
  } catch (error) {
    console.error("Error sending tip:", error);
    return Response.json({ error: "Failed to send tip" }, { status: 500 });
  }
}

// GET - Get tip history
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // 'sent', 'received', 'all'

    let transactions;
    if (type === "sent") {
      transactions = await sql`
        SELECT t.*, u.name as recipient_name, u.email as recipient_email
        FROM bits_transactions t
        JOIN auth_users u ON t.recipient_id = u.id
        WHERE t.sender_id = ${session.user.id}
        ORDER BY t.created_at DESC
        LIMIT 50
      `;
    } else if (type === "received") {
      transactions = await sql`
        SELECT t.*, u.name as sender_name, u.email as sender_email
        FROM bits_transactions t
        JOIN auth_users u ON t.sender_id = u.id
        WHERE t.recipient_id = ${session.user.id}
        ORDER BY t.created_at DESC
        LIMIT 50
      `;
    } else {
      transactions = await sql`
        SELECT t.*,
          sender.name as sender_name, sender.email as sender_email,
          recipient.name as recipient_name, recipient.email as recipient_email
        FROM bits_transactions t
        JOIN auth_users sender ON t.sender_id = sender.id
        JOIN auth_users recipient ON t.recipient_id = recipient.id
        WHERE t.sender_id = ${session.user.id} OR t.recipient_id = ${session.user.id}
        ORDER BY t.created_at DESC
        LIMIT 50
      `;
    }

    return Response.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return Response.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

