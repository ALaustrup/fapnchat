/**
 * WYA!? — Group Room Messages API (Alpha)
 * 
 * Endpoints:
 * - GET /api/groups/[groupId]/messages - Get messages
 * - POST /api/groups/[groupId]/messages - Send message
 */

import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { validateMessage } from "@/utils/chatSafety";

/**
 * GET /api/groups/[groupId]/messages
 * Get messages for a group room
 * 
 * Query params:
 * - limit?: number (default: 100)
 * - before?: number (message ID to paginate before)
 * 
 * Response:
 * {
 *   messages: Array<{ id, chat_id, sender_id, message_text, reactions, created_at, ... }>
 * }
 */
export async function GET(request, { params }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const groupId = parseInt(params.groupId);

    if (isNaN(groupId)) {
      return Response.json({ error: "Invalid room ID" }, { status: 400 });
    }

    // Check if user is participant
    if (userId) {
      const membership = await sql`
        SELECT * FROM chat_participants 
        WHERE chat_id = ${groupId} AND user_id = ${userId} AND is_banned = false
      `;
      if (membership.length === 0) {
        return Response.json({ error: "Access denied" }, { status: 403 });
      }
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const before = searchParams.get("before");

    let messages;
    if (before) {
      messages = await sql`
        SELECT 
          m.*,
          up.display_name as sender_display_name,
          up.avatar_url as sender_avatar_url
        FROM messages m
        LEFT JOIN user_profiles up ON m.sender_id = up.user_id
        WHERE m.chat_id = ${groupId} AND m.id < ${parseInt(before)} AND m.is_deleted = false
        ORDER BY m.created_at DESC
        LIMIT ${limit}
      `;
    } else {
      messages = await sql`
        SELECT 
          m.*,
          up.display_name as sender_display_name,
          up.avatar_url as sender_avatar_url
        FROM messages m
        LEFT JOIN user_profiles up ON m.sender_id = up.user_id
        WHERE m.chat_id = ${groupId} AND m.is_deleted = false
        ORDER BY m.created_at DESC
        LIMIT ${limit}
      `;
    }

    // Reverse to get chronological order
    messages.reverse();

    return Response.json({ messages });
  } catch (err) {
    console.error("GET /api/groups/[groupId]/messages error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/groups/[groupId]/messages
 * Send a message to a group room
 * 
 * Body:
 * {
 *   message_text: string (required)
 *   message_type?: 'text' | 'image' | 'audio' (default: 'text')
 *   media_url?: string (for image/audio)
 * }
 * 
 * Response:
 * {
 *   message: { id, chat_id, sender_id, message_text, ... }
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

    // Check if user is participant and not banned
    const membership = await sql`
      SELECT * FROM chat_participants 
      WHERE chat_id = ${groupId} AND user_id = ${userId} AND is_banned = false
    `;

    if (membership.length === 0) {
      return Response.json({ error: "You are not a member of this room" }, { status: 403 });
    }

    const body = await request.json();
    const { message_text, message_type = 'text', media_url, media_metadata } = body;

    if (!message_text?.trim() && !media_url) {
      return Response.json({ error: "Message text or media required" }, { status: 400 });
    }

    // Validate message (safety checks)
    // For group rooms, we validate against all participants
    // In Alpha, we do basic validation (rate limit, content scan)
    const validation = await validateMessage(userId, null, message_text || '');
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    // Create message
    const result = await sql`
      INSERT INTO messages (
        chat_id,
        sender_id,
        message_text,
        message_type,
        media_url,
        media_metadata
      )
      VALUES (
        ${groupId},
        ${userId},
        ${message_text?.trim() || null},
        ${message_type},
        ${media_url || null},
        ${media_metadata ? JSON.stringify(media_metadata) : null}
      )
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

    // Get sender profile for response
    const senderProfile = await sql`
      SELECT display_name, avatar_url FROM user_profiles WHERE user_id = ${userId}
    `;

    const message = {
      ...result[0],
      sender_display_name: senderProfile[0]?.display_name || null,
      sender_avatar_url: senderProfile[0]?.avatar_url || null,
    };

    return Response.json({ message });
  } catch (err) {
    console.error("POST /api/groups/[groupId]/messages error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

