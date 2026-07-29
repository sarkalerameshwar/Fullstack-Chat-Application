import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { startCallRingtone, stopCallRingtone } from "../lib/callRingtone.js";
import toast from "react-hot-toast";

const iceServers = [{ urls: "stun:stun.l.google.com:19302" }, ...(import.meta.env.VITE_TURN_URL ? [{ urls: import.meta.env.VITE_TURN_URL.split(","), username: import.meta.env.VITE_TURN_USERNAME, credential: import.meta.env.VITE_TURN_CREDENTIAL }] : [])];
export function useWebRTCCall(selectedUser) {
  const socket = useAuthStore((s) => s.socket); const authUser = useAuthStore((s) => s.authUser);
  const peer = useRef(null), localStream = useRef(null), remoteStream = useRef(null), callId = useRef(null), timer = useRef(null), pendingOffer = useRef(null), pendingCandidates = useRef([]);
  const [call, setCall] = useState(null); const [seconds, setSeconds] = useState(0); const [localMedia, setLocalMedia] = useState(null); const [remoteMedia, setRemoteMedia] = useState(null);
  const cleanup = useCallback(() => { stopCallRingtone(); clearInterval(timer.current); peer.current?.close(); peer.current = null; localStream.current?.getTracks().forEach((t) => t.stop()); localStream.current = null; setLocalMedia(null); setRemoteMedia(null); setCall(null); setSeconds(0); callId.current = null; }, []);
  const startTimer = useCallback(() => { clearInterval(timer.current); timer.current = setInterval(() => setSeconds((v) => v + 1), 1000); }, []);
  const createPeer = useCallback(async (target, stream) => { const pc = new RTCPeerConnection({ iceServers, iceCandidatePoolSize: 4 }); peer.current = pc; remoteStream.current = new MediaStream(); setRemoteMedia(remoteStream.current); stream.getTracks().forEach((track) => pc.addTrack(track, stream)); pc.ontrack = (event) => { event.streams[0].getTracks().forEach((t) => remoteStream.current.addTrack(t)); setRemoteMedia(new MediaStream(remoteStream.current.getTracks())); }; pc.onicecandidate = ({ candidate }) => candidate && socket.emit("ice-candidate", { callId: callId.current, payload: candidate }); pc.onconnectionstatechange = () => { if (["failed", "disconnected"].includes(pc.connectionState)) pc.restartIce(); if (pc.connectionState === "connected") startTimer(); }; return pc; }, [socket, startTimer]);
  const requestMedia = useCallback(async (type) => {
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: true, video: type === "video" });
    } catch (error) {
      toast.error(`Allow ${type === "video" ? "camera and microphone" : "microphone"} access to start this call.`);
      throw error;
    }
  }, []);
  const begin = useCallback(async (type) => {
    if (!selectedUser || !socket?.connected) return toast.error("Connecting to chat server. Please try again in a moment.");
    try {
      const stream = await requestMedia(type); localStream.current = stream; setLocalMedia(stream);
      socket.emit("start-call", { to: selectedUser._id, type }, async (result) => {
        if (!result?.ok) { toast.error(result?.error || "Unable to start call"); return cleanup(); }
        callId.current = result.callId; setCall({ callId: result.callId, peerId: selectedUser._id, type, state: "ringing", outgoing: true, isMuted: false, isCameraOn: type === "video", isPeerMuted: false });
        const pc = await createPeer(selectedUser._id, stream); const offer = await pc.createOffer(); await pc.setLocalDescription(offer);
        socket.emit("offer", { callId: result.callId, payload: offer });
      });
    } catch { cleanup(); }
  }, [selectedUser, socket, createPeer, cleanup, requestMedia]);
  const accept = useCallback(async () => {
    if (!call || !socket?.connected) return toast.error("Connection lost. Please try again.");
    try {
      const stream = await requestMedia(call.type); localStream.current = stream; setLocalMedia(stream); callId.current = call.callId;
      const pc = await createPeer(call.peerId, stream);
      if (pendingOffer.current) { await pc.setRemoteDescription(pendingOffer.current); for (const candidate of pendingCandidates.current.splice(0)) await pc.addIceCandidate(candidate); const answer = await pc.createAnswer(); await pc.setLocalDescription(answer); socket.emit("answer", { callId: call.callId, payload: answer }); pendingOffer.current = null; }
      socket.emit("accept-call", { callId: call.callId }, (result) => { if (result?.ok) setCall((c) => ({ ...c, state: "active" })); else { toast.error("Call is no longer available"); cleanup(); } });
    } catch { cleanup(); }
  }, [call, socket, createPeer, cleanup, requestMedia]);
  const end = useCallback(() => { if (callId.current && socket) socket.emit("end-call", { callId: callId.current }); cleanup(); }, [socket, cleanup]);
  const reject = useCallback(() => { socket?.emit("reject-call", { callId: call?.callId }); cleanup(); }, [socket, call, cleanup]);
  const toggle = useCallback((kind) => {
    const tracks = localStream.current?.getTracks().filter((track) => track.kind === kind) || [];
    if (tracks.length === 0) return;
    const enabled = !tracks[0].enabled;
    tracks.forEach((track) => { track.enabled = enabled; });
    setCall((current) => current && ({
      ...current,
      [kind === "audio" ? "isMuted" : "isCameraOn"]: kind === "audio" ? !enabled : enabled,
    }));
    socket?.emit(kind === "audio" ? "mute" : "camera-toggle", { callId: callId.current, payload: { enabled } });
  }, [socket]);
  const shareScreen = useCallback(async () => { try { const screen = await navigator.mediaDevices.getDisplayMedia({ video: true }); const track = screen.getVideoTracks()[0]; const sender = peer.current?.getSenders().find((s) => s.track?.kind === "video"); await sender?.replaceTrack(track); track.onended = () => localStream.current?.getVideoTracks()[0] && sender?.replaceTrack(localStream.current.getVideoTracks()[0]); socket?.emit("screen-share", { callId: callId.current, payload: { active: true } }); } catch { /* Screen sharing was cancelled. */ } }, [socket]);
  useEffect(() => { if (!socket) return; const incoming = (p) => { if (typeof Notification !== "undefined" && Notification.permission === "granted") new Notification("Incoming call", { body: "You have an incoming " + p.type + " call" }); if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]); setCall({ callId: p.callId, peerId: p.from, type: p.type, state: "incoming", outgoing: false, isMuted: false, isCameraOn: p.type === "video", isPeerMuted: false }); }; const offer = async ({ payload }) => { if (!peer.current) { pendingOffer.current = payload; return; } await peer.current.setRemoteDescription(payload); const answer = await peer.current.createAnswer(); await peer.current.setLocalDescription(answer); socket.emit("answer", { callId: callId.current, payload: answer }); }; const answer = async ({ payload }) => { await peer.current?.setRemoteDescription(payload); setCall((c) => c && ({ ...c, state: "active" })); }; const candidate = ({ payload }) => { if (!peer.current) pendingCandidates.current.push(payload); else peer.current.addIceCandidate(payload).catch(() => {}); }; const mute = ({ payload }) => setCall((current) => current && ({ ...current, isPeerMuted: !payload?.enabled })); socket.on("incoming-call", incoming); socket.on("offer", offer); socket.on("answer", answer); socket.on("ice-candidate", candidate); socket.on("mute", mute); socket.on("call-ended", cleanup); return () => { socket.off("incoming-call", incoming); socket.off("offer", offer); socket.off("answer", answer); socket.off("ice-candidate", candidate); socket.off("mute", mute); socket.off("call-ended", cleanup); }; }, [socket, cleanup]);
  useEffect(() => () => cleanup(), [cleanup]);

  useEffect(() => {
    const shouldRing = call?.state === "incoming" || call?.state === "ringing";
    if (shouldRing) {
      startCallRingtone();
    } else {
      stopCallRingtone();
    }
    return () => stopCallRingtone();
  }, [call?.state]);

  return { call, seconds, localMedia, remoteMedia, begin, accept, reject, end, toggle, shareScreen, authUser };
}
