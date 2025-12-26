/**
 * WYA!? — Messages API (Alpha)
 * 
 * Purpose: 1:1 message sending with safety checks
 * 
 * Endpoints:
 * - POST /api/messages - Send message (with block/rate limit/content checks)
 * 
 * Safety:
 * - Block checks before delivery
 * - Rate limiting
 * - Content scan hook
 * - Age layer enforcement
 */

import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { requireChatAgeLayerMatch } from "@/utils/ageGateMiddleware";
import { validateMessage } from "@/utils/chatSafety";

/**
 * POST /api/messages
 * Send 1:1 message
 * 
 * Body:
 * {
 *   recipient_id: string (required)
 *   message_text: string (required)
 *   message_type: 'text' | 'image' | 'audio' (default: 'text')
 *   media_url?: string (for image/audio)
 * }
 * 
 * Response:
 * {
 *   message: { id, chat_id, sender_id, message_text, ... }
 * }
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const senderId = session.user.id;
    const body = await request.json();
    const { recipient_id, message_text, message_type = 'text', media_url } = body || {};

    if (!recipient_id || !message_text) {
      return Response.json(
        { error: "Recipient and message required" },
        { status: 400 },
      );
    }

    // Validate message type (Alpha: text, image, audio only)
    if (!['text', 'image', 'audio'].includes(message_type)) {
      return Response.json(
        { error: "Invalid message type. Alpha supports text, image, and audio only." },
        { status: 400 },
      );
    }

    // Check age layer match
    const ageCheck = await requireChatAgeLayerMatch(request, recipient_id);
    if (ageCheck.error) {
      return ageCheck.error; // 403 if age layers don't match
    }

    // Validate message (blocks, rate limit, content scan)
    const validation = await validateMessage(senderId, recipient_id, message_text);
    if (!validation.valid) {
      return Response.json(
        { error: validation.error },
        { status: 403 },
      );
    }

    // Get or create chat (1:1 conversation)
    // For 1:1, chat_id is derived from user IDs (deterministic)
    // Find existing chat or create new one
    let chat = await sql`
      SELECT id FROM chats
      WHERE chat_type = 'direct'
        AND (
          (owner_id = ${senderId} AND EXISTS (
            SELECT 1 FROM chat_participants WHERE chat_id = chats.id AND user_id = ${recipient_id}
          ))
          OR (owner_id = ${recipient_id} AND EXISTS (
            SELECT 1 FROM chat_participants WHERE chat_id = chats.id AND user_id = ${senderId}
          ))
        )
      LIMIT 1
    `;

    let chatId;
    if (chat.length === 0) {
      // Create new 1:1 chat
      const newChat = await sql`
        INSERT INTO chats (chat_type, owner_id)
        VALUES ('direct', ${senderId})
        RETURNING id
      `;
      chatId = newChat[0].id;

      // Add both participants
      await sql`
        INSERT INTO chat_participants (chat_id, user_id)
        VALUES (${chatId}, ${senderId}), (${chatId}, ${recipient_id})
      `;
    } else {
      chatId = chat[0].id;
    }

    // Insert message
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
        ${chatId},
        ${senderId},
        ${message_text},
        ${message_type},
        ${media_url || null},
        ${media_url ? JSON.stringify({ type: message_type }) : null}::jsonb
      )
      RETURNING *
    `;

    // TODO: Beta+ - Broadcast via WebSocket
    // For Alpha, WebSocket will handle real-time updates separately

    return Response.json({ message: result[0] });
  } catch (err) {
    console.error("POST /api/messages error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
