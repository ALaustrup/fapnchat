/**
 * WYA!? — Profile Room View (Alpha MVP)
 * 
 * Purpose: Render profile as a room with modules
 * 
 * Features:
 * - Room canvas
 * - Avatar + name + status
 * - Background theme (color / gradient)
 * - Music player (Spotify / SoundCloud embed only)
 * - Guestbook
 * - Drag-and-drop module placement (limited)
 * 
 * Alpha Constraints:
 * - No custom CSS
 * - No marketplace
 * - No animations beyond basic transitions
 * - Layout stored server-side
 */

import { useState, useEffect, useRef } from "react";
import {
  Settings,
  Plus,
  X,
  GripVertical,
  Circle,
  Music,
  MessageSquare,
  FileText,
} from "lucide-react";
import useUser from "@/utils/useUser";
import GuestbookModule from "./profile-room/GuestbookModule";
import MusicModule from "./profile-room/MusicModule";
import TextModule from "./profile-room/TextModule";

const MODULE_TYPES = {
  guestbook: { label: "Guestbook", icon: MessageSquare },
  music: { label: "Music", icon: Music },
  text: { label: "Text", icon: FileText },
};

const PRESENCE_STATUS = {
  online: { color: "bg-green-500", label: "Online" },
  away: { color: "bg-yellow-500", label: "Away" },
  offline: { color: "bg-gray-500", label: "Offline" },
};

export default function ProfileRoomView({ userId }) {
  const { data: currentUser } = useUser();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draggingModule, setDraggingModule] = useState(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const canvasRef = useRef(null);

  const isOwner = currentUser?.id === userId;

  useEffect(() => {
    loadRoom();
  }, [userId]);

  const loadRoom = async () => {
    try {
      const res = await fetch(`/api/profile-rooms/${userId}`);
      if (!res.ok) throw new Error("Failed to load room");
      const data = await res.json();
      setRoomData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleUpdate = async (moduleId, updates) => {
    try {
      const res = await fetch(
        `/api/profile-rooms/${userId}/modules/${moduleId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );
      if (!res.ok) throw new Error("Failed to update module");
      await loadRoom();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddModule = async (moduleType) => {
    try {
      const res = await fetch(`/api/profile-rooms/${userId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_type: moduleType,
          position_x: 100,
          position_y: 100,
        }),
      });
      if (!res.ok) throw new Error("Failed to add module");
      await loadRoom();
      setShowAddModule(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm("Delete this module?")) return;

    try {
      const res = await fetch(
        `/api/profile-rooms/${userId}/modules/${moduleId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete module");
      await loadRoom();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDragStart = (e, module) => {
    if (!editing || !isOwner) return;
    setDraggingModule(module);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (!draggingModule || !editing || !isOwner) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    await handleModuleUpdate(draggingModule.id, {
      position_x: Math.max(0, Math.min(x, rect.width - 200)),
      position_y: Math.max(0, Math.min(y, rect.height - 100)),
    });

    setDraggingModule(null);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[#8B8B90]">Loading room...</p>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[#8B8B90]">Room not found</p>
      </div>
    );
  }

  const { room, profile, modules, presence } = roomData;
  const presenceStatus = presence?.status || "offline";
  const presenceConfig = PRESENCE_STATUS[presenceStatus] || PRESENCE_STATUS.offline;

  // Get music module data (use module content if exists, otherwise profile)
  const musicModule = modules.find((m) => m.module_type === "music");
  const musicUrl =
    musicModule?.content?.music_url ||
    profile.profile_music_url ||
    null;
  const musicProvider =
    musicModule?.content?.music_provider ||
    profile.profile_music_provider ||
    null;

  return (
    <div className="h-full flex flex-col bg-[#0F0F0F]">
      {/* Header */}
      <div className="p-4 border-b border-[#27272A] bg-[#161616]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-full border-2 border-[#27272A] overflow-hidden"
                style={{ backgroundColor: profile.theme_color || "#7A5AF8" }}
              >
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {profile.display_name?.[0] || "U"}
                    </span>
                  </div>
                )}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 ${presenceConfig.color} rounded-full border-2 border-[#161616]`}
                title={presenceConfig.label}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {profile.display_name || "Anonymous"}
              </h1>
              {profile.bio && (
                <p className="text-sm text-[#8B8B90] mt-1">{profile.bio}</p>
              )}
            </div>
          </div>
          {isOwner && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(!editing)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  editing
                    ? "bg-[#7A5AF8] text-white"
                    : "bg-[#27272A] text-[#8B8B90] hover:text-white"
                }`}
              >
                {editing ? "Done Editing" : "Edit Room"}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="w-9 h-9 bg-[#27272A] rounded-lg flex items-center justify-center text-[#8B8B90] hover:text-white hover:bg-[#3A3A3D] transition-colors"
              >
                <Settings size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Room Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden"
        style={{
          backgroundColor: room.background_color || "#1A1A1E",
          backgroundImage: room.background_url
            ? `url(${room.background_url})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Modules */}
        {modules.map((module) => {
          const ModuleComponent = {
            guestbook: GuestbookModule,
            music: MusicModule,
            text: TextModule,
          }[module.module_type];

          if (!ModuleComponent) return null;

          return (
            <div
              key={module.id}
              draggable={editing && isOwner}
              onDragStart={(e) => handleDragStart(e, module)}
              className={`absolute ${
                editing && isOwner ? "cursor-move" : ""
              }`}
              style={{
                left: `${module.position_x}px`,
                top: `${module.position_y}px`,
                width: "300px",
                transition: editing ? "none" : "all 0.2s ease",
              }}
            >
              {editing && isOwner && (
                <div className="absolute -top-8 left-0 flex items-center gap-1 bg-[#27272A] rounded px-2 py-1">
                  <GripVertical size={12} className="text-[#8B8B90]" />
                  <span className="text-xs text-[#8B8B90]">
                    {MODULE_TYPES[module.module_type]?.label}
                  </span>
                  <button
                    onClick={() => handleDeleteModule(module.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {module.module_type === "guestbook" && (
                <GuestbookModule
                  roomUserId={userId}
                  isOwner={isOwner}
                  onUpdate={loadRoom}
                />
              )}
              {module.module_type === "music" && (
                <MusicModule
                  musicUrl={module.content?.music_url || musicUrl}
                  musicProvider={module.content?.music_provider || musicProvider}
                  isOwner={isOwner}
                  onUpdate={(updates) =>
                    handleModuleUpdate(module.id, {
                      content: { ...module.content, ...updates },
                    })
                  }
                />
              )}
              {module.module_type === "text" && (
                <TextModule
                  content={module.content}
                  isOwner={isOwner}
                  onUpdate={(updates) =>
                    handleModuleUpdate(module.id, { content: updates })
                  }
                />
              )}
            </div>
          );
        })}

        {/* Add Module Button */}
        {editing && isOwner && (
          <div className="absolute bottom-4 right-4">
            <button
              onClick={() => setShowAddModule(true)}
              className="w-12 h-12 bg-[#7A5AF8] rounded-full flex items-center justify-center text-white hover:bg-[#6D4CE5] transition-colors shadow-lg"
            >
              <Plus size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Add Module Modal */}
      {showAddModule && (
        <AddModuleModal
          onClose={() => setShowAddModule(false)}
          onAdd={handleAddModule}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <RoomSettingsModal
          room={room}
          profile={profile}
          onClose={() => setShowSettings(false)}
          onSaved={loadRoom}
        />
      )}
    </div>
  );
}

function AddModuleModal({ onClose, onAdd }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1E] border border-[#27272A] rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Add Module</h2>
          <button onClick={onClose} className="text-[#8B8B90] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2">
          {Object.entries(MODULE_TYPES).map(([type, config]) => (
            <button
              key={type}
              onClick={() => onAdd(type)}
              className="w-full flex items-center gap-3 p-3 bg-[#0F0F0F] hover:bg-[#27272A] rounded-lg transition-colors"
            >
              <config.icon size={20} className="text-[#7A5AF8]" />
              <span className="text-white font-medium">{config.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoomSettingsModal({ room, profile, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    background_color: room.background_color || "#1A1A1E",
    background_url: room.background_url || "",
    profile_music_url: profile.profile_music_url || "",
    profile_music_provider: profile.profile_music_provider || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update room
      await fetch(`/api/profile-rooms/${profile.user_id}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          background_color: formData.background_color,
          background_url: formData.background_url,
        }),
      });

      // Update profile music (if changed)
      if (
        formData.profile_music_url !== profile.profile_music_url ||
        formData.profile_music_provider !== profile.profile_music_provider
      ) {
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile_music_url: formData.profile_music_url,
            profile_music_provider: formData.profile_music_provider,
          }),
        });
      }

      onSaved();
    } catch (err) {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#1A1A1E] border border-[#27272A] rounded-xl max-w-md w-full p-6 my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Room Settings</h2>
          <button onClick={onClose} className="text-[#8B8B90] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-[#8B8B90] mb-2 block">
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.background_color}
                onChange={(e) =>
                  setFormData({ ...formData, background_color: e.target.value })
                }
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.background_color}
                onChange={(e) =>
                  setFormData({ ...formData, background_color: e.target.value })
                }
                className="flex-1 bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-[#8B8B90] mb-2 block">
              Background Image URL
            </label>
            <input
              type="url"
              value={formData.background_url}
              onChange={(e) =>
                setFormData({ ...formData, background_url: e.target.value })
              }
              className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-sm text-[#8B8B90] mb-2 block">
              Music URL (Spotify/SoundCloud)
            </label>
            <input
              type="url"
              value={formData.profile_music_url}
              onChange={(e) =>
                setFormData({ ...formData, profile_music_url: e.target.value })
              }
              className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] mb-2"
              placeholder="https://open.spotify.com/..."
            />
            <select
              value={formData.profile_music_provider}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  profile_music_provider: e.target.value,
                })
              }
              className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
            >
              <option value="">Select provider...</option>
              <option value="spotify">Spotify</option>
              <option value="soundcloud">SoundCloud</option>
            </select>
          </div>

          <div className="pt-4 border-t border-[#27272A]">
            <p className="text-xs text-[#8B8B90] mb-4">
              TODO: Post-Alpha Expansion
              <br />• Custom gradients
              <br />• More module types
              <br />• Advanced layout options
              <br />• Module marketplace (Beta+)
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] text-white py-3 rounded-xl font-bold hover:from-[#6D4CE5] hover:to-[#8B5CF6] transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

