import { useState, useEffect, useRef, useCallback } from "react";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];

export default function useWebRTC(roomId, userId) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [participants, setParticipants] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const peerConnections = useRef(new Map());
  const pollingInterval = useRef(null);
  const lastTimestamp = useRef(Date.now());

  // Start local media stream
  const startLocalStream = useCallback(async (video = true, audio = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio });
      setLocalStream(stream);
      return stream;
    } catch (err) {
      setError("Failed to access camera/microphone");
      throw err;
    }
  }, []);

  // Stop local stream
  const stopLocalStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }, [localStream]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }, [localStream]);

  // Send signal to server
  const sendSignal = useCallback(
    async (signalType, signalData, targetUserId = null) => {
      try {
        await fetch("/api/webrtc/signal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room_id: roomId,
            target_user_id: targetUserId,
            signal_type: signalType,
            signal_data: signalData,
          }),
        });
      } catch (err) {
        console.error("Failed to send signal:", err);
      }
    },
    [roomId]
  );

  // Create peer connection for a user
  const createPeerConnection = useCallback(
    (peerId, isInitiator = false) => {
      if (peerConnections.current.has(peerId)) {
        return peerConnections.current.get(peerId);
      }

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      // Add local tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal("ice-candidate", event.candidate, peerId);
        }
      };

      // Handle remote stream
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setRemoteStreams((prev) => {
          const next = new Map(prev);
          next.set(peerId, remoteStream);
          return next;
        });
      };

      // Handle connection state
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setIsConnected(true);
        } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
          // Remove peer
          setRemoteStreams((prev) => {
            const next = new Map(prev);
            next.delete(peerId);
            return next;
          });
          peerConnections.current.delete(peerId);
        }
      };

      peerConnections.current.set(peerId, pc);

      // If initiator, create and send offer
      if (isInitiator) {
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            sendSignal("offer", pc.localDescription, peerId);
          })
          .catch(console.error);
      }

      return pc;
    },
    [localStream, sendSignal]
  );

  // Handle incoming signals
  const handleSignal = useCallback(
    async (signal) => {
      const { sender_id, signal_type, signal_data } = signal;

      if (signal_type === "join") {
        // New user joined, create offer
        createPeerConnection(sender_id, true);
        setParticipants((prev) => {
          if (!prev.find((p) => p.id === sender_id)) {
            return [...prev, { id: sender_id, name: signal.sender_name || signal.sender_email }];
          }
          return prev;
        });
      } else if (signal_type === "leave") {
        // User left
        const pc = peerConnections.current.get(sender_id);
        if (pc) {
          pc.close();
          peerConnections.current.delete(sender_id);
        }
        setRemoteStreams((prev) => {
          const next = new Map(prev);
          next.delete(sender_id);
          return next;
        });
        setParticipants((prev) => prev.filter((p) => p.id !== sender_id));
      } else if (signal_type === "offer") {
        // Received offer, create answer
        const pc = createPeerConnection(sender_id, false);
        await pc.setRemoteDescription(new RTCSessionDescription(signal_data));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal("answer", pc.localDescription, sender_id);
      } else if (signal_type === "answer") {
        // Received answer
        const pc = peerConnections.current.get(sender_id);
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal_data));
        }
      } else if (signal_type === "ice-candidate") {
        // Received ICE candidate
        const pc = peerConnections.current.get(sender_id);
        if (pc && signal_data) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(signal_data));
          } catch (err) {
            console.error("Error adding ICE candidate:", err);
          }
        }
      }
    },
    [createPeerConnection, sendSignal]
  );

  // Poll for signals
  const pollSignals = useCallback(async () => {
    if (!roomId) return;

    try {
      const res = await fetch(`/api/webrtc/signal?room_id=${roomId}&since=${lastTimestamp.current}`);
      if (!res.ok) return;

      const data = await res.json();
      lastTimestamp.current = data.timestamp;

      for (const signal of data.signals) {
        await handleSignal(signal);
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  }, [roomId, handleSignal]);

  // Join room
  const joinRoom = useCallback(async () => {
    if (!roomId || !localStream) return;

    // Announce join
    await sendSignal("join", { userId });

    // Start polling
    pollingInterval.current = setInterval(pollSignals, 1000);
    pollSignals();
  }, [roomId, localStream, userId, sendSignal, pollSignals]);

  // Leave room
  const leaveRoom = useCallback(async () => {
    // Stop polling
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }

    // Announce leave
    await sendSignal("leave", { userId });

    // Close all peer connections
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();

    // Clear remote streams
    setRemoteStreams(new Map());
    setParticipants([]);
    setIsConnected(false);

    // Stop local stream
    stopLocalStream();
  }, [userId, sendSignal, stopLocalStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
      peerConnections.current.forEach((pc) => pc.close());
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
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
  };
}

