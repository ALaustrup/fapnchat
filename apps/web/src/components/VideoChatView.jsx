import { useState, useEffect, useRef } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  MonitorUp,
  Plus,
  Coins,
  Settings,
  X,
} from "lucide-react";
import useUser from "@/utils/useUser";
import useWebRTC from "@/utils/useWebRTC";
import SendBitsModal from "./SendBitsModal";

export default function VideoChatView() {
  const { data: user } = useUser();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showTipModal, setShowTipModal] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef(new Map());

  const {
    localStream,
    remoteStreams,
    participants,
    isConnected,
    error,
    startLocalStream,
    stopLocalStream,
    toggleVideo,
    toggleAudio,
    joinRoom,
    leaveRoom,
  } = useWebRTC(activeRoom?.id, user?.id);

  useEffect(() => {
    loadRooms();
  }, []);

  // Set local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Set remote videos
  useEffect(() => {
    remoteStreams.forEach((stream, oderId) => {
      const videoEl = remoteVideoRefs.current.get(oderId);
      if (videoEl && videoEl.srcObject !== stream) {
        videoEl.srcObject = stream;
      }
    });
  }, [remoteStreams]);

  const loadRooms = async () => {
    try {
      const res = await fetch("/api/video-rooms");
      if (!res.ok) throw new Error("Failed to load rooms");
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (err) {
      console.error(err);
    }
  };

  const createRoom = async () => {
    if (!roomName.trim()) return;
    try {
      const res = await fetch("/api/video-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_name: roomName }),
      });
      if (!res.ok) throw new Error("Failed to create room");
      setShowCreateRoom(false);
      setRoomName("");
      await loadRooms();
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinRoom = async (room) => {
    try {
      await startLocalStream(true, true);
      setActiveRoom(room);
      // joinRoom will be called after localStream is set
    } catch (err) {
      alert("Failed to access camera/microphone");
    }
  };

  // Join room when localStream is ready
  useEffect(() => {
    if (localStream && activeRoom) {
      joinRoom();
    }
  }, [localStream, activeRoom]);

  const handleLeaveRoom = async () => {
    await leaveRoom();
    setActiveRoom(null);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
  };

  const handleToggleVideo = () => {
    const enabled = toggleVideo();
    setIsVideoEnabled(enabled);
  };

  const handleToggleAudio = () => {
    const enabled = toggleAudio();
    setIsAudioEnabled(enabled);
  };

  const handleScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      // Replace video track
      const videoTrack = screenStream.getVideoTracks()[0];
      if (localStream) {
        const sender = localStream.getVideoTracks()[0];
        // This would need peer connection track replacement
        // For now, just show locally
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
      }
    } catch (err) {
      console.error("Screen share failed:", err);
    }
  };

  const remoteStreamArray = Array.from(remoteStreams.entries());

  return (
    <div className="h-full bg-gradient-to-br from-[#121218] to-[#1A1B25] overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-bold text-white text-3xl mb-2">Video Chat</h1>
            <p className="text-[#8B8B90] text-sm">
              {activeRoom
                ? `Connected to ${activeRoom.room_name}`
                : "Connect with others through live video"}
            </p>
          </div>
          {!activeRoom && (
            <button
              onClick={() => setShowCreateRoom(true)}
              className="bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] text-white px-6 py-3 rounded-lg font-semibold text-sm hover:from-[#6D4CE5] hover:to-[#8B5CF6] transition-all shadow-lg"
            >
              Create Room
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        {/* Main Content */}
        {!activeRoom ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Rooms */}
            <div>
              <h2 className="font-semibold text-white text-lg mb-4">Available Rooms</h2>
              {rooms.length === 0 ? (
                <div className="bg-[#1A1A1E] border border-[#27272A] rounded-xl p-8 text-center">
                  <Users size={48} className="mx-auto mb-4 text-[#8B8B90]" />
                  <p className="text-[#8B8B90]">No rooms available</p>
                  <p className="text-[#555555] text-sm mt-2">Create a room to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="bg-[#1A1A1E] border border-[#27272A] rounded-xl p-4 hover:border-[#7A5AF8] transition-all cursor-pointer"
                      onClick={() => handleJoinRoom(room)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white mb-1">{room.room_name}</h3>
                          <p className="text-[#8B8B90] text-sm">
                            Created by {room.creator_name || "Anonymous"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-[#7A5AF8]">
                          <Users size={16} />
                          <span className="text-sm font-semibold">
                            {room.participant_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-[#1A1A1E] border border-[#27272A] rounded-xl p-6">
              <h2 className="font-semibold text-white text-lg mb-4">How to Use Video Chat</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Create or Join a Room</h3>
                    <p className="text-[#8B8B90] text-sm">Start a new video room or join an existing one</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Allow Camera Access</h3>
                    <p className="text-[#8B8B90] text-sm">Grant permission for your camera and microphone</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Start Chatting</h3>
                    <p className="text-[#8B8B90] text-sm">Connect with others in real-time video</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[#27272A]">
                <h3 className="text-white font-semibold mb-3">Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-[#8B8B90] text-sm">
                    <div className="w-1.5 h-1.5 bg-[#7A5AF8] rounded-full"></div>
                    WebRTC peer-to-peer video streaming
                  </li>
                  <li className="flex items-center gap-2 text-[#8B8B90] text-sm">
                    <div className="w-1.5 h-1.5 bg-[#7A5AF8] rounded-full"></div>
                    Toggle camera and microphone
                  </li>
                  <li className="flex items-center gap-2 text-[#8B8B90] text-sm">
                    <div className="w-1.5 h-1.5 bg-[#7A5AF8] rounded-full"></div>
                    Multiple participants support
                  </li>
                  <li className="flex items-center gap-2 text-[#8B8B90] text-sm">
                    <div className="w-1.5 h-1.5 bg-[#7A5AF8] rounded-full"></div>
                    Screen sharing capabilities
                  </li>
                  <li className="flex items-center gap-2 text-[#8B8B90] text-sm">
                    <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full"></div>
                    Tip participants with Bits
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Room Header */}
            <div className="bg-[#1A1A1E] border border-[#27272A] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-white text-lg">{activeRoom.room_name}</h2>
                  <p className="text-[#8B8B90] text-sm">
                    {remoteStreamArray.length + 1} participant(s) •{" "}
                    {isConnected ? (
                      <span className="text-green-400">Connected</span>
                    ) : (
                      <span className="text-yellow-400">Connecting...</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-[#7A5AF8]" />
                </div>
              </div>
            </div>

            {/* Video Grid */}
            <div
              className={`grid gap-4 ${
                remoteStreamArray.length === 0
                  ? "grid-cols-1 max-w-2xl mx-auto"
                  : remoteStreamArray.length === 1
                  ? "grid-cols-2"
                  : remoteStreamArray.length <= 3
                  ? "grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-2 lg:grid-cols-4"
              }`}
            >
              {/* Local Video */}
              <div className="bg-[#1A1A1E] border border-[#27272A] rounded-xl overflow-hidden aspect-video relative group">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${!isVideoEnabled ? "hidden" : ""}`}
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-[#0F0F0F] flex items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-3xl">
                        {user?.email?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded-lg flex items-center gap-2">
                  <span className="text-white text-sm font-semibold">You</span>
                  {!isAudioEnabled && <MicOff size={14} className="text-red-400" />}
                </div>
              </div>

              {/* Remote Videos */}
              {remoteStreamArray.map(([oderId, stream]) => {
                const participant = participants.find((p) => p.id === oderId);
                return (
                  <div
                    key={oderId}
                    className="bg-[#1A1A1E] border border-[#27272A] rounded-xl overflow-hidden aspect-video relative group"
                  >
                    <video
                      ref={(el) => {
                        if (el) remoteVideoRefs.current.set(oderId, el);
                      }}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <div className="bg-black/70 px-3 py-1 rounded-lg">
                        <span className="text-white text-sm font-semibold">
                          {participant?.name || "User"}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedParticipant({ id: oderId, ...participant });
                          setShowTipModal(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 bg-[#FFD700]/90 text-black px-3 py-1 rounded-lg flex items-center gap-1 transition-opacity"
                      >
                        <Coins size={14} />
                        <span className="text-sm font-semibold">Tip</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Waiting placeholder if no remote streams */}
              {remoteStreamArray.length === 0 && (
                <div className="bg-[#1A1A1E] border border-[#27272A] rounded-xl aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <Users size={48} className="mx-auto mb-4 text-[#8B8B90]" />
                    <p className="text-[#8B8B90]">Waiting for others to join...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleToggleVideo}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  isVideoEnabled
                    ? "bg-[#1A1A1E] border border-[#27272A] text-white hover:border-[#7A5AF8]"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
                title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
              >
                {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
              </button>

              <button
                onClick={handleToggleAudio}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  isAudioEnabled
                    ? "bg-[#1A1A1E] border border-[#27272A] text-white hover:border-[#7A5AF8]"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
                title={isAudioEnabled ? "Mute" : "Unmute"}
              >
                {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
              </button>

              <button
                onClick={handleLeaveRoom}
                className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-all"
                title="Leave room"
              >
                <PhoneOff size={24} />
              </button>

              <button
                onClick={handleScreenShare}
                className="w-14 h-14 rounded-full bg-[#1A1A1E] border border-[#27272A] text-white flex items-center justify-center hover:border-[#7A5AF8] transition-all"
                title="Share screen"
              >
                <MonitorUp size={24} />
              </button>
            </div>
          </div>
        )}

        {/* Create Room Modal */}
        {showCreateRoom && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1E] border border-[#27272A] rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white text-xl">Create Video Room</h2>
                <button
                  onClick={() => {
                    setShowCreateRoom(false);
                    setRoomName("");
                  }}
                  className="text-[#8B8B90] hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name..."
                className="w-full bg-[#0F0F0F] text-white placeholder-[#555555] border border-[#27272A] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] mb-4"
                onKeyPress={(e) => e.key === "Enter" && createRoom()}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateRoom(false);
                    setRoomName("");
                  }}
                  className="flex-1 bg-[#27272A] text-white px-4 py-2 rounded-lg hover:bg-[#3A3A3D] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={createRoom}
                  disabled={!roomName.trim()}
                  className="flex-1 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] text-white px-4 py-2 rounded-lg hover:from-[#6D4CE5] hover:to-[#8B5CF6] transition-all disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tip Modal */}
        {showTipModal && selectedParticipant && (
          <SendBitsModal
            recipient={{
              id: selectedParticipant.id,
              display_name: selectedParticipant.name,
            }}
            context="videochat"
            onClose={() => {
              setShowTipModal(false);
              setSelectedParticipant(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
