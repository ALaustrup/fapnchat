import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get unique conversation partners
    const conversations = await sql`
      SELECT DISTINCT
        CASE 
          WHEN pm.sender_id = ${userId} THEN pm.recipient_id
          ELSE pm.sender_id
        END as id,
        up.display_name,
        u.email,
        (
          SELECT message 
          FROM private_messages 
          WHERE (sender_id = ${userId} AND recipient_id = CASE WHEN pm.sender_id = ${userId} THEN pm.recipient_id ELSE pm.sender_id END)
             OR (recipient_id = ${userId} AND sender_id = CASE WHEN pm.sender_id = ${userId} THEN pm.recipient_id ELSE pm.sender_id END)
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message
      FROM private_messages pm
      LEFT JOIN user_profiles up ON (CASE WHEN pm.sender_id = ${userId} THEN pm.recipient_id ELSE pm.sender_id END) = up.user_id
      LEFT JOIN auth_users u ON (CASE WHEN pm.sender_id = ${userId} THEN pm.recipient_id ELSE pm.sender_id END) = u.id
      WHERE pm.sender_id = ${userId} OR pm.recipient_id = ${userId}
      ORDER BY pm.created_at DESC
    `;

    return Response.json({ conversations });
  } catch (err) {
    console.error("GET /api/messages/conversations error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
