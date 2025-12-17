import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const forums = await sql`
      SELECT 
        f.*,
        COUNT(DISTINCT fp.id) as post_count
      FROM forums f
      LEFT JOIN forum_posts fp ON f.id = fp.forum_id
      GROUP BY f.id
      ORDER BY f.created_at DESC
    `;

    return Response.json({ forums });
  } catch (err) {
    console.error("GET /api/forums error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
