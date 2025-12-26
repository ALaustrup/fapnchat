/**
 * WYA!? — Group Rooms API (Alpha)
 * 
 * Purpose: Small group chat rooms (3-10 users, text-only, invite-based)
 * 
 * Endpoints:
 * - GET /api/groups - List group rooms (public or user's rooms)
 * - POST /api/groups - Create a new group room
 * 
 * Alpha Constraints:
 * - Max 10 participants per room (enforced)
 * - Text-only (no video)
 * - Invite-based (is_public=false means invite-only)
 * - Uses Alpha schema: chats (chat_type='group'), chat_participants, messages
 */

import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * GET /api/groups
 * List group rooms
 * 
 * Query params:
 * - filter: 'public' | 'my' | 'member' (default: 'public')
 * 
 * Response:
 * {
 *   rooms: Array<{
 *     id, room_name, description, owner_id, is_public,
 *     max_participants, created_at, participant_count,
 *     owner_display_name, owner_avatar_url
 *   }>
 * }
 */
export async function GET(request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "public";

    let rooms;
    
    if (filter === "my" && userId) {
      // Rooms owned by user
      rooms = await sql`
        SELECT 
          c.id,
          c.room_name,
          c.description,
          c.owner_id,
          c.is_public,
          c.max_participants,
          c.created_at,
          COUNT(cp.id)::int as participant_count,
          up.display_name as owner_display_name,
          up.avatar_url as owner_avatar_url
        FROM chats c
        LEFT JOIN chat_participants cp ON c.id = cp.chat_id AND cp.is_banned = false
        LEFT JOIN user_profiles up ON c.owner_id = up.user_id
        WHERE c.chat_type = 'group' AND c.owner_id = ${userId}
        GROUP BY c.id, up.display_name, up.avatar_url
        ORDER BY c.created_at DESC
      `;
    } else if (filter === "member" && userId) {
      // Rooms user is a member of
      rooms = await sql`
        SELECT 
          c.id,
          c.room_name,
          c.description,
          c.owner_id,
          c.is_public,
          c.max_participants,
          c.created_at,
          COUNT(cp2.id)::int as participant_count,
          up.display_name as owner_display_name,
          up.avatar_url as owner_avatar_url,
          cp.role as user_role
        FROM chats c
        JOIN chat_participants cp ON c.id = cp.chat_id AND cp.user_id = ${userId} AND cp.is_banned = false
        LEFT JOIN chat_participants cp2 ON c.id = cp2.chat_id AND cp2.is_banned = false
        LEFT JOIN user_profiles up ON c.owner_id = up.user_id
        WHERE c.chat_type = 'group'
        GROUP BY c.id, up.display_name, up.avatar_url, cp.role
        ORDER BY cp.last_seen_at DESC
      `;
    } else {
      // Public rooms
      rooms = await sql`
        SELECT 
          c.id,
          c.room_name,
          c.description,
          c.owner_id,
          c.is_public,
          c.max_participants,
          c.created_at,
          COUNT(cp.id)::int as participant_count,
          up.display_name as owner_display_name,
          up.avatar_url as owner_avatar_url
        FROM chats c
        LEFT JOIN chat_participants cp ON c.id = cp.chat_id AND cp.is_banned = false
        LEFT JOIN user_profiles up ON c.owner_id = up.user_id
        WHERE c.chat_type = 'group' AND c.is_public = true
        GROUP BY c.id, up.display_name, up.avatar_url
        ORDER BY participant_count DESC, c.created_at DESC
      `;
    }

    return Response.json({ rooms });
  } catch (err) {
    console.error("GET /api/groups error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/groups
 * Create a new group room
 * 
 * Body:
 * {
 *   room_name: string (required)
 *   description?: string
 *   is_public?: boolean (default: false - invite-based)
 *   max_participants?: number (default: 10, max: 10)
 *   background_color?: string
 *   music_url?: string
 *   music_provider?: 'spotify' | 'soundcloud'
 * }
 * 
 * Response:
 * {
 *   room: { id, room_name, description, owner_id, ... }
 * }
 */
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
      is_public = false, // Default to invite-based
      max_participants = 10,
      background_color = '#1A1A1E',
      music_url,
      music_provider,
    } = body;

    if (!room_name?.trim()) {
      return Response.json({ error: "Room name required" }, { status: 400 });
    }

    // Enforce Alpha limit: max 10 participants
    const participants = Math.min(Math.max(1, max_participants || 10), 10);

    // Create group chat
    const result = await sql`
      INSERT INTO chats (
        chat_type,
        room_name,
        description,
        owner_id,
        is_public,
        max_participants,
        background_color,
        music_url,
        music_provider
      )
      VALUES (
        'group',
        ${room_name.trim()},
        ${description?.trim() || null},
        ${session.user.id},
        ${is_public},
        ${participants},
        ${background_color},
        ${music_url || null},
        ${music_provider || null}
      )
      RETURNING *
    `;

    const room = result[0];

    // Add owner as OWNR participant
    await sql`
      INSERT INTO chat_participants (chat_id, user_id, role)
      VALUES (${room.id}, ${session.user.id}, 'OWNR')
    `;

    return Response.json({ room });
  } catch (err) {
    console.error("POST /api/groups error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

