/**
 * WYA!? — Update Profile Room API (Alpha)
 * 
 * PATCH /api/profile-rooms/[userId]/update
 * Update room settings (background, layout)
 */

import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * PATCH /api/profile-rooms/[userId]/update
 * Update profile room settings
 * 
 * Body:
 * {
 *   background_color?: string
 *   background_url?: string
 *   layout?: JSONB (for future use)
 * }
 */
export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = params.userId;
    if (session.user.id !== userId) {
      return Response.json({ error: "Can only update your own room" }, { status: 403 });
    }

    const body = await request.json();
    const { background_color, background_url, layout } = body;

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
        INSERT INTO profile_rooms (profile_id, background_color, background_url)
        VALUES (
          ${profile.id}, 
          ${background_color || profile.background_color || '#1A1A1E'},
          ${background_url || null}
        )
        RETURNING *
      `;
      room = newRooms[0];
    } else {
      // Update room
      const updated = await sql`
        UPDATE profile_rooms SET
          background_color = COALESCE(${background_color}, background_color),
          background_url = COALESCE(${background_url}, background_url),
          layout = COALESCE(${layout ? JSON.stringify(layout) : null}::jsonb, layout),
          updated_at = NOW()
        WHERE profile_id = ${profile.id}
        RETURNING *
      `;
      room = updated[0];
    }

    return Response.json({ room });
  } catch (err) {
    console.error("PATCH /api/profile-rooms/[userId]/update error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

