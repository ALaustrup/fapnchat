import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

// SoundCloud API (uses client-side widget API primarily)
const SOUNDCLOUD_API_URL = "https://api.soundcloud.com";
const SOUNDCLOUD_RESOLVE_URL = "https://api-v2.soundcloud.com/resolve";

// GET - Resolve SoundCloud URL or get user's saved tracks
export async function GET(request) {
  try {
    if (!request || !request.url) {
      return Response.json({ error: "Invalid request" }, { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const url = searchParams.get("url");
    
    if (action === "resolve" && url) {
      // Resolve action doesn't require auth - handle it first
      // Validate URL format
      if (!url || typeof url !== "string" || url.trim().length === 0) {
        return Response.json({ error: "URL is required" }, { status: 400 });
      }
      
      // Basic SoundCloud URL validation
      const soundcloudPattern = /^https?:\/\/(www\.)?(soundcloud\.com|snd\.sc)/i;
      if (!soundcloudPattern.test(url.trim())) {
        return Response.json({ error: "Invalid SoundCloud URL format" }, { status: 400 });
      }
      
      const cleanUrl = url.trim();
      
      // Resolve a SoundCloud URL to get track/playlist info
      // Note: SoundCloud API requires client_id for most endpoints
      const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
      
      // Detect if URL is a playlist/album (contains /sets/) or track
      const isPlaylist = cleanUrl.includes("/sets/") || cleanUrl.includes("/playlists/");
      const kind = isPlaylist ? "playlist" : "track";
      
      if (!clientId) {
        // Return basic info for widget embed with detected kind
        return Response.json({
          embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(cleanUrl)}&color=%237A5AF8&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`,
          originalUrl: cleanUrl,
          kind: kind,
        });
      }

      try {
        const resolveRes = await fetch(`${SOUNDCLOUD_RESOLVE_URL}?url=${encodeURIComponent(cleanUrl)}&client_id=${clientId}`);
        if (!resolveRes.ok) {
          // Fallback to URL-based detection if API fails
          return Response.json({
            embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(cleanUrl)}&color=%237A5AF8&auto_play=false`,
            originalUrl: cleanUrl,
            kind: kind,
          });
        }

        const data = await resolveRes.json();
        // Use API kind if available, otherwise fall back to URL detection
        const detectedKind = data.kind || kind;
        return Response.json({
          id: data.id,
          title: data.title,
          artist: data.user?.username,
          artwork: data.artwork_url?.replace("-large", "-t500x500"),
          duration: data.duration,
          permalink: data.permalink_url,
          embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(data.permalink_url)}&color=%237A5AF8&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`,
          kind: detectedKind, // 'track' or 'playlist'
        });
      } catch (err) {
        console.error("SoundCloud API resolve error:", err);
        // Fallback to URL-based detection on error
        return Response.json({
          embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(cleanUrl)}&color=%237A5AF8&auto_play=false`,
          originalUrl: cleanUrl,
          kind: kind,
        });
      }
    }

    // For saved action, we need auth
    if (action === "saved") {
      let session = null;
      try {
        session = await auth();
      } catch (authErr) {
        console.error("Auth check failed for saved action:", authErr);
        return Response.json({ error: "Unauthorized" }, { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      if (!session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      // Get user's saved SoundCloud tracks
      const saved = await sql`
        SELECT * FROM user_saved_music 
        WHERE user_id = ${session.user.id} AND provider = 'soundcloud'
        ORDER BY created_at DESC
        LIMIT 50
      `;
      return Response.json({ tracks: saved });
    }

    return Response.json({ error: "Invalid action" }, { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("GET /api/music/soundcloud error", err);
    return Response.json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    }, { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// POST - Save a SoundCloud track
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, track_url, track_data } = body;

    if (action === "save") {
      await sql`
        INSERT INTO user_saved_music (user_id, provider, track_url, track_data)
        VALUES (${session.user.id}, 'soundcloud', ${track_url}, ${JSON.stringify(track_data)})
        ON CONFLICT (user_id, provider, track_url) DO NOTHING
      `;
      return Response.json({ success: true });
    }

    if (action === "remove") {
      await sql`
        DELETE FROM user_saved_music 
        WHERE user_id = ${session.user.id} AND provider = 'soundcloud' AND track_url = ${track_url}
      `;
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("POST /api/music/soundcloud error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

