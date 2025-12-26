/**
 * WYA!? — Message Reactions API (Alpha)
 * 
 * POST /api/groups/[groupId]/messages/[messageId]/reactions
 * Add or remove a reaction to a message
 */

import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * POST /api/groups/[groupId]/messages/[messageId]/reactions
 * Toggle a reaction on a message
 * 
 * Body:
 * {
 *   emoji: string (required, e.g., "👍", "❤️", "😂")
 * }
 * 
 * Response:
 * {
 *   message: { id, reactions, ... }
 * }
 */
export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groupId = parseInt(params.groupId);
    const messageId = parseInt(params.messageId);
    const userId = session.user.id;

    if (isNaN(groupId) || isNaN(messageId)) {
      return Response.json({ error: "Invalid room or message ID" }, { status: 400 });
    }

    // Check if user is participant
    const membership = await sql`
      SELECT * FROM chat_participants 
      WHERE chat_id = ${groupId} AND user_id = ${userId} AND is_banned = false
    `;

    if (membership.length === 0) {
      return Response.json({ error: "You are not a member of this room" }, { status: 403 });
    }

    // Get message
    const messages = await sql`
      SELECT * FROM messages 
      WHERE id = ${messageId} AND chat_id = ${groupId}
    `;

    if (messages.length === 0) {
      return Response.json({ error: "Message not found" }, { status: 404 });
    }

    const message = messages[0];
    const body = await request.json();
    const { emoji } = body;

    if (!emoji || typeof emoji !== 'string') {
      return Response.json({ error: "Emoji required" }, { status: 400 });
    }

    // Get current reactions (default to empty object)
    const reactions = message.reactions || {};

    // Toggle reaction
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }

    const userIndex = reactions[emoji].indexOf(userId);
    if (userIndex >= 0) {
      // Remove reaction
      reactions[emoji].splice(userIndex, 1);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    } else {
      // Add reaction
      reactions[emoji].push(userId);
    }

    // Update message
    const result = await sql`
      UPDATE messages
      SET reactions = ${JSON.stringify(reactions)}::jsonb
      WHERE id = ${messageId}
      RETURNING *
    `;

    return Response.json({ message: result[0] });
  } catch (err) {
    console.error("POST /api/groups/[groupId]/messages/[messageId]/reactions error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

