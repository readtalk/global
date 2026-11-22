"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useWebSocket } from "@/app/WebSocketProvider";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  username: string;
  receiverId: string;
  avatar: string | null;
  type: "audio" | "video"; // BUKAN callType, samain sama IncomingCallOverlay
  callId: string;
  chatId?: string; // BARU, dari incomingCall.chatId
  mode: "incoming" | "outgoing";
};

export default function CallOverlay({ isOpen, onClose, name, username, receiverId, avatar, type, callId, chatId, mode }: Props) {
  const { callSignal, callSdpSignal, clearCallSdpSignal, sendCallSignal, clearCallSignal } = useWebSocket();

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState(mode === "outgoing" ? "calling..." : "connecting...");
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const didInitRef = useRef(false);

  const getSession = () => localStorage.getItem("session") || "";
  const getMyId = () => {
    try { const p = JSON.parse(atob(getSession().split(".")[1])); return p.properties?.id || p.sub; } catch { return ""; }
  };

  const cleanup = useCallback(() => {
    try { pcRef.current?.close(); } catch {}
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
  }, []);

  const handleEnd = useCallback(async () => {
    try {
      await fetch(`https://auth.readtalk.workers.dev/call/${callId}/end`, { method: "POST", headers: { Authorization: `Bearer ${getSession()}` } });
    } catch {}
    cleanup();
    clearCallSignal();
    onClose();
  }, [callId, cleanup, clearCallSignal, onClose]);

  // FIX: incoming JANGAN nunggu CALL_ACCEPTED. Lu sendiri yang Accept, jadi langsung start.
  // outgoing baru nunggu CALL_ACCEPTED dari DATA_DO.
  useEffect(() => {
    if (!isOpen || didInitRef.current) return;
    const shouldStart = mode === "incoming" || (callSignal?.type === "CALL_ACCEPTED" && callSignal.callId === callId);
    if (!shouldStart) return;
    didInitRef.current = true;

    const start = async () => {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pcRef.current = pc;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === "video" });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      pc.ontrack = (e) => {
        const s = e.streams[0];
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = s;
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = s;
        setStatus("connected");
      };
      pc.onicecandidate = (e) => {
        if (e.candidate) sendCallSignal({ type: "CALL_ICE", callId, chatId, fromId: getMyId(), candidate: e.candidate });
      };
      if (mode === "outgoing") {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendCallSignal({ type: "CALL_OFFER", callId, chatId, fromId: getMyId(), sdp: pc.localDescription });
        setStatus("ringing...");
      }
    };
    start();
  }, [isOpen, mode, callSignal, callId, chatId, type, sendCallSignal]);

  useEffect(() => {
    if (!callSdpSignal || callSdpSignal.callId !== callId) return;
    const pc = pcRef.current;
    if (!pc) return;
    const handle = async () => {
      if (callSdpSignal.type === "CALL_OFFER" && mode === "incoming") {
        await pc.setRemoteDescription(new RTCSessionDescription(callSdpSignal.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendCallSignal({ type: "CALL_ANSWER", callId, chatId, fromId: getMyId(), sdp: pc.localDescription });
        setStatus("connected");
      } else if (callSdpSignal.type === "CALL_ANSWER" && mode === "outgoing") {
        await pc.setRemoteDescription(new RTCSessionDescription(callSdpSignal.sdp));
        setStatus("connected");
      } else if (callSdpSignal.type === "CALL_ICE" && callSdpSignal.candidate) {
        try { await pc.addIceCandidate(new RTCIceCandidate(callSdpSignal.candidate)); } catch {}
      }
      clearCallSdpSignal();
    };
    handle();
  }, [callSdpSignal, callId, chatId, mode, sendCallSignal, clearCallSdpSignal]);

  useEffect(() => {
    if (!callSignal || callSignal.callId !== callId) return;
    if (callSignal.type === "CALL_ENDED" || callSignal.type === "CALL_DECLINED" || callSignal.type === "CALL_CANCELLED" || callSignal.type === "CALL_MISSED") {
      cleanup();
      clearCallSignal();
      onClose();
    }
  }, [callSignal, callId, cleanup, clearCallSignal, onClose]);

  useEffect(() => () => cleanup(), [cleanup]);
  useEffect(() => { if (!isOpen) didInitRef.current = false; }, [isOpen]);

  if (!isOpen) return null;

  const toggleMute = () => {
    const t = localStreamRef.current?.getAudioTracks()[0];
    if (t) { t.enabled = !t.enabled; setMuted(!t.enabled); }
  };
  const toggleCam = () => {
    const t = localStreamRef.current?.getVideoTracks()[0];
    if (t) { t.enabled = !t.enabled; setCamOff(!t.enabled); }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center">
      <p className="text-white/70 text-sm">{status} - {name} @{username}</p>
      {type === "video" ? (
        <>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <video ref={localVideoRef} autoPlay muted playsInline className="absolute bottom-24 right-4 w-32 h-44 object-cover rounded-xl border" />
        </>
      ) : (
        <img src={avatar || "/default-avatar.png"} className="w-28 h-28 rounded-full object-cover" alt="" />
      )}
      <audio ref={remoteAudioRef} autoPlay playsInline />
      <div className="absolute bottom-6 flex gap-4">
        <button onClick={toggleMute} className="w-14 h-14 rounded-full bg-white/20 text-white">{muted ? "🔇" : "🎤"}</button>
        {type === "video" && <button onClick={toggleCam} className="w-14 h-14 rounded-full bg-white/20 text-white">{camOff ? "📷❌" : "📷"}</button>}
        <button onClick={handleEnd} className="w-14 h-14 rounded-full bg-red-500 text-white text-2xl">📞</button>
      </div>
    </div>
  );
}
