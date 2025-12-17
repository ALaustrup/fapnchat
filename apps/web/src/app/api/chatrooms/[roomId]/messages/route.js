import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const roomId = params.roomId;

    const messages = await sql`
      SELECT crm.*, up.display_name, u.email
      FROM chat_room_messages crm
      LEFT JOIN user_profiles up ON crm.user_id = up.user_id
      LEFT JOIN auth_users u ON crm.user_id = u.id
      WHERE crm.room_id = ${roomId}
      ORDER BY crm.created_at ASC
      LIMIT 100
    `;

    return Response.json({ messages });
  } catch (err) {
    console.error("GET /api/chatrooms/[roomId]/messages error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const roomId = params.roomId;
    const body = await request.json();
    const { message } = body || {};

    if (!message) {
      return Response.json({ error: "Message required" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO chat_room_messages (room_id, user_id, message)
      VALUES (${roomId}, ${userId}, ${message})
      RETURNING *
    `;

    return Response.json({ message: result[0] });
  } catch (err) {
    console.error("POST /api/chatrooms/[roomId]/messages error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
