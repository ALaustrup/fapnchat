import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rooms = await sql`
      SELECT 
        vr.id,
        vr.room_name,
        vr.created_by,
        vr.created_at,
        up.display_name as creator_name,
        au.email as creator_email,
        COUNT(DISTINCT vrp.user_id) as participant_count
      FROM video_rooms vr
      LEFT JOIN user_profiles up ON vr.created_by = up.user_id
      LEFT JOIN auth_users au ON vr.created_by = au.id
      LEFT JOIN video_room_participants vrp ON vr.id = vrp.room_id
      GROUP BY vr.id, vr.room_name, vr.created_by, vr.created_at, up.display_name, au.email
      ORDER BY vr.created_at DESC
    `;

    return Response.json({ rooms });
  } catch (error) {
    console.error("Error fetching video rooms:", error);
    return Response.json(
      { error: "Failed to fetch video rooms" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { room_name } = await request.json();

    if (!room_name || !room_name.trim()) {
      return Response.json({ error: "Room name is required" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO video_rooms (room_name, created_by)
      VALUES (${room_name}, ${session.user.id})
      RETURNING id
    `;

    return Response.json({ success: true, id: result[0].id });
  } catch (error) {
    console.error("Error creating video room:", error);
    return Response.json(
      { error: "Failed to create video room" },
      { status: 500 },
    );
  }
}
