import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get users who are not friends yet
    const suggestions = await sql`
      SELECT DISTINCT
        u.id,
        up.display_name,
        up.bio,
        u.email
      FROM auth_users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id != ${userId}
        AND u.id NOT IN (
          SELECT CASE 
            WHEN user_id = ${userId} THEN friend_id
            ELSE user_id
          END
          FROM friendships
          WHERE (user_id = ${userId} OR friend_id = ${userId})
        )
      LIMIT 20
    `;

    return Response.json({ suggestions });
  } catch (err) {
    console.error("GET /api/friends/suggestions error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
