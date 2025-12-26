/**
 * WYA!? — Reverse Moderation Action API (Alpha)
 * 
 * POST /api/moderation/actions/[actionId]/reverse
 * Reverse a moderation action (moderator only)
 */

import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * POST /api/moderation/actions/[actionId]/reverse
 * Reverse a moderation action
 * 
 * Body:
 * {
 *   reversal_reason: string (required)
 * }
 */
export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Check moderator permissions

    const actionId = parseInt(params.actionId);
    if (isNaN(actionId)) {
      return Response.json({ error: "Invalid action ID" }, { status: 400 });
    }

    const body = await request.json();
    const { reversal_reason } = body;

    if (!reversal_reason?.trim()) {
      return Response.json({
        error: "Reversal reason required",
      }, { status: 400 });
    }

    // Get action
    const actions = await sql`
      SELECT * FROM moderation_actions WHERE id = ${actionId}
    `;

    if (actions.length === 0) {
      return Response.json({ error: "Action not found" }, { status: 404 });
    }

    const action = actions[0];

    if (action.is_reversed) {
      return Response.json({ error: "Action already reversed" }, { status: 400 });
    }

    // Reverse action
    const result = await sql`
      UPDATE moderation_actions SET
        is_reversed = true,
        reversed_by = ${session.user.id},
        reversed_at = NOW(),
        reversal_reason = ${reversal_reason.trim()}
      WHERE id = ${actionId}
      RETURNING *
    `;

    return Response.json({ action: result[0] });
  } catch (err) {
    console.error("POST /api/moderation/actions/[actionId]/reverse error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

