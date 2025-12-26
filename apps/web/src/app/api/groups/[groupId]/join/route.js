/**
 * WYA!? — Join Group Room API (Alpha)
 * 
 * POST /api/groups/[groupId]/join
 * Join a group room (invite-based or public)
 */

import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * POST /api/groups/[groupId]/join
 * Join a group room
 * 
 * Body (optional):
 * {
 *   invite_token?: string (for private rooms)
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   participant: { chat_id, user_id, role, joined_at }
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

    // Get room
    const rooms = await sql`
      SELECT * FROM chats 
      WHERE id = ${groupId} AND chat_type = 'group'
    `;

    if (rooms.length === 0) {
      return Response.json({ error: "Room not found" }, { status: 404 });
    }

    const room = rooms[0];

    // Check if already a participant
    const existing = await sql`
      SELECT * FROM chat_participants 
      WHERE chat_id = ${groupId} AND user_id = ${userId}
    `;

    if (existing.length > 0) {
      if (existing[0].is_banned) {
        return Response.json({ error: "You are banned from this room" }, { status: 403 });
      }
      // Already a member
      return Response.json({ 
        success: true, 
        participant: existing[0],
        already_member: true 
      });
    }

    // Check if room is full (Alpha limit: 10)
    const participantCount = await sql`
      SELECT COUNT(*)::int as count
      FROM chat_participants
      WHERE chat_id = ${groupId} AND is_banned = false
    `;

    if (participantCount[0].count >= room.max_participants) {
      return Response.json({ error: "Room is full" }, { status: 403 });
    }

    // Check if private room (invite-based)
    // For Alpha, private rooms require explicit invite (handled by owner adding participants)
    // Public rooms can be joined freely
    if (!room.is_public) {
      return Response.json({ 
        error: "This room is invite-only",
        requires_invite: true 
      }, { status: 403 });
    }

    // Add participant
    const result = await sql`
      INSERT INTO chat_participants (chat_id, user_id, role)
      VALUES (${groupId}, ${userId}, 'USER')
      RETURNING *
    `;

    // Update presence
    await sql`
      INSERT INTO presence (user_id, status, activity, current_chat_id, last_seen_at, updated_at)
      VALUES (${userId}, 'online', 'chatting', ${groupId}, NOW(), NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        status = 'online',
        activity = 'chatting',
        current_chat_id = ${groupId},
        last_seen_at = NOW(),
        updated_at = NOW()
    `;

    return Response.json({ success: true, participant: result[0] });
  } catch (err) {
    console.error("POST /api/groups/[groupId]/join error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

