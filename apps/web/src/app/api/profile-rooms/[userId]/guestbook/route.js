/**
 * WYA!? — Guestbook API (Alpha)
 * 
 * Endpoints:
 * - GET /api/profile-rooms/[userId]/guestbook - Get guestbook entries
 * - POST /api/profile-rooms/[userId]/guestbook - Add guestbook entry
 */

import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * GET /api/profile-rooms/[userId]/guestbook
 * Get guestbook entries for a profile room
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
      return Response.json({ entries: [] });
    }

    const room = rooms[0];

    // Get guestbook module
    const modules = await sql`
      SELECT * FROM room_modules 
      WHERE room_id = ${room.id} AND module_type = 'guestbook'
      LIMIT 1
    `;

    if (modules.length === 0) {
      return Response.json({ entries: [] });
    }

    const module = modules[0];
    const entries = module.content?.entries || [];

    // Enrich entries with user profiles
    const enrichedEntries = await Promise.all(
      entries.map(async (entry) => {
        const userProfile = await sql`
          SELECT display_name, avatar_url FROM user_profiles WHERE user_id = ${entry.user_id}
        `;
        return {
          ...entry,
          display_name: userProfile[0]?.display_name || null,
          avatar_url: userProfile[0]?.avatar_url || null,
        };
      })
    );

    return Response.json({ entries: enrichedEntries });
  } catch (err) {
    console.error("GET /api/profile-rooms/[userId]/guestbook error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/profile-rooms/[userId]/guestbook
 * Add guestbook entry
 * 
 * Body:
 * {
 *   message: string (required)
 * }
 */
export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = params.userId;
    const visitorId = session.user.id;

    // Can't sign own guestbook
    if (userId === visitorId) {
      return Response.json({ error: "Cannot sign your own guestbook" }, { status: 400 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message?.trim()) {
      return Response.json({ error: "Message required" }, { status: 400 });
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

    // Get or create guestbook module
    let modules = await sql`
      SELECT * FROM room_modules 
      WHERE room_id = ${room.id} AND module_type = 'guestbook'
      LIMIT 1
    `;

    let module;
    if (modules.length === 0) {
      // Create guestbook module
      const newModules = await sql`
        INSERT INTO room_modules (room_id, module_type, content)
        VALUES (${room.id}, 'guestbook', '{"entries": []}'::jsonb)
        RETURNING *
      `;
      module = newModules[0];
    } else {
      module = modules[0];
    }

    // Add entry
    const entries = module.content?.entries || [];
    const newEntry = {
      id: Date.now().toString(),
      user_id: visitorId,
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    entries.push(newEntry);

    // Update module content
    const updated = await sql`
      UPDATE room_modules 
      SET content = ${JSON.stringify({ entries })}::jsonb,
          updated_at = NOW()
      WHERE id = ${module.id}
      RETURNING *
    `;

    return Response.json({ entry: newEntry, module: updated[0] });
  } catch (err) {
    console.error("POST /api/profile-rooms/[userId]/guestbook error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

