/**
 * WYA!? — Reports API (Alpha)
 * 
 * Purpose: General reporting system for users, messages, rooms
 * 
 * Endpoints:
 * - GET /api/reports - List reports (moderator only)
 * - POST /api/reports - Create a report
 */

import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * GET /api/reports
 * List reports (moderator only)
 * 
 * Query params:
 * - status?: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
 * - limit?: number (default: 50)
 * 
 * Response:
 * {
 *   reports: Array<{ id, reporter_id, report_type, status, created_at, ... }>
 * }
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Check moderator permissions
    // For Alpha, we'll allow any authenticated user to view reports
    // Beta+ will require explicit moderator role

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    let reports;
    if (status) {
      reports = await sql`
        SELECT 
          r.*,
          up_reporter.display_name as reporter_display_name,
          up_reported.display_name as reported_display_name,
          up_moderator.display_name as moderator_display_name
        FROM reports r
        LEFT JOIN user_profiles up_reporter ON r.reporter_id = up_reporter.user_id
        LEFT JOIN user_profiles up_reported ON r.reported_user_id = up_reported.user_id
        LEFT JOIN user_profiles up_moderator ON r.reviewed_by = up_moderator.user_id
        WHERE r.status = ${status}
        ORDER BY r.created_at DESC
        LIMIT ${limit}
      `;
    } else {
      reports = await sql`
        SELECT 
          r.*,
          up_reporter.display_name as reporter_display_name,
          up_reported.display_name as reported_display_name,
          up_moderator.display_name as moderator_display_name
        FROM reports r
        LEFT JOIN user_profiles up_reporter ON r.reporter_id = up_reporter.user_id
        LEFT JOIN user_profiles up_reported ON r.reported_user_id = up_reported.user_id
        LEFT JOIN user_profiles up_moderator ON r.reviewed_by = up_moderator.user_id
        ORDER BY r.created_at DESC
        LIMIT ${limit}
      `;
    }

    return Response.json({ reports });
  } catch (err) {
    console.error("GET /api/reports error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/reports
 * Create a report
 * 
 * Body:
 * {
 *   report_type: 'harassment' | 'spam' | 'inappropriate' | 'abuse' | 'scam' | 'other' (required)
 *   description: string (required)
 *   reported_user_id?: string
 *   reported_chat_id?: number
 *   reported_message_id?: number
 *   reported_room_id?: number
 * }
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const {
      report_type,
      description,
      reported_user_id,
      reported_chat_id,
      reported_message_id,
      reported_room_id,
    } = body;

    if (!report_type || !description?.trim()) {
      return Response.json({
        error: "Report type and description required",
      }, { status: 400 });
    }

    const validTypes = [
      "harassment",
      "spam",
      "inappropriate",
      "abuse",
      "scam",
      "other",
    ];
    if (!validTypes.includes(report_type)) {
      return Response.json({ error: "Invalid report type" }, { status: 400 });
    }

    // Build context snapshot
    const contextSnapshot = {
      reported_at: new Date().toISOString(),
    };

    // Get message context if reporting a message
    if (reported_message_id) {
      const message = await sql`
        SELECT * FROM messages WHERE id = ${reported_message_id}
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

    // Get user context if reporting a user
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

    // Get chat context if reporting a chat
    if (reported_chat_id) {
      const chat = await sql`
        SELECT * FROM chats WHERE id = ${reported_chat_id}
      `;
      if (chat.length > 0) {
        contextSnapshot.chat = {
          id: chat[0].id,
          chat_type: chat[0].chat_type,
          room_name: chat[0].room_name,
        };
      }
    }

    // Create report
    const result = await sql`
      INSERT INTO reports (
        reporter_id,
        reported_user_id,
        reported_chat_id,
        reported_message_id,
        reported_room_id,
        report_type,
        description,
        context_snapshot,
        status
      )
      VALUES (
        ${userId},
        ${reported_user_id || null},
        ${reported_chat_id || null},
        ${reported_message_id || null},
        ${reported_room_id || null},
        ${report_type},
        ${description.trim()},
        ${JSON.stringify(contextSnapshot)}::jsonb,
        'pending'
      )
      RETURNING *
    `;

    return Response.json({ report: result[0] });
  } catch (err) {
    console.error("POST /api/reports error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

