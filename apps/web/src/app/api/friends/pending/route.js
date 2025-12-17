import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const requests = await sql`
      SELECT 
        f.id,
        f.user_id,
        up.display_name,
        up.bio,
        u.email
      FROM friendships f
      LEFT JOIN user_profiles up ON f.user_id = up.user_id
      LEFT JOIN auth_users u ON f.user_id = u.id
      WHERE f.friend_id = ${userId} AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `;

    return Response.json({ requests });
  } catch (err) {
    console.error("GET /api/friends/pending error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
