/**
 * WYA!? — Music Module (Alpha)
 * 
 * Purpose: Display Spotify/SoundCloud embed
 * 
 * Alpha Constraints:
 * - Spotify/SoundCloud only
 * - Autoplay off
 * - Volume capped
 */

import { Music, ExternalLink, Edit2 } from "lucide-react";
import { useState } from "react";

export default function MusicModule({
  musicUrl,
  musicProvider,
  isOwner,
  onUpdate,
}) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(musicUrl || "");
  const [provider, setProvider] = useState(musicProvider || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!onUpdate) return;

    setSaving(true);
    try {
      await onUpdate({
        music_url: url.trim() || null,
        music_provider: provider || null,
      });
      setEditing(false);
    } catch (err) {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };
  if (!musicUrl || !musicProvider) {
    return (
      <div className="bg-[#1A1A1E] border border-[#27272A] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Music size={20} className="text-[#7A5AF8]" />
          <h3 className="font-semibold text-white">Music</h3>
        </div>
        <p className="text-[#8B8B90] text-sm">No music set</p>
      </div>
    );
  }

  // Extract embed ID from URL
  const getEmbedUrl = () => {
    if (musicProvider === "spotify") {
      // Spotify embed format: https://open.spotify.com/embed/track/{id} or /album/{id}
      const match = musicUrl.match(/spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
      if (match) {
        return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
      }
    } else if (musicProvider === "soundcloud") {
      // SoundCloud embed format
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(musicUrl)}&color=%237A5AF8&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl();

  if (!embedUrl) {
    return (
      <div className="bg-[#1A1A1E] border border-[#27272A] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Music size={20} className="text-[#7A5AF8]" />
          <h3 className="font-semibold text-white">Music</h3>
        </div>
        <a
          href={musicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#7A5AF8] hover:text-[#6D4CE5] text-sm flex items-center gap-1"
        >
          Open in {musicProvider === "spotify" ? "Spotify" : "SoundCloud"}
          <ExternalLink size={14} />
        </a>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="bg-[#1A1A1E] border border-[#27272A] rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Music size={20} className="text-[#7A5AF8]" />
            <h3 className="font-semibold text-white">Music</h3>
          </div>
        </div>
        <div className="space-y-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://open.spotify.com/..."
            className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
          />
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
          >
            <option value="">Select provider...</option>
            <option value="spotify">Spotify</option>
            <option value="soundcloud">SoundCloud</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#7A5AF8] text-white px-3 py-1 rounded text-sm hover:bg-[#6D4CE5] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setUrl(musicUrl || "");
                setProvider(musicProvider || "");
                setEditing(false);
              }}
              className="bg-[#27272A] text-white px-3 py-1 rounded text-sm hover:bg-[#3A3A3D] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!musicUrl || !musicProvider) {
    return (
      <div className="bg-[#1A1A1E] border border-[#27272A] rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Music size={20} className="text-[#7A5AF8]" />
            <h3 className="font-semibold text-white">Music</h3>
          </div>
          {isOwner && (
            <button
              onClick={() => setEditing(true)}
              className="text-[#8B8B90] hover:text-white"
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>
        <p className="text-[#8B8B90] text-sm">
          {isOwner ? "Add music to your room" : "No music set"}
        </p>
      </div>
    );
  }

  const embedUrl = getEmbedUrl();

  if (!embedUrl) {
    return (
      <div className="bg-[#1A1A1E] border border-[#27272A] rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Music size={20} className="text-[#7A5AF8]" />
            <h3 className="font-semibold text-white">Music</h3>
          </div>
          {isOwner && (
            <button
              onClick={() => setEditing(true)}
              className="text-[#8B8B90] hover:text-white"
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>
        <a
          href={musicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#7A5AF8] hover:text-[#6D4CE5] text-sm flex items-center gap-1"
        >
          Open in {musicProvider === "spotify" ? "Spotify" : "SoundCloud"}
          <ExternalLink size={14} />
        </a>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1E] border border-[#27272A] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Music size={20} className="text-[#7A5AF8]" />
          <h3 className="font-semibold text-white">Now Playing</h3>
        </div>
        {isOwner && (
          <button
            onClick={() => setEditing(true)}
            className="text-[#8B8B90] hover:text-white"
          >
            <Edit2 size={16} />
          </button>
        )}
      </div>
      <div className="w-full">
        {musicProvider === "spotify" ? (
          <iframe
            src={embedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allowtransparency="true"
            allow="encrypted-media"
            className="rounded-lg"
            style={{ maxWidth: "100%" }}
          />
        ) : (
          <iframe
            width="100%"
            height="166"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src={embedUrl}
            className="rounded-lg"
            style={{ maxWidth: "100%" }}
          />
        )}
      </div>
      <a
        href={musicUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#8B8B90] hover:text-[#7A5AF8] text-xs mt-2 flex items-center gap-1"
      >
        Open in {musicProvider === "spotify" ? "Spotify" : "SoundCloud"}
        <ExternalLink size={12} />
      </a>
    </div>
  );
}

