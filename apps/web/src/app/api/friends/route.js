import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const friends = await sql`
      SELECT 
        CASE 
          WHEN f.user_id = ${userId} THEN f.friend_id
          ELSE f.user_id
        END as id,
        up.display_name,
        up.bio,
        u.email
      FROM friendships f
      LEFT JOIN user_profiles up ON (CASE WHEN f.user_id = ${userId} THEN f.friend_id ELSE f.user_id END) = up.user_id
      LEFT JOIN auth_users u ON (CASE WHEN f.user_id = ${userId} THEN f.friend_id ELSE f.user_id END) = u.id
      WHERE (f.user_id = ${userId} OR f.friend_id = ${userId})
        AND f.status = 'accepted'
    `;

    return Response.json({ friends });
  } catch (err) {
    console.error("GET /api/friends error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { friend_id } = body || {};

    if (!friend_id) {
      return Response.json({ error: "Friend ID required" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO friendships (user_id, friend_id, status)
      VALUES (${userId}, ${friend_id}, 'pending')
      RETURNING *
    `;

    return Response.json({ friendship: result[0] });
  } catch (err) {
    console.error("POST /api/friends error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
