/**
 * WYA!? — Profile Room Modules API (Alpha)
 * 
 * Endpoints:
 * - GET /api/profile-rooms/[userId]/modules - Get modules
 * - POST /api/profile-rooms/[userId]/modules - Add module
 */

import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * GET /api/profile-rooms/[userId]/modules
 * Get all modules for a profile room
 */
export async function GET(request, { params }) {
  try {
    const userId = params.userId;

    // Get profile
    const profiles = await sql`
      SELECT * FROM user_profiles WHERE user_id = ${userId}
    `;

    if (profiles.length === 0) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    const profile = profiles[0];

    // Get room
    const rooms = await sql`
      SELECT * FROM profile_rooms WHERE profile_id = ${profile.id}
    `;

    if (rooms.length === 0) {
      return Response.json({ modules: [] });
    }

    const room = rooms[0];

    // Get modules
    const modules = await sql`
      SELECT * FROM room_modules 
      WHERE room_id = ${room.id}
      ORDER BY display_order ASC, created_at ASC
    `;

    return Response.json({ modules });
  } catch (err) {
    console.error("GET /api/profile-rooms/[userId]/modules error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/profile-rooms/[userId]/modules
 * Add a module to profile room
 * 
 * Body:
 * {
 *   module_type: 'guestbook' | 'music' | 'text' (required)
 *   position_x?: number (default: 0)
 *   position_y?: number (default: 0)
 *   content?: JSONB (module-specific content)
 * }
 */
export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = params.userId;
    if (session.user.id !== userId) {
      return Response.json({ error: "Can only modify your own room" }, { status: 403 });
    }

    const body = await request.json();
    const { module_type, position_x = 0, position_y = 0, content = {} } = body;

    if (!module_type || !['guestbook', 'music', 'text'].includes(module_type)) {
      return Response.json({ error: "Invalid module type" }, { status: 400 });
    }

    // Get profile
    const profiles = await sql`
      SELECT * FROM user_profiles WHERE user_id = ${userId}
    `;

    if (profiles.length === 0) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    const profile = profiles[0];

    // Get or create room
    let rooms = await sql`
      SELECT * FROM profile_rooms WHERE profile_id = ${profile.id}
    `;

    let room;
    if (rooms.length === 0) {
      const newRooms = await sql`
        INSERT INTO profile_rooms (profile_id, background_color)
        VALUES (${profile.id}, ${profile.background_color || '#1A1A1E'})
        RETURNING *
      `;
      room = newRooms[0];
    } else {
      room = rooms[0];
    }

    // Get max display_order
    const maxOrder = await sql`
      SELECT COALESCE(MAX(display_order), 0) as max_order
      FROM room_modules WHERE room_id = ${room.id}
    `;

    // Create module
    const result = await sql`
      INSERT INTO room_modules (
        room_id,
        module_type,
        position_x,
        position_y,
        content,
        display_order
      )
      VALUES (
        ${room.id},
        ${module_type},
        ${position_x},
        ${position_y},
        ${JSON.stringify(content)}::jsonb,
        ${(maxOrder[0]?.max_order || 0) + 1}
      )
      RETURNING *
    `;

    return Response.json({ module: result[0] });
  } catch (err) {
    console.error("POST /api/profile-rooms/[userId]/modules error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

