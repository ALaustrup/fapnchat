import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

// Spotify OAuth endpoints
const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";

// GET - Get user's Spotify connection status or currently playing
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // Get user's Spotify tokens
    const tokens = await sql`
      SELECT * FROM user_music_connections 
      WHERE user_id = ${session.user.id} AND provider = 'spotify'
    `;

    if (tokens.length === 0) {
      return Response.json({ connected: false });
    }

    const token = tokens[0];

    // Check if token needs refresh
    if (new Date(token.expires_at) < new Date()) {
      const refreshed = await refreshSpotifyToken(token.refresh_token);
      if (!refreshed) {
        return Response.json({ connected: false, error: "Token expired" });
      }
      token.access_token = refreshed.access_token;
    }

    if (action === "now-playing") {
      // Get currently playing track
      const nowPlaying = await fetch(`${SPOTIFY_API_URL}/me/player/currently-playing`, {
        headers: { Authorization: `Bearer ${token.access_token}` },
      });

      if (nowPlaying.status === 204) {
        return Response.json({ connected: true, playing: false });
      }

      if (!nowPlaying.ok) {
        return Response.json({ connected: true, playing: false });
      }

      const data = await nowPlaying.json();
      return Response.json({
        connected: true,
        playing: data.is_playing,
        track: data.item ? {
          name: data.item.name,
          artist: data.item.artists?.map(a => a.name).join(", "),
          album: data.item.album?.name,
          image: data.item.album?.images?.[0]?.url,
          duration: data.item.duration_ms,
          progress: data.progress_ms,
          uri: data.item.uri,
          external_url: data.item.external_urls?.spotify,
        } : null,
      });
    }

    return Response.json({ connected: true });
  } catch (err) {
    console.error("GET /api/music/spotify error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST - Connect Spotify or control playback
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, code, redirect_uri } = body;

    if (action === "connect") {
      // Generate OAuth URL
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      if (!clientId) {
        return Response.json({ error: "Spotify not configured" }, { status: 500 });
      }

      const scopes = [
        "user-read-currently-playing",
        "user-read-playback-state",
        "user-modify-playback-state",
        "streaming",
        "user-read-email",
        "user-read-private",
      ].join(" ");

      const state = Buffer.from(JSON.stringify({ userId: session.user.id })).toString("base64");

      const authUrl = `${SPOTIFY_AUTH_URL}?` + new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri: redirect_uri || `${process.env.NEXT_PUBLIC_APP_URL}/api/music/spotify/callback`,
        scope: scopes,
        state,
      });

      return Response.json({ authUrl });
    }

    if (action === "callback" && code) {
      // Exchange code for tokens
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

      const tokenRes = await fetch(SPOTIFY_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirect_uri || `${process.env.NEXT_PUBLIC_APP_URL}/api/music/spotify/callback`,
        }),
      });

      if (!tokenRes.ok) {
        return Response.json({ error: "Failed to exchange code" }, { status: 400 });
      }

      const tokens = await tokenRes.json();

      // Get user profile
      const profileRes = await fetch(`${SPOTIFY_API_URL}/me`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const profile = await profileRes.json();

      // Store tokens
      await sql`
        INSERT INTO user_music_connections (user_id, provider, provider_user_id, access_token, refresh_token, expires_at)
        VALUES (${session.user.id}, 'spotify', ${profile.id}, ${tokens.access_token}, ${tokens.refresh_token}, ${new Date(Date.now() + tokens.expires_in * 1000)})
        ON CONFLICT (user_id, provider) DO UPDATE SET
          access_token = ${tokens.access_token},
          refresh_token = ${tokens.refresh_token},
          expires_at = ${new Date(Date.now() + tokens.expires_in * 1000)}
      `;

      return Response.json({ success: true, profile: { name: profile.display_name, id: profile.id } });
    }

    if (action === "disconnect") {
      await sql`
        DELETE FROM user_music_connections WHERE user_id = ${session.user.id} AND provider = 'spotify'
      `;
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("POST /api/music/spotify error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function refreshSpotifyToken(refreshToken) {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    const res = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

