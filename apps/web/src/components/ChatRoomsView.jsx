import { useState, useEffect, useRef } from "react";
import {
  Users as UsersIcon,
  MessageCircle,
  Send,
  Settings,
  Crown,
  Shield,
  Star,
  User,
  Lock,
  Globe,
  Plus,
  X,
  MoreVertical,
  Ban,
  UserMinus,
  Coins,
  Music,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import useUser from "@/utils/useUser";
import SendBitsModal from "./SendBitsModal";

const ROLE_CONFIG = {
  OWNR: { label: "Owner", icon: Crown, color: "text-yellow-400", bgColor: "bg-yellow-400/20" },
  MOD: { label: "Mod", icon: Shield, color: "text-blue-400", bgColor: "bg-blue-400/20" },
  AGENT: { label: "Agent", icon: Star, color: "text-purple-400", bgColor: "bg-purple-400/20" },
  USER: { label: "User", icon: User, color: "text-gray-400", bgColor: "bg-gray-400/20" },
};

export default function ChatRoomsView() {
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
  const [showTipModal, setShowTipModal] = useState(false);
  const [filter, setFilter] = useState("public");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadRooms();
  }, [filter]);

  useEffect(() => {
    if (selectedRoom) {
      loadRoomDetails(selectedRoom.id);
      loadMessages(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadRooms = async () => {
    try {
      const res = await fetch(`/api/chatrooms?filter=${filter}`);
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
      const res = await fetch(`/api/chatrooms/${roomId}`);
      if (!res.ok) throw new Error("Failed to load room details");
      const data = await res.json();
      setRoomDetails(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMessages = async (roomId) => {
    try {
      const res = await fetch(`/api/chatrooms/${roomId}/messages`);
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const joinRoom = async (room) => {
    try {
      const res = await fetch(`/api/chatrooms/${room.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.requires_password) {
          const password = prompt("Enter room password:");
          if (password) {
            const retryRes = await fetch(`/api/chatrooms/${room.id}/members`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ password }),
            });
            if (!retryRes.ok) throw new Error("Invalid password");
          }
          return;
        }
        throw new Error(data.error);
      }
      setSelectedRoom(room);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      const res = await fetch(`/api/chatrooms/${selectedRoom.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      setNewMessage("");
      await loadMessages(selectedRoom.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMemberAction = async (memberId, action, extraData = {}) => {
    try {
      const res = await fetch(`/api/chatrooms/${selectedRoom.id}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: memberId, action, ...extraData }),
      });
      if (!res.ok) throw new Error("Action failed");
      await loadRoomDetails(selectedRoom.id);
      setSelectedMember(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const RoleBadge = ({ role }) => {
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.USER;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${config.bgColor} ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  return (
    <div className="h-full flex bg-gradient-to-br from-[#121218] to-[#1A1B25]">
      {/* Rooms List */}
      <div className="w-72 bg-[#161616] border-r border-[#27272A] flex flex-col">
        <div className="p-4 border-b border-[#27272A]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white text-lg">Chat Rooms</h2>
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
                    {room.participant_count || 0}
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
                backgroundImage: roomDetails.room?.background_url
                  ? `url(${roomDetails.room.background_url})`
                  : undefined,
                backgroundSize: "cover",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-lg">
                      {selectedRoom.room_name}
                    </h3>
                    {roomDetails.userRole && <RoleBadge role={roomDetails.userRole} />}
                  </div>
                  {selectedRoom.description && (
                    <p className="text-sm text-[#8B8B90] mt-1">{selectedRoom.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {roomDetails.room?.webcam_enabled && (
                    <button className="w-9 h-9 bg-[#27272A] rounded-lg flex items-center justify-center text-[#8B8B90] hover:text-white hover:bg-[#3A3A3D] transition-colors">
                      <Video size={18} />
                    </button>
                  )}
                  {roomDetails.room?.music_url && (
                    <button className="w-9 h-9 bg-[#27272A] rounded-lg flex items-center justify-center text-[#8B8B90] hover:text-white hover:bg-[#3A3A3D] transition-colors">
                      <Music size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => setShowMembers(!showMembers)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      showMembers ? "bg-[#7A5AF8] text-white" : "bg-[#27272A] text-[#8B8B90] hover:text-white"
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
                </div>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const memberInfo = roomDetails.members?.find(m => m.user_id === msg.user_id);
                  return (
                    <div key={msg.id} className="flex gap-3 group">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">
                          {msg.display_name?.[0] || msg.email?.[0] || "U"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-sm">
                            {msg.display_name || msg.email || "Anonymous"}
                          </span>
                          {memberInfo?.role && <RoleBadge role={memberInfo.role} />}
                          <span className="text-xs text-[#8B8B90]">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-white break-words">{msg.message}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedMember({ id: msg.user_id, display_name: msg.display_name, email: msg.email });
                          setShowTipModal(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 w-7 h-7 bg-[#FFD700]/20 rounded flex items-center justify-center text-[#FFD700] hover:bg-[#FFD700]/30 transition-all"
                        title="Send Bits"
                      >
                        <Coins size={14} />
                      </button>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Members Sidebar */}
              {showMembers && (
                <div className="w-56 bg-[#161616] border-l border-[#27272A] overflow-y-auto">
                  <div className="p-3 border-b border-[#27272A]">
                    <h4 className="text-sm font-semibold text-white">
                      Members ({roomDetails.members?.length || 0})
                    </h4>
                  </div>
                  <div className="p-2">
                    {roomDetails.members?.map((member) => (
                      <div
                        key={member.user_id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#1E1E1F] cursor-pointer group"
                        onClick={() => setSelectedMember(member)}
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {member.display_name?.[0] || member.email?.[0] || "U"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">
                            {member.display_name || member.email}
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
      {selectedMember && !showTipModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMember(null)}>
          <div className="bg-[#1A1A1E] border border-[#27272A] rounded-xl w-64 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {selectedMember.display_name?.[0] || selectedMember.email?.[0] || "U"}
                </span>
              </div>
              <div>
                <p className="font-semibold text-white">{selectedMember.display_name || selectedMember.email}</p>
                {selectedMember.role && <RoleBadge role={selectedMember.role} />}
              </div>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setShowTipModal(true)}
                className="w-full flex items-center gap-2 p-2 rounded-lg bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20 transition-colors"
              >
                <Coins size={16} /> Send Bits
              </button>
              
              {roomDetails?.userRole && ['OWNR', 'MOD'].includes(roomDetails.userRole) && selectedMember.role !== 'OWNR' && (
                <>
                  {roomDetails.userRole === 'OWNR' && selectedMember.role !== 'MOD' && (
                    <button
                      onClick={() => handleMemberAction(selectedMember.user_id, null, { role: 'MOD' })}
                      className="w-full flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                    >
                      <Shield size={16} /> Promote to MOD
                    </button>
                  )}
                  {selectedMember.role !== 'AGENT' && (
                    <button
                      onClick={() => handleMemberAction(selectedMember.user_id, null, { role: 'AGENT' })}
                      className="w-full flex items-center gap-2 p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                    >
                      <Star size={16} /> Make AGENT
                    </button>
                  )}
                  <button
                    onClick={() => handleMemberAction(selectedMember.user_id, 'kick')}
                    className="w-full flex items-center gap-2 p-2 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors"
                  >
                    <UserMinus size={16} /> Kick
                  </button>
                  <button
                    onClick={() => handleMemberAction(selectedMember.user_id, 'ban', { reason: 'Banned by moderator' })}
                    className="w-full flex items-center gap-2 p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Ban size={16} /> Ban
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Bits Modal */}
      {showTipModal && selectedMember && (
        <SendBitsModal
          recipient={{ id: selectedMember.user_id || selectedMember.id, ...selectedMember }}
          context="chatroom"
          onClose={() => {
            setShowTipModal(false);
            setSelectedMember(null);
          }}
        />
      )}

      {/* Create Room Modal */}
      {showCreateRoom && (
        <CreateRoomModal onClose={() => setShowCreateRoom(false)} onCreated={() => { setShowCreateRoom(false); loadRooms(); }} />
      )}

      {/* Room Settings Modal */}
      {showSettings && roomDetails && (
        <RoomSettingsModal
          room={roomDetails.room}
          onClose={() => setShowSettings(false)}
          onSaved={() => { setShowSettings(false); loadRoomDetails(selectedRoom.id); }}
        />
      )}
    </div>
  );
}

function CreateRoomModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    room_name: "",
    description: "",
    is_public: true,
    password: "",
    webcam_enabled: true,
    background_color: "#1A1A1E",
  });
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!formData.room_name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/chatrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create room");
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
          <h2 className="text-xl font-bold text-white">Create Room</h2>
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
              onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
              className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
              placeholder="My Awesome Room"
            />
          </div>

          <div>
            <label className="text-sm text-[#8B8B90] mb-1 block">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] resize-none"
              rows={2}
              placeholder="What's this room about?"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Public Room</span>
            <button
              onClick={() => setFormData({ ...formData, is_public: !formData.is_public })}
              className={`w-12 h-6 rounded-full transition-colors ${formData.is_public ? "bg-[#7A5AF8]" : "bg-[#27272A]"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${formData.is_public ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          {!formData.is_public && (
            <div>
              <label className="text-sm text-[#8B8B90] mb-1 block">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
                placeholder="Room password"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Enable Webcams</span>
            <button
              onClick={() => setFormData({ ...formData, webcam_enabled: !formData.webcam_enabled })}
              className={`w-12 h-6 rounded-full transition-colors ${formData.webcam_enabled ? "bg-[#7A5AF8]" : "bg-[#27272A]"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${formData.webcam_enabled ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
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
    background_url: room.background_url || "",
    music_url: room.music_url || "",
    webcam_enabled: room.webcam_enabled,
    max_participants: room.max_participants || 50,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/chatrooms/${room.id}`, {
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
              onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
              className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
            />
          </div>

          <div>
            <label className="text-sm text-[#8B8B90] mb-1 block">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm text-[#8B8B90] mb-1 block">Background Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.background_color}
                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.background_color}
                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                className="flex-1 bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-[#8B8B90] mb-1 block">Background Image URL</label>
            <input
              type="url"
              value={formData.background_url}
              onChange={(e) => setFormData({ ...formData, background_url: e.target.value })}
              className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-sm text-[#8B8B90] mb-1 block">Music URL (Spotify/SoundCloud)</label>
            <input
              type="url"
              value={formData.music_url}
              onChange={(e) => setFormData({ ...formData, music_url: e.target.value })}
              className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
              placeholder="https://open.spotify.com/..."
            />
          </div>

          <div>
            <label className="text-sm text-[#8B8B90] mb-1 block">Max Participants</label>
            <input
              type="number"
              value={formData.max_participants}
              onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 50 })}
              className="w-full bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
              min={1}
              max={500}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Public Room</span>
            <button
              onClick={() => setFormData({ ...formData, is_public: !formData.is_public })}
              className={`w-12 h-6 rounded-full transition-colors ${formData.is_public ? "bg-[#7A5AF8]" : "bg-[#27272A]"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${formData.is_public ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Enable Webcams</span>
            <button
              onClick={() => setFormData({ ...formData, webcam_enabled: !formData.webcam_enabled })}
              className={`w-12 h-6 rounded-full transition-colors ${formData.webcam_enabled ? "bg-[#7A5AF8]" : "bg-[#27272A]"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${formData.webcam_enabled ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
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
