import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GET - List all public rooms or user's rooms
export async function GET(request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "public"; // 'public', 'my', 'member'

    let rooms;
    if (filter === "my" && userId) {
      // Rooms owned by user
      rooms = await sql`
        SELECT cr.*, 
          u.name as owner_name, u.email as owner_email,
          up.display_name as owner_display_name
        FROM chat_rooms cr
        LEFT JOIN auth_users u ON cr.owner_id = u.id
        LEFT JOIN user_profiles up ON cr.owner_id = up.user_id
        WHERE cr.owner_id = ${userId}
        ORDER BY cr.created_at DESC
      `;
    } else if (filter === "member" && userId) {
      // Rooms user is a member of
      rooms = await sql`
        SELECT cr.*, crm.role as user_role,
          u.name as owner_name, u.email as owner_email,
          up.display_name as owner_display_name
        FROM chat_rooms cr
        JOIN chat_room_members crm ON cr.id = crm.room_id
        LEFT JOIN auth_users u ON cr.owner_id = u.id
        LEFT JOIN user_profiles up ON cr.owner_id = up.user_id
        WHERE crm.user_id = ${userId} AND crm.is_banned = false
        ORDER BY crm.last_seen_at DESC
      `;
    } else {
      // Public rooms
      rooms = await sql`
        SELECT cr.*, 
          u.name as owner_name, u.email as owner_email,
          up.display_name as owner_display_name
        FROM chat_rooms cr
        LEFT JOIN auth_users u ON cr.owner_id = u.id
        LEFT JOIN user_profiles up ON cr.owner_id = up.user_id
        WHERE cr.is_public = true
        ORDER BY cr.participant_count DESC, cr.created_at DESC
      `;
    }

    return Response.json({ rooms });
  } catch (err) {
    console.error("GET /api/chatrooms error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST - Create a new room
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      room_name,
      description,
      is_public = true,
      password,
      background_url,
      background_color,
      music_url,
      music_provider,
      webcam_enabled = true,
      max_participants = 50,
    } = body;

    if (!room_name?.trim()) {
      return Response.json({ error: "Room name required" }, { status: 400 });
    }

    // Create room
    const result = await sql`
      INSERT INTO chat_rooms (
        room_name, description, owner_id, is_public, password_hash,
        background_url, background_color, music_url, music_provider,
        webcam_enabled, max_participants
      )
      VALUES (
        ${room_name}, ${description || null}, ${session.user.id}, ${is_public},
        ${password ? password : null},
        ${background_url || null}, ${background_color || '#1A1A1E'},
        ${music_url || null}, ${music_provider || null},
        ${webcam_enabled}, ${max_participants}
      )
      RETURNING *
    `;

    const room = result[0];

    // Add owner as OWNR member
    await sql`
      INSERT INTO chat_room_members (room_id, user_id, role)
      VALUES (${room.id}, ${session.user.id}, 'OWNR')
    `;

    return Response.json({ room });
  } catch (err) {
    console.error("POST /api/chatrooms error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
