import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Helper to check user's role in room
async function getUserRole(roomId, userId) {
  const result = await sql`
    SELECT role FROM chat_room_members 
    WHERE room_id = ${roomId} AND user_id = ${userId} AND is_banned = false
  `;
  return result[0]?.role || null;
}

// Helper to check if user can manage roles
function canManageRole(managerRole, targetRole) {
  const hierarchy = { OWNR: 4, MOD: 3, AGENT: 2, USER: 1 };
  return hierarchy[managerRole] > hierarchy[targetRole];
}

// POST - Join room
export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roomId = params.roomId;
    const body = await request.json();
    const { password } = body;

    // Get room
    const rooms = await sql`SELECT * FROM chat_rooms WHERE id = ${roomId}`;
    if (rooms.length === 0) {
      return Response.json({ error: "Room not found" }, { status: 404 });
    }

    const room = rooms[0];

    // Check if already a member
    const existing = await sql`
      SELECT * FROM chat_room_members WHERE room_id = ${roomId} AND user_id = ${session.user.id}
    `;

    if (existing.length > 0) {
      if (existing[0].is_banned) {
        return Response.json({ error: "You are banned from this room" }, { status: 403 });
      }
      // Update last seen
      await sql`
        UPDATE chat_room_members SET last_seen_at = NOW() 
        WHERE room_id = ${roomId} AND user_id = ${session.user.id}
      `;
      return Response.json({ success: true, role: existing[0].role });
    }

    // Check private room password
    if (!room.is_public && room.password_hash) {
      if (password !== room.password_hash) {
        return Response.json({ error: "Invalid password" }, { status: 403 });
      }
    }

    // Check max participants
    if (room.participant_count >= room.max_participants) {
      return Response.json({ error: "Room is full" }, { status: 403 });
    }

    // Join as USER
    await sql`
      INSERT INTO chat_room_members (room_id, user_id, role)
      VALUES (${roomId}, ${session.user.id}, 'USER')
    `;

    // Update participant count
    await sql`
      UPDATE chat_rooms SET participant_count = participant_count + 1 WHERE id = ${roomId}
    `;

    return Response.json({ success: true, role: 'USER' });
  } catch (err) {
    console.error("POST /api/chatrooms/[roomId]/members error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH - Update member role (OWNR/MOD only)
export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roomId = params.roomId;
    const body = await request.json();
    const { user_id, role, action } = body; // action: 'promote', 'demote', 'ban', 'unban', 'kick'

    // Get manager's role
    const managerRole = await getUserRole(roomId, session.user.id);
    if (!managerRole || !['OWNR', 'MOD'].includes(managerRole)) {
      return Response.json({ error: "Not authorized" }, { status: 403 });
    }

    // Get target's current role
    const targetMember = await sql`
      SELECT * FROM chat_room_members WHERE room_id = ${roomId} AND user_id = ${user_id}
    `;

    if (targetMember.length === 0) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }

    const currentRole = targetMember[0].role;

    // Can't modify owner or equal/higher roles
    if (currentRole === 'OWNR' || !canManageRole(managerRole, currentRole)) {
      return Response.json({ error: "Cannot modify this member" }, { status: 403 });
    }

    if (action === 'ban') {
      const { reason, duration_hours } = body;
      const expiresAt = duration_hours ? new Date(Date.now() + duration_hours * 60 * 60 * 1000) : null;
      
      await sql`
        UPDATE chat_room_members 
        SET is_banned = true, ban_reason = ${reason || null}, ban_expires_at = ${expiresAt}
        WHERE room_id = ${roomId} AND user_id = ${user_id}
      `;
      
      await sql`UPDATE chat_rooms SET participant_count = participant_count - 1 WHERE id = ${roomId}`;
      
      return Response.json({ success: true, action: 'banned' });
    }

    if (action === 'unban') {
      await sql`
        UPDATE chat_room_members 
        SET is_banned = false, ban_reason = null, ban_expires_at = null
        WHERE room_id = ${roomId} AND user_id = ${user_id}
      `;
      return Response.json({ success: true, action: 'unbanned' });
    }

    if (action === 'kick') {
      await sql`DELETE FROM chat_room_members WHERE room_id = ${roomId} AND user_id = ${user_id}`;
      await sql`UPDATE chat_rooms SET participant_count = participant_count - 1 WHERE id = ${roomId}`;
      return Response.json({ success: true, action: 'kicked' });
    }

    // Role change
    if (role && ['MOD', 'AGENT', 'USER'].includes(role)) {
      // Only OWNR can promote to MOD
      if (role === 'MOD' && managerRole !== 'OWNR') {
        return Response.json({ error: "Only owner can promote to MOD" }, { status: 403 });
      }

      await sql`
        UPDATE chat_room_members SET role = ${role}
        WHERE room_id = ${roomId} AND user_id = ${user_id}
      `;
      return Response.json({ success: true, new_role: role });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("PATCH /api/chatrooms/[roomId]/members error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE - Leave room
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roomId = params.roomId;

    // Check if owner (can't leave, must delete room)
    const membership = await sql`
      SELECT role FROM chat_room_members WHERE room_id = ${roomId} AND user_id = ${session.user.id}
    `;

    if (membership.length > 0 && membership[0].role === 'OWNR') {
      return Response.json({ error: "Owner cannot leave. Transfer ownership or delete the room." }, { status: 400 });
    }

    await sql`DELETE FROM chat_room_members WHERE room_id = ${roomId} AND user_id = ${session.user.id}`;
    await sql`UPDATE chat_rooms SET participant_count = GREATEST(participant_count - 1, 0) WHERE id = ${roomId}`;

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/chatrooms/[roomId]/members error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

