/**
 * WYA!? — Group Rooms View (Alpha)
 * 
 * Purpose: Small group chat rooms (3-10 users, text-only, invite-based)
 * 
 * Features:
 * - Room creation
 * - Join/leave
 * - Presence list
 * - Reactions
 * - Safety hooks (report, block)
 */

import { useState, useEffect, useRef } from "react";
import {
  Users as UsersIcon,
  MessageCircle,
  Send,
  Settings,
  Crown,
  Shield,
  User,
  Lock,
  Globe,
  Plus,
  X,
  Ban,
  UserMinus,
  Flag,
  Smile,
} from "lucide-react";
import useUser from "@/utils/useUser";

const ROLE_CONFIG = {
  OWNR: { label: "Owner", icon: Crown, color: "text-yellow-400", bgColor: "bg-yellow-400/20" },
  MOD: { label: "Mod", icon: Shield, color: "text-blue-400", bgColor: "bg-blue-400/20" },
  USER: { label: "User", icon: User, color: "text-gray-400", bgColor: "bg-gray-400/20" },
};

const PRESENCE_STATUS = {
  online: { color: "bg-green-500", label: "Online" },
  away: { color: "bg-yellow-500", label: "Away" },
  offline: { color: "bg-gray-500", label: "Offline" },
};

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export default function GroupRoomsView() {
  const { data: user } = useUser();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMembers, setShowMembers] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [filter, setFilter] = useState("public");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    loadRooms();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [filter]);

  useEffect(() => {
    if (selectedRoom) {
      loadRoomDetails(selectedRoom.id);
      loadMessages(selectedRoom.id);
      connectWebSocket(selectedRoom.id);
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [selectedRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadRooms = async () => {
    try {
      const res = await fetch(`/api/groups?filter=${filter}`);
      if (!res.ok) throw new Error("Failed to load rooms");
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRoomDetails = async (roomId) => {
    try {
      const res = await fetch(`/api/groups/${roomId}`);
      if (!res.ok) throw new Error("Failed to load room details");
      const data = await res.json();
      setRoomDetails(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMessages = async (roomId) => {
    try {
      const res = await fetch(`/api/groups/${roomId}/messages`);
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const connectWebSocket = (roomId) => {
    // WebSocket connection for real-time updates
    // Note: This is a placeholder - actual WebSocket implementation should use the gateway
    const wsUrl = `/api/ws/chat?room=${roomId}`;
    // For now, we'll poll for updates
    const interval = setInterval(() => {
      if (selectedRoom) {
        loadMessages(selectedRoom.id);
        loadRoomDetails(selectedRoom.id);
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  const joinRoom = async (room) => {
    try {
      const res = await fetch(`/api/groups/${room.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.requires_invite) {
          alert("This room is invite-only. You need an invitation to join.");
          return;
        }
        throw new Error(data.error || "Failed to join room");
      }
      setSelectedRoom(room);
      await loadRooms();
    } catch (err) {
      alert(err.message);
    }
  };

  const leaveRoom = async () => {
    if (!selectedRoom) return;
    if (!confirm("Are you sure you want to leave this room?")) return;

    try {
      const res = await fetch(`/api/groups/${selectedRoom.id}/leave`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to leave room");
      setSelectedRoom(null);
      setRoomDetails(null);
      setMessages([]);
      await loadRooms();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      const res = await fetch(`/api/groups/${selectedRoom.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_text: newMessage }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      setNewMessage("");
      await loadMessages(selectedRoom.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReaction = async (messageId, emoji) => {
    if (!selectedRoom) return;

    try {
      const res = await fetch(
        `/api/groups/${selectedRoom.id}/messages/${messageId}/reactions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emoji }),
        }
      );

      if (!res.ok) throw new Error("Failed to add reaction");
      await loadMessages(selectedRoom.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlock = async (userId) => {
    if (!confirm("Are you sure you want to block this user?")) return;

    try {
      const res = await fetch(`/api/users/${userId}/block`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to block user");
      alert("User blocked");
      setSelectedMember(null);
      await loadRoomDetails(selectedRoom.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReport = (target) => {
    setReportTarget(target);
    setShowReportModal(true);
  };

  const submitReport = async (reportData) => {
    if (!selectedRoom || !reportTarget) return;

    try {
      const res = await fetch(`/api/groups/${selectedRoom.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_type: reportData.type,
          description: reportData.description,
          reported_user_id: reportTarget.user_id || null,
          reported_message_id: reportTarget.message_id || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit report");
      alert("Report submitted. Thank you for keeping WYA!? safe.");
      setShowReportModal(false);
      setReportTarget(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const RoleBadge = ({ role }) => {
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.USER;
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${config.bgColor} ${config.color}`}
      >
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const PresenceIndicator = ({ status }) => {
    const config = PRESENCE_STATUS[status] || PRESENCE_STATUS.offline;
    return (
      <div className="absolute -bottom-0.5 -right-0.5">
        <div className={`w-3 h-3 ${config.color} rounded-full border-2 border-[#161616]`} />
      </div>
    );
  };

  return (
    <div className="h-full flex bg-gradient-to-br from-[#121218] to-[#1A1B25]">
      {/* Rooms List */}
      <div className="w-72 bg-[#161616] border-r border-[#27272A] flex flex-col">
        <div className="p-4 border-b border-[#27272A]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white text-lg">Group Rooms</h2>
            <button
              onClick={() => setShowCreateRoom(true)}
              className="w-8 h-8 bg-[#7A5AF8] rounded-lg flex items-center justify-center hover:bg-[#6D4CE5] transition-colors"
            >
              <Plus size={16} className="text-white" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 bg-[#0F0F0F] rounded-lg p-1">
            {[
              { id: "public", label: "Public", icon: Globe },
              { id: "member", label: "Joined", icon: UsersIcon },
              { id: "my", label: "My Rooms", icon: Crown },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === tab.id
                    ? "bg-[#7A5AF8] text-white"
                    : "text-[#8B8B90] hover:text-white"
                }`}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-[#8B8B90]">Loading...</div>
          ) : rooms.length === 0 ? (
            <div className="p-4 text-center text-[#8B8B90]">No rooms found</div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => joinRoom(room)}
                className={`p-3 cursor-pointer transition-colors border-l-2 ${
                  selectedRoom?.id === room.id
                    ? "bg-[#202021] border-[#7A5AF8]"
                    : "border-transparent hover:bg-[#1E1E1F]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {room.is_public ? (
                    <Globe size={14} className="text-green-400" />
                  ) : (
                    <Lock size={14} className="text-yellow-400" />
                  )}
                  <h3 className="font-semibold text-white text-sm truncate flex-1">
                    {room.room_name}
                  </h3>
                  <span className="text-xs text-[#8B8B90]">
                    {room.participant_count || 0}/10
                  </span>
                </div>
                {room.description && (
                  <p className="text-xs text-[#8B8B90] truncate">{room.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom && roomDetails ? (
          <>
            {/* Room Header */}
            <div
              className="p-4 border-b border-[#27272A]"
              style={{
                backgroundColor: roomDetails.room?.background_color || "#1A1A1E",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-lg">
                      {selectedRoom.room_name}
                    </h3>
                    {roomDetails.userRole && (
                      <RoleBadge role={roomDetails.userRole} />
                    )}
                  </div>
                  {selectedRoom.description && (
                    <p className="text-sm text-[#8B8B90] mt-1">
                      {selectedRoom.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowMembers(!showMembers)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      showMembers
                        ? "bg-[#7A5AF8] text-white"
                        : "bg-[#27272A] text-[#8B8B90] hover:text-white"
                    }`}
                  >
                    <UsersIcon size={18} />
                  </button>
                  {roomDetails.userRole === "OWNR" && (
                    <button
                      onClick={() => setShowSettings(true)}
                      className="w-9 h-9 bg-[#27272A] rounded-lg flex items-center justify-center text-[#8B8B90] hover:text-white hover:bg-[#3A3A3D] transition-colors"
                    >
                      <Settings size={18} />
                    </button>
                  )}
                  {roomDetails.userRole && (
                    <button
                      onClick={leaveRoom}
                      className="w-9 h-9 bg-[#27272A] rounded-lg flex items-center justify-center text-[#8B8B90] hover:text-red-400 hover:bg-red-400/20 transition-colors"
                      title="Leave room"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const reactions = msg.reactions || {};
                  return (
                    <div key={msg.id} className="flex gap-3 group">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">
                          {msg.sender_display_name?.[0] || "U"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-sm">
                            {msg.sender_display_name || "Anonymous"}
                          </span>
                          <span className="text-xs text-[#8B8B90]">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </span>
                          <button
                            onClick={() =>
                              handleReport({ message_id: msg.id, user_id: msg.sender_id })
                            }
                            className="opacity-0 group-hover:opacity-100 text-[#8B8B90] hover:text-red-400"
                            title="Report"
                          >
                            <Flag size={12} />
                          </button>
                        </div>
                        <p className="text-sm text-white break-words mb-2">
                          {msg.message_text}
                        </p>
                        {/* Reactions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {Object.entries(reactions).map(([emoji, userIds]) => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(msg.id, emoji)}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-xs bg-[#27272A] hover:bg-[#3A3A3D] transition-colors ${
                                userIds.includes(user?.id)
                                  ? "bg-[#7A5AF8]/20 border border-[#7A5AF8]"
                                  : ""
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="text-[#8B8B90]">{userIds.length}</span>
                            </button>
                          ))}
                          <button
                            onClick={() => {
                              const emoji = REACTION_EMOJIS[0];
                              handleReaction(msg.id, emoji);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-[#8B8B90] hover:text-white"
                            title="Add reaction"
                          >
                            <Smile size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Members Sidebar with Presence */}
              {showMembers && (
                <div className="w-56 bg-[#161616] border-l border-[#27272A] overflow-y-auto">
                  <div className="p-3 border-b border-[#27272A]">
                    <h4 className="text-sm font-semibold text-white">
                      Members ({roomDetails.participants?.length || 0}/10)
                    </h4>
                  </div>
                  <div className="p-2">
                    {roomDetails.participants?.map((member) => (
                      <div
                        key={member.user_id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#1E1E1F] cursor-pointer group"
                        onClick={() => setSelectedMember(member)}
                      >
                        <div className="relative">
                          <div className="w-8 h-8 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                              {member.display_name?.[0] || "U"}
                            </span>
                          </div>
                          <PresenceIndicator status={member.presence_status || "offline"} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">
                            {member.display_name || "Anonymous"}
                          </p>
                          <RoleBadge role={member.role} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-[#1A1A1E] border-t border-[#27272A]">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#1E1E1F] text-white placeholder-[#555555] border border-[#242424] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] text-white p-3 rounded-lg hover:from-[#6D4CE5] hover:to-[#8B5CF6] transition-all disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-4 text-[#8B8B90]" />
              <p className="text-[#8B8B90]">Select a room to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Member Action Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-[#1A1A1E] border border-[#27272A] rounded-xl w-64 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {selectedMember.display_name?.[0] || "U"}
                </span>
              </div>
              <div>
                <p className="font-semibold text-white">
                  {selectedMember.display_name || "Anonymous"}
                </p>
                {selectedMember.role && <RoleBadge role={selectedMember.role} />}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleBlock(selectedMember.user_id)}
                className="w-full flex items-center gap-2 p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <Ban size={16} /> Block User
              </button>
              <button
                onClick={() => handleReport({ user_id: selectedMember.user_id })}
                className="w-full flex items-center gap-2 p-2 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors"
              >
                <Flag size={16} /> Report User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          target={reportTarget}
          onClose={() => {
            setShowReportModal(false);
            setReportTarget(null);
          }}
          onSubmit={submitReport}
        />
      )}

      {/* Create Room Modal */}
      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onCreated={() => {
            setShowCreateRoom(false);
            loadRooms();
          }}
        />
      )}

      {/* Room Settings Modal */}
      {showSettings && roomDetails && (
        <RoomSettingsModal
          room={roomDetails.room}
          onClose={() => setShowSettings(false)}
          onSaved={() => {
            setShowSettings(false);
            loadRoomDetails(selectedRoom.id);
          }}
        />
      )}
    </div>
  );
}

function CreateRoomModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    room_name: "",
    description: "",
    is_public: false, // Default to invite-based
    max_participants: 10,
    background_color: "#1A1A1E",
    music_url: "",
    music_provider: "",
  });
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!formData.room_name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create room");
      }
      onCreated();
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1E] border border-[#27272A] rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Create Group Room</h2>
          <button onClick={onClose} className="text-[#8B8B90] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-[#8B8B90] mb-1 block">Room Name</label>
            <input
              type="text"
              value={formData.room_name}
              onChange={(e) =>
                setFormData({ ...formData, room_name: e.target.value })
              }
              className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
              placeholder="My Awesome Room"
              maxLength={100}
            />
          </div>

          <div>
            <label className="text-sm text-[#8B8B90] mb-1 block">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] resize-none"
              rows={2}
              placeholder="What's this room about?"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-white">Public Room</span>
              <p className="text-xs text-[#8B8B90]">
                {formData.is_public
                  ? "Anyone can join"
                  : "Invite-only (default)"}
              </p>
            </div>
            <button
              onClick={() =>
                setFormData({ ...formData, is_public: !formData.is_public })
              }
              className={`w-12 h-6 rounded-full transition-colors ${
                formData.is_public ? "bg-[#7A5AF8]" : "bg-[#27272A]"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  formData.is_public ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div>
            <label className="text-sm text-[#8B8B90] mb-1 block">
              Max Participants (Alpha limit: 10)
            </label>
            <input
              type="number"
              value={formData.max_participants}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_participants: Math.min(
                    Math.max(1, parseInt(e.target.value) || 10),
                    10
                  ),
                })
              }
              className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
              min={1}
              max={10}
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={!formData.room_name.trim() || creating}
            className="w-full bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] text-white py-3 rounded-xl font-bold hover:from-[#6D4CE5] hover:to-[#8B5CF6] transition-all disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Room"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RoomSettingsModal({ room, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    room_name: room.room_name,
    description: room.description || "",
    is_public: room.is_public,
    background_color: room.background_color || "#1A1A1E",
    music_url: room.music_url || "",
    music_provider: room.music_provider || "",
    max_participants: room.max_participants || 10,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/groups/${room.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save");
      onSaved();
    } catch (err) {
      alert(err.message);
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
            <label className="text-sm text-[#8B8B90] mb-1 block">Room Name</label>
            <input
              type="text"
              value={formData.room_name}
              onChange={(e) =>
                setFormData({ ...formData, room_name: e.target.value })
              }
              className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
              maxLength={100}
            />
          </div>

          <div>
            <label className="text-sm text-[#8B8B90] mb-1 block">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm text-[#8B8B90] mb-1 block">
              Max Participants (Alpha limit: 10)
            </label>
            <input
              type="number"
              value={formData.max_participants}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_participants: Math.min(
                    Math.max(1, parseInt(e.target.value) || 10),
                    10
                  ),
                })
              }
              className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
              min={1}
              max={10}
            />
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

function ReportModal({ target, onClose, onSubmit }) {
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!reportType || !description.trim()) {
      alert("Please select a report type and provide a description");
      return;
    }
    onSubmit({ type: reportType, description });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1E] border border-[#27272A] rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Report</h2>
          <button onClick={onClose} className="text-[#8B8B90] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-[#8B8B90] mb-2 block">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
            >
              <option value="">Select a type...</option>
              <option value="harassment">Harassment</option>
              <option value="spam">Spam</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="abuse">Abuse</option>
              <option value="scam">Scam</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-[#8B8B90] mb-2 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] resize-none"
              rows={4}
              placeholder="Please provide details about what happened..."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!reportType || !description.trim()}
            className="w-full bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] text-white py-3 rounded-xl font-bold hover:from-[#6D4CE5] hover:to-[#8B5CF6] transition-all disabled:opacity-50"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}

