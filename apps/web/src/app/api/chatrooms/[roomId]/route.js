import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GET - Get room details with members
export async function GET(request, { params }) {
  try {
    const session = await auth();
    const roomId = params.roomId;

    const rooms = await sql`
      SELECT cr.*,
        u.name as owner_name, u.email as owner_email,
        up.display_name as owner_display_name
      FROM chat_rooms cr
      LEFT JOIN auth_users u ON cr.owner_id = u.id
      LEFT JOIN user_profiles up ON cr.owner_id = up.user_id
      WHERE cr.id = ${roomId}
    `;

    if (rooms.length === 0) {
      return Response.json({ error: "Room not found" }, { status: 404 });
    }

    const room = rooms[0];

    // Check if private room and user has access
    if (!room.is_public && session?.user?.id) {
      const membership = await sql`
        SELECT * FROM chat_room_members 
        WHERE room_id = ${roomId} AND user_id = ${session.user.id} AND is_banned = false
      `;
      if (membership.length === 0) {
        return Response.json({ error: "Access denied", requires_password: true }, { status: 403 });
      }
    }

    // Get members with roles
    const members = await sql`
      SELECT crm.*, u.name, u.email, up.display_name, up.avatar_url
      FROM chat_room_members crm
      LEFT JOIN auth_users u ON crm.user_id = u.id
      LEFT JOIN user_profiles up ON crm.user_id = up.user_id
      WHERE crm.room_id = ${roomId} AND crm.is_banned = false
      ORDER BY 
        CASE crm.role 
          WHEN 'OWNR' THEN 1 
          WHEN 'MOD' THEN 2 
          WHEN 'AGENT' THEN 3 
          ELSE 4 
        END,
        crm.joined_at ASC
    `;

    // Get user's role if logged in
    let userRole = null;
    if (session?.user?.id) {
      const userMembership = members.find(m => m.user_id === session.user.id);
      userRole = userMembership?.role || null;
    }

    return Response.json({ room, members, userRole });
  } catch (err) {
    console.error("GET /api/chatrooms/[roomId] error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH - Update room settings (OWNR only)
export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roomId = params.roomId;

    // Check if user is owner
    const rooms = await sql`
      SELECT * FROM chat_rooms WHERE id = ${roomId} AND owner_id = ${session.user.id}
    `;

    if (rooms.length === 0) {
      return Response.json({ error: "Not authorized to edit this room" }, { status: 403 });
    }

    const body = await request.json();
    const {
      room_name,
      description,
      is_public,
      password,
      background_url,
      background_color,
      music_url,
      music_provider,
      webcam_enabled,
      max_participants,
      slow_mode_seconds,
    } = body;

    const result = await sql`
      UPDATE chat_rooms SET
        room_name = COALESCE(${room_name}, room_name),
        description = COALESCE(${description}, description),
        is_public = COALESCE(${is_public}, is_public),
        password_hash = COALESCE(${password}, password_hash),
        background_url = COALESCE(${background_url}, background_url),
        background_color = COALESCE(${background_color}, background_color),
        music_url = COALESCE(${music_url}, music_url),
        music_provider = COALESCE(${music_provider}, music_provider),
        webcam_enabled = COALESCE(${webcam_enabled}, webcam_enabled),
        max_participants = COALESCE(${max_participants}, max_participants),
        slow_mode_seconds = COALESCE(${slow_mode_seconds}, slow_mode_seconds)
      WHERE id = ${roomId}
      RETURNING *
    `;

    return Response.json({ room: result[0] });
  } catch (err) {
    console.error("PATCH /api/chatrooms/[roomId] error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE - Delete room (OWNR only)
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roomId = params.roomId;

    const result = await sql`
      DELETE FROM chat_rooms WHERE id = ${roomId} AND owner_id = ${session.user.id}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: "Not authorized to delete this room" }, { status: 403 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/chatrooms/[roomId] error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

