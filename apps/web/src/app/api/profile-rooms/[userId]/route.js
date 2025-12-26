/**
 * WYA!? — Profile Room API (Alpha)
 * 
 * Purpose: Get profile room data for a user
 * 
 * GET /api/profile-rooms/[userId]
 * Get profile room with modules and layout
 */

import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * GET /api/profile-rooms/[userId]
 * Get profile room data
 * 
 * Response:
 * {
 *   room: { id, profile_id, layout, background_color, background_url, ... },
 *   profile: { id, user_id, display_name, avatar_url, bio, ... },
 *   modules: Array<{ id, module_type, position_x, position_y, content, display_order }>,
 *   presence: { status, activity, ... } (if available)
 * }
 */
export async function GET(request, { params }) {
  try {
    const session = await auth();
    const userId = params.userId;

    // Get profile
    const profiles = await sql`
      SELECT * FROM user_profiles WHERE user_id = ${userId}
    `;

    if (profiles.length === 0) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    const profile = profiles[0];

    // Get or create profile room
    let rooms = await sql`
      SELECT * FROM profile_rooms WHERE profile_id = ${profile.id}
    `;

    let room;
    if (rooms.length === 0) {
      // Create default room
      const newRooms = await sql`
        INSERT INTO profile_rooms (profile_id, background_color)
        VALUES (${profile.id}, ${profile.background_color || '#1A1A1E'})
        RETURNING *
      `;
      room = newRooms[0];
    } else {
      room = rooms[0];
    }

    // Get modules
    const modules = await sql`
      SELECT * FROM room_modules 
      WHERE room_id = ${room.id}
      ORDER BY display_order ASC, created_at ASC
    `;

    // Get presence if available
    let presence = null;
    if (session?.user?.id) {
      const presenceData = await sql`
        SELECT * FROM presence WHERE user_id = ${userId}
      `;
      presence = presenceData[0] || null;
    }

    return Response.json({
      room,
      profile,
      modules,
      presence,
    });
  } catch (err) {
    console.error("GET /api/profile-rooms/[userId] error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

