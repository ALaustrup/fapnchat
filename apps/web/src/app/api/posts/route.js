import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const posts = await sql`
      SELECT 
        p.*,
        up.display_name,
        u.email
      FROM posts p
      LEFT JOIN user_profiles up ON p.user_id = up.user_id
      LEFT JOIN auth_users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 50
    `;

    return Response.json({ posts });
  } catch (err) {
    console.error("GET /api/posts error", err);
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
    const { content, media_url, media_type } = body || {};

    if (!content && !media_url) {
      return Response.json(
        { error: "Content or media required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO posts (user_id, content, media_url, media_type)
      VALUES (${userId}, ${content || null}, ${media_url || null}, ${media_type || null})
      RETURNING *
    `;

    return Response.json({ post: result[0] });
  } catch (err) {
    console.error("POST /api/posts error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
