/**
 * WYA!? — Profile Room Module API (Alpha)
 * 
 * Endpoints:
 * - PATCH /api/profile-rooms/[userId]/modules/[moduleId] - Update module
 * - DELETE /api/profile-rooms/[userId]/modules/[moduleId] - Delete module
 */

import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * PATCH /api/profile-rooms/[userId]/modules/[moduleId]
 * Update module position or content
 * 
 * Body:
 * {
 *   position_x?: number
 *   position_y?: number
 *   content?: JSONB
 *   display_order?: number
 * }
 */
export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = params.userId;
    const moduleId = parseInt(params.moduleId);

    if (session.user.id !== userId) {
      return Response.json({ error: "Can only modify your own room" }, { status: 403 });
    }

    if (isNaN(moduleId)) {
      return Response.json({ error: "Invalid module ID" }, { status: 400 });
    }

    const body = await request.json();
    const { position_x, position_y, content, display_order } = body;

    // Verify module belongs to user's room
    const modules = await sql`
      SELECT rm.* FROM room_modules rm
      JOIN profile_rooms pr ON rm.room_id = pr.id
      JOIN user_profiles up ON pr.profile_id = up.id
      WHERE rm.id = ${moduleId} AND up.user_id = ${userId}
    `;

    if (modules.length === 0) {
      return Response.json({ error: "Module not found" }, { status: 404 });
    }

    // Update module
    const result = await sql`
      UPDATE room_modules SET
        position_x = COALESCE(${position_x}, position_x),
        position_y = COALESCE(${position_y}, position_y),
        content = COALESCE(${content ? JSON.stringify(content) : null}::jsonb, content),
        display_order = COALESCE(${display_order}, display_order),
        updated_at = NOW()
      WHERE id = ${moduleId}
      RETURNING *
    `;

    return Response.json({ module: result[0] });
  } catch (err) {
    console.error("PATCH /api/profile-rooms/[userId]/modules/[moduleId] error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/profile-rooms/[userId]/modules/[moduleId]
 * Delete a module
 */
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = params.userId;
    const moduleId = parseInt(params.moduleId);

    if (session.user.id !== userId) {
      return Response.json({ error: "Can only modify your own room" }, { status: 403 });
    }

    if (isNaN(moduleId)) {
      return Response.json({ error: "Invalid module ID" }, { status: 400 });
    }

    // Verify module belongs to user's room
    const modules = await sql`
      SELECT rm.* FROM room_modules rm
      JOIN profile_rooms pr ON rm.room_id = pr.id
      JOIN user_profiles up ON pr.profile_id = up.id
      WHERE rm.id = ${moduleId} AND up.user_id = ${userId}
    `;

    if (modules.length === 0) {
      return Response.json({ error: "Module not found" }, { status: 404 });
    }

    // Delete module
    await sql`DELETE FROM room_modules WHERE id = ${moduleId}`;

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/profile-rooms/[userId]/modules/[moduleId] error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

