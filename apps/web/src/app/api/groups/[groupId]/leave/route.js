/**
 * WYA!? — Leave Group Room API (Alpha)
 * 
 * POST /api/groups/[groupId]/leave
 * Leave a group room
 */

import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * POST /api/groups/[groupId]/leave
 * Leave a group room
 * 
 * Response:
 * {
 *   success: true
 * }
 */
export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groupId = parseInt(params.groupId);
    if (isNaN(groupId)) {
      return Response.json({ error: "Invalid room ID" }, { status: 400 });
    }

    const userId = session.user.id;

    // Check if user is owner
    const rooms = await sql`
      SELECT * FROM chats 
      WHERE id = ${groupId} AND owner_id = ${userId} AND chat_type = 'group'
    `;

    if (rooms.length > 0) {
      return Response.json({ 
        error: "Room owner cannot leave. Transfer ownership or delete the room instead." 
      }, { status: 400 });
    }

    // Remove participant
    const result = await sql`
      DELETE FROM chat_participants 
      WHERE chat_id = ${groupId} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: "You are not a member of this room" }, { status: 404 });
    }

    // Update presence (clear current_chat_id if it was this room)
    await sql`
      UPDATE presence
      SET current_chat_id = NULL, updated_at = NOW()
      WHERE user_id = ${userId} AND current_chat_id = ${groupId}
    `;

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST /api/groups/[groupId]/leave error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

