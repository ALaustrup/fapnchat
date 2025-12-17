import { useState, useEffect, useRef } from "react";
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  ExternalLink,
  X,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import useMusic from "@/utils/useMusic";

export default function MusicPlayer({ compact = false }) {
  const { spotifyConnected, nowPlaying, connectSpotify, disconnectSpotify } = useMusic();
  const [showPlayer, setShowPlayer] = useState(false);
  const [soundcloudUrl, setSoundcloudUrl] = useState("");
  const [soundcloudEmbed, setSoundcloudEmbed] = useState(null);
  const [activeTab, setActiveTab] = useState("spotify");

  const handleSoundCloudLoad = async () => {
    if (!soundcloudUrl.trim()) return;
    try {
      const res = await fetch(`/api/music/soundcloud?action=resolve&url=${encodeURIComponent(soundcloudUrl)}`);
      const data = await res.json();
      setSoundcloudEmbed(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (compact) {
    // Compact "Now Playing" display for header/sidebar
    return (
      <div className="flex items-center gap-2">
        {nowPlaying ? (
          <button
            onClick={() => setShowPlayer(true)}
            className="flex items-center gap-2 bg-[#1DB954]/20 hover:bg-[#1DB954]/30 border border-[#1DB954]/40 rounded-lg px-3 py-1.5 transition-all max-w-[200px]"
          >
            {nowPlaying.image && (
              <img src={nowPlaying.image} alt="" className="w-6 h-6 rounded" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-medium truncate">{nowPlaying.name}</p>
              <p className="text-[10px] text-[#1DB954] truncate">{nowPlaying.artist}</p>
            </div>
            <div className="w-2 h-2 bg-[#1DB954] rounded-full animate-pulse" />
          </button>
        ) : (
          <button
            onClick={() => setShowPlayer(true)}
            className="flex items-center gap-2 bg-[#27272A] hover:bg-[#3A3A3D] rounded-lg px-3 py-1.5 transition-all"
          >
            <Music size={14} className="text-[#8B8B90]" />
            <span className="text-xs text-[#8B8B90]">Music</span>
          </button>
        )}

        {showPlayer && (
          <MusicPlayerModal onClose={() => setShowPlayer(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1E] border border-[#27272A] rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Music size={18} className="text-[#7A5AF8]" />
          Music
        </h3>
        <div className="flex gap-1 bg-[#0F0F0F] rounded-lg p-1">
          <button
            onClick={() => setActiveTab("spotify")}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === "spotify" ? "bg-[#1DB954] text-white" : "text-[#8B8B90] hover:text-white"
            }`}
          >
            Spotify
          </button>
          <button
            onClick={() => setActiveTab("soundcloud")}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === "soundcloud" ? "bg-[#FF5500] text-white" : "text-[#8B8B90] hover:text-white"
            }`}
          >
            SoundCloud
          </button>
        </div>
      </div>

      {activeTab === "spotify" && (
        <div>
          {spotifyConnected ? (
            <div>
              {nowPlaying ? (
                <div className="flex items-center gap-3 bg-[#0F0F0F] rounded-lg p-3">
                  {nowPlaying.image && (
                    <img src={nowPlaying.image} alt="" className="w-14 h-14 rounded-lg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{nowPlaying.name}</p>
                    <p className="text-sm text-[#8B8B90] truncate">{nowPlaying.artist}</p>
                    <p className="text-xs text-[#555555] truncate">{nowPlaying.album}</p>
                  </div>
                  <a
                    href={nowPlaying.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1DB954] hover:text-[#1ed760]"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
              ) : (
                <div className="bg-[#0F0F0F] rounded-lg p-4 text-center">
                  <p className="text-[#8B8B90] text-sm">Nothing playing</p>
                  <p className="text-[#555555] text-xs mt-1">Play something on Spotify to see it here</p>
                </div>
              )}
              <button
                onClick={disconnectSpotify}
                className="mt-3 text-xs text-red-400 hover:text-red-300"
              >
                Disconnect Spotify
              </button>
            </div>
          ) : (
            <button
              onClick={connectSpotify}
              className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Connect Spotify
            </button>
          )}
        </div>
      )}

      {activeTab === "soundcloud" && (
        <div>
          <div className="flex gap-2 mb-3">
            <input
              type="url"
              value={soundcloudUrl}
              onChange={(e) => setSoundcloudUrl(e.target.value)}
              placeholder="Paste SoundCloud URL..."
              className="flex-1 bg-[#0F0F0F] text-white placeholder-[#555555] border border-[#27272A] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5500]"
            />
            <button
              onClick={handleSoundCloudLoad}
              className="bg-[#FF5500] hover:bg-[#ff6a1a] text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
            >
              Load
            </button>
          </div>

          {soundcloudEmbed && (
            <div className="bg-[#0F0F0F] rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="166"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={soundcloudEmbed.embedUrl}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MusicPlayerModal({ onClose }) {
  const { spotifyConnected, nowPlaying, connectSpotify, disconnectSpotify, resolveSoundCloud } = useMusic();
  const [soundcloudUrl, setSoundcloudUrl] = useState("");
  const [soundcloudEmbed, setSoundcloudEmbed] = useState(null);
  const [activeTab, setActiveTab] = useState("spotify");

  const handleSoundCloudLoad = async () => {
    if (!soundcloudUrl.trim()) return;
    const data = await resolveSoundCloud(soundcloudUrl);
    if (data) setSoundcloudEmbed(data);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#1A1A1E] border border-[#27272A] rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Music size={20} className="text-[#7A5AF8]" />
            Music Player
          </h2>
          <button onClick={onClose} className="text-[#8B8B90] hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#0F0F0F] rounded-lg p-1 mb-4">
          <button
            onClick={() => setActiveTab("spotify")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "spotify" ? "bg-[#1DB954] text-white" : "text-[#8B8B90] hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Spotify
          </button>
          <button
            onClick={() => setActiveTab("soundcloud")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "soundcloud" ? "bg-[#FF5500] text-white" : "text-[#8B8B90] hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.052-.1-.084-.1zm-.899 1.125c-.051 0-.094.046-.101.1l-.142 1.029.142 1.012c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.168-1.012-.168-1.029c-.009-.06-.052-.1-.099-.1zm1.83-.527c-.061 0-.104.046-.121.1l-.209 1.556.209 1.52c.017.058.06.098.121.098.061 0 .104-.04.121-.098l.243-1.52-.243-1.556c-.017-.06-.06-.1-.121-.1zm.945-.527c-.068 0-.119.046-.136.1l-.185 2.083.185 2.034c.017.058.068.098.136.098.068 0 .119-.04.136-.098l.218-2.034-.218-2.083c-.017-.06-.068-.1-.136-.1zm.976-.527c-.076 0-.136.046-.153.1l-.16 2.61.16 2.544c.017.058.077.098.153.098.076 0 .136-.04.153-.098l.193-2.544-.193-2.61c-.017-.06-.077-.1-.153-.1zm1.014-.527c-.085 0-.153.046-.17.1l-.134 3.137.134 3.054c.017.058.085.098.17.098.085 0 .153-.04.17-.098l.16-3.054-.16-3.137c-.017-.06-.085-.1-.17-.1zm1.047-.527c-.093 0-.17.046-.187.1l-.109 3.664.109 3.564c.017.058.094.098.187.098.093 0 .17-.04.187-.098l.134-3.564-.134-3.664c-.017-.06-.094-.1-.187-.1zm1.08-.527c-.102 0-.187.046-.204.1l-.084 4.191.084 4.074c.017.058.102.098.204.098.102 0 .187-.04.204-.098l.109-4.074-.109-4.191c-.017-.06-.102-.1-.204-.1zm1.112-.527c-.11 0-.204.046-.221.1l-.059 4.718.059 4.584c.017.058.111.098.221.098.11 0 .204-.04.221-.098l.084-4.584-.084-4.718c-.017-.06-.111-.1-.221-.1zm1.145-.527c-.119 0-.221.046-.238.1l-.034 5.245.034 5.094c.017.058.119.098.238.098.119 0 .221-.04.238-.098l.059-5.094-.059-5.245c-.017-.06-.119-.1-.238-.1zm1.177-.527c-.127 0-.238.046-.255.1l-.009 5.772.009 5.604c.017.058.128.098.255.098.127 0 .238-.04.255-.098l.034-5.604-.034-5.772c-.017-.06-.128-.1-.255-.1zm4.919 2.662c-.374 0-.731.067-1.063.192-.221-2.504-2.322-4.47-4.886-4.47-.612 0-1.201.119-1.738.333-.204.084-.255.169-.255.336v8.803c0 .169.136.321.306.338h7.636c1.481 0 2.68-1.217 2.68-2.716 0-1.5-1.199-2.816-2.68-2.816z"/>
            </svg>
            SoundCloud
          </button>
        </div>

        {activeTab === "spotify" && (
          <div>
            {spotifyConnected ? (
              <>
                {nowPlaying ? (
                  <div className="bg-[#0F0F0F] rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      {nowPlaying.image && (
                        <img src={nowPlaying.image} alt="" className="w-20 h-20 rounded-lg shadow-lg" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{nowPlaying.name}</p>
                        <p className="text-[#8B8B90] text-sm truncate">{nowPlaying.artist}</p>
                        <p className="text-[#555555] text-xs truncate">{nowPlaying.album}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-2 h-2 bg-[#1DB954] rounded-full animate-pulse" />
                          <span className="text-xs text-[#1DB954]">Now Playing</span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={nowPlaying.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center justify-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-white py-2 rounded-lg font-semibold text-sm transition-colors"
                    >
                      <ExternalLink size={16} />
                      Open in Spotify
                    </a>
                  </div>
                ) : (
                  <div className="bg-[#0F0F0F] rounded-xl p-6 text-center">
                    <Music size={40} className="mx-auto mb-3 text-[#8B8B90]" />
                    <p className="text-[#8B8B90]">Nothing playing</p>
                    <p className="text-[#555555] text-xs mt-1">Play something on Spotify</p>
                  </div>
                )}
                <button
                  onClick={disconnectSpotify}
                  className="mt-4 w-full text-sm text-red-400 hover:text-red-300 py-2"
                >
                  Disconnect Spotify
                </button>
              </>
            ) : (
              <button
                onClick={connectSpotify}
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Connect Spotify
              </button>
            )}
          </div>
        )}

        {activeTab === "soundcloud" && (
          <div>
            <div className="flex gap-2 mb-4">
              <input
                type="url"
                value={soundcloudUrl}
                onChange={(e) => setSoundcloudUrl(e.target.value)}
                placeholder="Paste SoundCloud URL..."
                className="flex-1 bg-[#0F0F0F] text-white placeholder-[#555555] border border-[#27272A] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5500]"
                onKeyPress={(e) => e.key === "Enter" && handleSoundCloudLoad()}
              />
              <button
                onClick={handleSoundCloudLoad}
                disabled={!soundcloudUrl.trim()}
                className="bg-[#FF5500] hover:bg-[#ff6a1a] text-white px-4 py-3 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
              >
                <LinkIcon size={18} />
              </button>
            </div>

            {soundcloudEmbed ? (
              <div className="bg-[#0F0F0F] rounded-xl overflow-hidden">
                <iframe
                  width="100%"
                  height="166"
                  scrolling="no"
                  frameBorder="no"
                  allow="autoplay"
                  src={soundcloudEmbed.embedUrl}
                />
              </div>
            ) : (
              <div className="bg-[#0F0F0F] rounded-xl p-6 text-center">
                <Music size={40} className="mx-auto mb-3 text-[#8B8B90]" />
                <p className="text-[#8B8B90]">Paste a SoundCloud URL</p>
                <p className="text-[#555555] text-xs mt-1">Track or playlist links supported</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Now Playing status component for profiles
export function NowPlayingStatus({ userId }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    // Fetch user's now playing status
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/profile/${userId}/now-playing`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  if (!status?.is_playing) return null;

  return (
    <div className="flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-lg px-3 py-2">
      {status.artwork_url && (
        <img src={status.artwork_url} alt="" className="w-8 h-8 rounded" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#8B8B90]">Listening to</p>
        <p className="text-sm text-white font-medium truncate">{status.track_name}</p>
        <p className="text-xs text-[#1DB954] truncate">{status.artist_name}</p>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-1 h-3 bg-[#1DB954] rounded-full animate-pulse" />
        <div className="w-1 h-4 bg-[#1DB954] rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
        <div className="w-1 h-2 bg-[#1DB954] rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
      </div>
    </div>
  );
}

