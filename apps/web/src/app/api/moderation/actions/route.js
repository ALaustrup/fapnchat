/**
 * WYA!? — Moderation Actions API (Alpha)
 * 
 * Purpose: Create and manage moderation actions
 * 
 * Endpoints:
 * - GET /api/moderation/actions - List actions (moderator only)
 * - POST /api/moderation/actions - Create action (moderator only)
 */

import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * GET /api/moderation/actions
 * List moderation actions
 * 
 * Query params:
 * - target_user_id?: string (filter by target)
 * - action_type?: 'warn' | 'mute' | 'restrict' | 'escalate'
 * - limit?: number (default: 50)
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Check moderator permissions

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("target_user_id");
    const actionType = searchParams.get("action_type");
    const limit = parseInt(searchParams.get("limit") || "50");

    let actions;
    
    if (targetUserId && actionType) {
      actions = await sql`
        SELECT 
          ma.*,
          up_moderator.display_name as moderator_display_name,
          up_target.display_name as target_display_name,
          up_reversed.display_name as reversed_by_display_name
        FROM moderation_actions ma
        LEFT JOIN user_profiles up_moderator ON ma.moderator_id = up_moderator.user_id
        LEFT JOIN user_profiles up_target ON ma.target_user_id = up_target.user_id
        LEFT JOIN user_profiles up_reversed ON ma.reversed_by = up_reversed.user_id
        WHERE ma.target_user_id = ${targetUserId} AND ma.action_type = ${actionType}
        ORDER BY ma.created_at DESC
        LIMIT ${limit}
      `;
    } else if (targetUserId) {
      actions = await sql`
        SELECT 
          ma.*,
          up_moderator.display_name as moderator_display_name,
          up_target.display_name as target_display_name,
          up_reversed.display_name as reversed_by_display_name
        FROM moderation_actions ma
        LEFT JOIN user_profiles up_moderator ON ma.moderator_id = up_moderator.user_id
        LEFT JOIN user_profiles up_target ON ma.target_user_id = up_target.user_id
        LEFT JOIN user_profiles up_reversed ON ma.reversed_by = up_reversed.user_id
        WHERE ma.target_user_id = ${targetUserId}
        ORDER BY ma.created_at DESC
        LIMIT ${limit}
      `;
    } else if (actionType) {
      actions = await sql`
        SELECT 
          ma.*,
          up_moderator.display_name as moderator_display_name,
          up_target.display_name as target_display_name,
          up_reversed.display_name as reversed_by_display_name
        FROM moderation_actions ma
        LEFT JOIN user_profiles up_moderator ON ma.moderator_id = up_moderator.user_id
        LEFT JOIN user_profiles up_target ON ma.target_user_id = up_target.user_id
        LEFT JOIN user_profiles up_reversed ON ma.reversed_by = up_reversed.user_id
        WHERE ma.action_type = ${actionType}
        ORDER BY ma.created_at DESC
        LIMIT ${limit}
      `;
    } else {
      actions = await sql`
        SELECT 
          ma.*,
          up_moderator.display_name as moderator_display_name,
          up_target.display_name as target_display_name,
          up_reversed.display_name as reversed_by_display_name
        FROM moderation_actions ma
        LEFT JOIN user_profiles up_moderator ON ma.moderator_id = up_moderator.user_id
        LEFT JOIN user_profiles up_target ON ma.target_user_id = up_target.user_id
        LEFT JOIN user_profiles up_reversed ON ma.reversed_by = up_reversed.user_id
        ORDER BY ma.created_at DESC
        LIMIT ${limit}
      `;
    }

    return Response.json({ actions });
  } catch (err) {
    console.error("GET /api/moderation/actions error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/moderation/actions
 * Create a moderation action
 * 
 * Body:
 * {
 *   target_user_id: string (required)
 *   action_type: 'warn' | 'mute' | 'restrict' | 'escalate' (required)
 *   reason: string (required)
 *   duration_minutes?: number (null = permanent, requires escalation)
 *   report_id?: number (related report)
 * }
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Check moderator permissions
    // For Alpha, we'll allow any authenticated user
    // Beta+ will require explicit moderator role

    const moderatorId = session.user.id;
    const body = await request.json();
    const {
      target_user_id,
      action_type,
      reason,
      duration_minutes,
      report_id,
    } = body;

    if (!target_user_id || !action_type || !reason?.trim()) {
      return Response.json({
        error: "Target user ID, action type, and reason required",
      }, { status: 400 });
    }

    const validTypes = ["warn", "mute", "restrict", "escalate"];
    if (!validTypes.includes(action_type)) {
      return Response.json({ error: "Invalid action type" }, { status: 400 });
    }

    // Permanent actions require escalation
    if (!duration_minutes && action_type !== "escalate") {
      return Response.json({
        error: "Permanent actions require escalation type",
      }, { status: 400 });
    }

    // Calculate expiration
    let expiresAt = null;
    if (duration_minutes) {
      expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + duration_minutes);
    }

    // Create action (all actions logged - no shadow actions)
    const result = await sql`
      INSERT INTO moderation_actions (
        moderator_id,
        target_user_id,
        action_type,
        reason,
        duration_minutes,
        expires_at,
        report_id
      )
      VALUES (
        ${moderatorId},
        ${target_user_id},
        ${action_type},
        ${reason.trim()},
        ${duration_minutes || null},
        ${expiresAt ? expiresAt.toISOString() : null},
        ${report_id || null}
      )
      RETURNING *
    `;

    // Update related report status if provided
    if (report_id) {
      await sql`
        UPDATE reports SET
          status = 'resolved',
          reviewed_by = ${moderatorId},
          reviewed_at = NOW()
        WHERE id = ${report_id}
      `;
    }

    return Response.json({ action: result[0] });
  } catch (err) {
    console.error("POST /api/moderation/actions error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

