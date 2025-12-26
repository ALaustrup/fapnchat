/**
 * WYA!? — Block User API (Alpha)
 * 
 * POST /api/users/[userId]/block
 * Block a user (prevents all interaction)
 */

import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * POST /api/users/[userId]/block
 * Block a user
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

    const blockerId = session.user.id;
    const blockedId = params.userId;

    if (blockerId === blockedId) {
      return Response.json({ error: "Cannot block yourself" }, { status: 400 });
    }

    // Check if already blocked
    const existing = await sql`
      SELECT * FROM blocks 
      WHERE blocker_id = ${blockerId} AND blocked_id = ${blockedId}
    `;

    if (existing.length > 0) {
      return Response.json({ success: true, already_blocked: true });
    }

    // Create block (mutual blocking enforced at application layer)
    await sql`
      INSERT INTO blocks (blocker_id, blocked_id)
      VALUES (${blockerId}, ${blockedId})
      ON CONFLICT (blocker_id, blocked_id) DO NOTHING
    `;

    // Remove from any group rooms (leave rooms where blocked user is present)
    // This is a safety measure - user won't see blocked user's messages
    const sharedRooms = await sql`
      SELECT DISTINCT cp1.chat_id
      FROM chat_participants cp1
      JOIN chat_participants cp2 ON cp1.chat_id = cp2.chat_id
      WHERE cp1.user_id = ${blockerId} 
        AND cp2.user_id = ${blockedId}
        AND cp1.is_banned = false
        AND cp2.is_banned = false
    `;

    // Note: We don't auto-leave rooms, but the UI should filter blocked users
    // This is a design decision - blocking hides content, doesn't force exit

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST /api/users/[userId]/block error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/users/[userId]/block
 * Unblock a user
 */
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const blockerId = session.user.id;
    const blockedId = params.userId;

    const result = await sql`
      DELETE FROM blocks 
      WHERE blocker_id = ${blockerId} AND blocked_id = ${blockedId}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: "User not blocked" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/users/[userId]/block error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

