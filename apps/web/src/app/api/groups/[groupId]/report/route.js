/**
 * WYA!? — Report Group Room API (Alpha)
 * 
 * POST /api/groups/[groupId]/report
 * Report a group room or user in the room
 */

import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * POST /api/groups/[groupId]/report
 * Report a group room, user, or message
 * 
 * Body:
 * {
 *   report_type: 'harassment' | 'spam' | 'inappropriate' | 'abuse' | 'scam' | 'other' (required)
 *   description: string (required)
 *   reported_user_id?: string (if reporting a user)
 *   reported_message_id?: number (if reporting a message)
 * }
 * 
 * Response:
 * {
 *   report: { id, reporter_id, report_type, status, ... }
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
    const body = await request.json();
    const { report_type, description, reported_user_id, reported_message_id } = body;

    if (!report_type || !description?.trim()) {
      return Response.json({ 
        error: "Report type and description required" 
      }, { status: 400 });
    }

    const validTypes = ['harassment', 'spam', 'inappropriate', 'abuse', 'scam', 'other'];
    if (!validTypes.includes(report_type)) {
      return Response.json({ error: "Invalid report type" }, { status: 400 });
    }

    // Get room context snapshot
    const room = await sql`
      SELECT * FROM chats WHERE id = ${groupId} AND chat_type = 'group'
    `;

    if (room.length === 0) {
      return Response.json({ error: "Room not found" }, { status: 404 });
    }

    // Build context snapshot
    const contextSnapshot = {
      room_id: groupId,
      room_name: room[0].room_name,
      reported_at: new Date().toISOString(),
    };

    if (reported_message_id) {
      const message = await sql`
        SELECT * FROM messages WHERE id = ${reported_message_id} AND chat_id = ${groupId}
      `;
      if (message.length > 0) {
        contextSnapshot.message = {
          id: message[0].id,
          sender_id: message[0].sender_id,
          message_text: message[0].message_text,
          created_at: message[0].created_at,
        };
      }
    }

    if (reported_user_id) {
      const userProfile = await sql`
        SELECT * FROM user_profiles WHERE user_id = ${reported_user_id}
      `;
      if (userProfile.length > 0) {
        contextSnapshot.reported_user = {
          user_id: reported_user_id,
          display_name: userProfile[0].display_name,
        };
      }
    }

    // Create report
    const result = await sql`
      INSERT INTO reports (
        reporter_id,
        reported_chat_id,
        reported_user_id,
        reported_message_id,
        report_type,
        description,
        context_snapshot,
        status
      )
      VALUES (
        ${userId},
        ${groupId},
        ${reported_user_id || null},
        ${reported_message_id || null},
        ${report_type},
        ${description.trim()},
        ${JSON.stringify(contextSnapshot)}::jsonb,
        'pending'
      )
      RETURNING *
    `;

    return Response.json({ report: result[0] });
  } catch (err) {
    console.error("POST /api/groups/[groupId]/report error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

