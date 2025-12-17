import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Simple signaling server using database polling
// For production, use WebSockets or a service like Livekit/Twilio

// POST - Send signal (offer, answer, ice-candidate)
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { room_id, target_user_id, signal_type, signal_data } = await request.json();

    if (!room_id || !signal_type || !signal_data) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    await sql`
      INSERT INTO webrtc_signals (room_id, sender_id, target_user_id, signal_type, signal_data)
      VALUES (${room_id}, ${session.user.id}, ${target_user_id || null}, ${signal_type}, ${JSON.stringify(signal_data)})
    `;

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST /api/webrtc/signal error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET - Poll for signals
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("room_id");
    const since = searchParams.get("since"); // timestamp

    if (!roomId) {
      return Response.json({ error: "room_id required" }, { status: 400 });
    }

    let signals;
    if (since) {
      signals = await sql`
        SELECT ws.*, u.name as sender_name, u.email as sender_email
        FROM webrtc_signals ws
        LEFT JOIN auth_users u ON ws.sender_id = u.id
        WHERE ws.room_id = ${roomId}
          AND ws.sender_id != ${session.user.id}
          AND (ws.target_user_id IS NULL OR ws.target_user_id = ${session.user.id})
          AND ws.created_at > ${new Date(parseInt(since))}
        ORDER BY ws.created_at ASC
      `;
    } else {
      signals = await sql`
        SELECT ws.*, u.name as sender_name, u.email as sender_email
        FROM webrtc_signals ws
        LEFT JOIN auth_users u ON ws.sender_id = u.id
        WHERE ws.room_id = ${roomId}
          AND ws.sender_id != ${session.user.id}
          AND (ws.target_user_id IS NULL OR ws.target_user_id = ${session.user.id})
          AND ws.created_at > NOW() - INTERVAL '30 seconds'
        ORDER BY ws.created_at ASC
      `;
    }

    return Response.json({ signals, timestamp: Date.now() });
  } catch (err) {
    console.error("GET /api/webrtc/signal error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

