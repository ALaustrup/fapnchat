/**
 * WYA!? — User Moderation History API (Alpha)
 * 
 * GET /api/users/[userId]/moderation-history
 * Get moderation history for a user (user can see their own)
 */

import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { getUserModerationHistory } from "@/utils/moderationSafety";

/**
 * GET /api/users/[userId]/moderation-history
 * Get moderation history
 * 
 * Users can only see their own history (no shadow actions)
 */
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = params.userId;

    // Users can only see their own history
    if (session.user.id !== userId) {
      // TODO: Check moderator permissions for viewing others
      return Response.json({ error: "Can only view your own history" }, { status: 403 });
    }

    const history = await getUserModerationHistory(userId);

    return Response.json({ history });
  } catch (err) {
    console.error("GET /api/users/[userId]/moderation-history error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

