import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const otherUserId = params.userId;

    const messages = await sql`
      SELECT pm.*, up.display_name, u.email
      FROM private_messages pm
      LEFT JOIN user_profiles up ON pm.sender_id = up.user_id
      LEFT JOIN auth_users u ON pm.sender_id = u.id
      WHERE 
        (pm.sender_id = ${currentUserId} AND pm.recipient_id = ${otherUserId})
        OR (pm.sender_id = ${otherUserId} AND pm.recipient_id = ${currentUserId})
      ORDER BY pm.created_at ASC
    `;

    // Mark as read
    await sql`
      UPDATE private_messages 
      SET read_status = true 
      WHERE recipient_id = ${currentUserId} AND sender_id = ${otherUserId}
    `;

    return Response.json({ messages });
  } catch (err) {
    console.error("GET /api/messages/[userId] error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
