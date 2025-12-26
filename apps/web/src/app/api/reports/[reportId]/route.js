/**
 * WYA!? — Report Details API (Alpha)
 * 
 * GET /api/reports/[reportId] - Get report details
 * PATCH /api/reports/[reportId] - Update report status (moderator only)
 */

import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * GET /api/reports/[reportId]
 * Get report details with full context
 */
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reportId = parseInt(params.reportId);
    if (isNaN(reportId)) {
      return Response.json({ error: "Invalid report ID" }, { status: 400 });
    }

    const reports = await sql`
      SELECT 
        r.*,
        up_reporter.display_name as reporter_display_name,
        up_reporter.avatar_url as reporter_avatar_url,
        up_reported.display_name as reported_display_name,
        up_reported.avatar_url as reported_avatar_url,
        up_moderator.display_name as moderator_display_name
      FROM reports r
      LEFT JOIN user_profiles up_reporter ON r.reporter_id = up_reporter.user_id
      LEFT JOIN user_profiles up_reported ON r.reported_user_id = up_reported.user_id
      LEFT JOIN user_profiles up_moderator ON r.reviewed_by = up_moderator.user_id
      WHERE r.id = ${reportId}
    `;

    if (reports.length === 0) {
      return Response.json({ error: "Report not found" }, { status: 404 });
    }

    const report = reports[0];

    // Get related moderation actions
    const actions = await sql`
      SELECT 
        ma.*,
        up_moderator.display_name as moderator_display_name
      FROM moderation_actions ma
      LEFT JOIN user_profiles up_moderator ON ma.moderator_id = up_moderator.user_id
      WHERE ma.report_id = ${reportId}
      ORDER BY ma.created_at DESC
    `;

    return Response.json({ report, actions });
  } catch (err) {
    console.error("GET /api/reports/[reportId] error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PATCH /api/reports/[reportId]
 * Update report status (moderator only)
 * 
 * Body:
 * {
 *   status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
 *   review_notes?: string
 * }
 */
export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Check moderator permissions
    // For Alpha, we'll allow any authenticated user
    // Beta+ will require explicit moderator role

    const reportId = parseInt(params.reportId);
    if (isNaN(reportId)) {
      return Response.json({ error: "Invalid report ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status, review_notes } = body;

    const validStatuses = ["pending", "reviewing", "resolved", "dismissed"];
    if (!status || !validStatuses.includes(status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }

    const result = await sql`
      UPDATE reports SET
        status = ${status},
        reviewed_by = ${session.user.id},
        reviewed_at = NOW(),
        review_notes = COALESCE(${review_notes || null}, review_notes)
      WHERE id = ${reportId}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: "Report not found" }, { status: 404 });
    }

    return Response.json({ report: result[0] });
  } catch (err) {
    console.error("PATCH /api/reports/[reportId] error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

