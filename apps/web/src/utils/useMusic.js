import { useState, useEffect, useCallback } from "react";

export default function useMusic() {
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSpotifyConnection = useCallback(async () => {
    try {
      const res = await fetch("/api/music/spotify");
      const data = await res.json();
      setSpotifyConnected(data.connected);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNowPlaying = useCallback(async () => {
    if (!spotifyConnected) return;
    try {
      const res = await fetch("/api/music/spotify?action=now-playing");
      const data = await res.json();
      if (data.connected && data.track) {
        setNowPlaying(data.track);
      } else {
        setNowPlaying(null);
      }
    } catch (err) {
      console.error(err);
    }
  }, [spotifyConnected]);

  useEffect(() => {
    checkSpotifyConnection();
  }, [checkSpotifyConnection]);

  useEffect(() => {
    if (spotifyConnected) {
      fetchNowPlaying();
      const interval = setInterval(fetchNowPlaying, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [spotifyConnected, fetchNowPlaying]);

  const connectSpotify = async () => {
    try {
      const res = await fetch("/api/music/spotify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "connect",
          redirect_uri: `${window.location.origin}/api/music/spotify/callback`,
        }),
      });
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const disconnectSpotify = async () => {
    try {
      await fetch("/api/music/spotify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect" }),
      });
      setSpotifyConnected(false);
      setNowPlaying(null);
    } catch (err) {
      console.error(err);
    }
  };

  const resolveSoundCloud = async (url) => {
    try {
      const res = await fetch(`/api/music/soundcloud?action=resolve&url=${encodeURIComponent(url)}`);
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  return {
    spotifyConnected,
    nowPlaying,
    loading,
    connectSpotify,
    disconnectSpotify,
    fetchNowPlaying,
    resolveSoundCloud,
  };
}

