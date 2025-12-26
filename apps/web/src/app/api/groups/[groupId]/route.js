/**
 * WYA!? — Group Room Details API (Alpha)
 * 
 * Endpoints:
 * - GET /api/groups/[groupId] - Get room details with participants
 * - PATCH /api/groups/[groupId] - Update room settings (OWNR only)
 * - DELETE /api/groups/[groupId] - Delete room (OWNR only)
 */

import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * GET /api/groups/[groupId]
 * Get room details with participants and presence
 * 
 * Response:
 * {
 *   room: { id, room_name, description, owner_id, ... },
 *   participants: Array<{ user_id, role, joined_at, display_name, avatar_url, ... }>,
 *   userRole: 'OWNR' | 'MOD' | 'USER' | null,
 *   presence: Array<{ user_id, status, activity, ... }>
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

    // Get room
    const rooms = await sql`
      SELECT 
        c.*,
        up.display_name as owner_display_name,
        up.avatar_url as owner_avatar_url
      FROM chats c
      LEFT JOIN user_profiles up ON c.owner_id = up.user_id
      WHERE c.id = ${groupId} AND c.chat_type = 'group'
    `;

    if (rooms.length === 0) {
      return Response.json({ error: "Room not found" }, { status: 404 });
    }

    const room = rooms[0];

    // Check if private room and user has access
    if (!room.is_public && userId) {
      const membership = await sql`
        SELECT * FROM chat_participants 
        WHERE chat_id = ${groupId} AND user_id = ${userId} AND is_banned = false
      `;
      if (membership.length === 0) {
        return Response.json({ 
          error: "Access denied", 
          requires_invite: true 
        }, { status: 403 });
      }
    }

    // Get participants with profiles
    const participants = await sql`
      SELECT 
        cp.*,
        up.display_name,
        up.avatar_url,
        p.status as presence_status,
        p.activity as presence_activity,
        p.last_seen_at as presence_last_seen
      FROM chat_participants cp
      LEFT JOIN user_profiles up ON cp.user_id = up.user_id
      LEFT JOIN presence p ON cp.user_id = p.user_id
      WHERE cp.chat_id = ${groupId} AND cp.is_banned = false
      ORDER BY 
        CASE cp.role 
          WHEN 'OWNR' THEN 1 
          WHEN 'MOD' THEN 2 
          ELSE 3 
        END,
        cp.joined_at ASC
    `;

    // Get user's role if logged in
    let userRole = null;
    if (userId) {
      const userMembership = participants.find(p => p.user_id === userId);
      userRole = userMembership?.role || null;
    }

    // Get presence for participants
    const presence = participants
      .filter(p => p.presence_status)
      .map(p => ({
        user_id: p.user_id,
        status: p.presence_status,
        activity: p.presence_activity,
        last_seen_at: p.presence_last_seen,
      }));

    return Response.json({ room, participants, userRole, presence });
  } catch (err) {
    console.error("GET /api/groups/[groupId] error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PATCH /api/groups/[groupId]
 * Update room settings (OWNR only)
 * 
 * Body:
 * {
 *   room_name?: string
 *   description?: string
 *   is_public?: boolean
 *   max_participants?: number (max: 10)
 *   background_color?: string
 *   music_url?: string
 *   music_provider?: 'spotify' | 'soundcloud'
 * }
 */
export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groupId = parseInt(params.groupId);
    if (isNaN(groupId)) {
      return Response.json({ error: "Invalid room ID" }, { status: 400 });
    }

    // Check if user is owner
    const rooms = await sql`
      SELECT * FROM chats 
      WHERE id = ${groupId} AND owner_id = ${session.user.id} AND chat_type = 'group'
    `;

    if (rooms.length === 0) {
      return Response.json({ error: "Not authorized to edit this room" }, { status: 403 });
    }

    const body = await request.json();
    const {
      room_name,
      description,
      is_public,
      max_participants,
      background_color,
      music_url,
      music_provider,
    } = body;

    // Enforce Alpha limit
    let participants = max_participants;
    if (participants !== undefined) {
      participants = Math.min(Math.max(1, participants), 10);
    }

    const result = await sql`
      UPDATE chats SET
        room_name = COALESCE(${room_name}, room_name),
        description = COALESCE(${description}, description),
        is_public = COALESCE(${is_public}, is_public),
        max_participants = COALESCE(${participants}, max_participants),
        background_color = COALESCE(${background_color}, background_color),
        music_url = COALESCE(${music_url}, music_url),
        music_provider = COALESCE(${music_provider}, music_provider)
      WHERE id = ${groupId}
      RETURNING *
    `;

    return Response.json({ room: result[0] });
  } catch (err) {
    console.error("PATCH /api/groups/[groupId] error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/groups/[groupId]
 * Delete room (OWNR only)
 */
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groupId = parseInt(params.groupId);
    if (isNaN(groupId)) {
      return Response.json({ error: "Invalid room ID" }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM chats 
      WHERE id = ${groupId} AND owner_id = ${session.user.id} AND chat_type = 'group'
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: "Not authorized to delete this room" }, { status: 403 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/groups/[groupId] error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

