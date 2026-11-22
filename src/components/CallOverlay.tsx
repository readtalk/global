"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useWebSocket } from "./WebSocketProvider";

type Props = {
  callId: string;
  chatId: string;
  callType: "audio" | "video";
  mode: "outgoing" | "incoming"; // outgoing = yang pencet Call di CallOverlay, incoming = yang pencet Accept di IncomingCallOverlay
  onClose: () => void;
};

export default function CallOverlay({ callId, chatId, callType, mode, onClose }: Props) {
  const { callSignal, callSdpSignal, clearCallSdpSignal, sendCallSignal, connectRoomWs, disconnectRoomWs, clearCallSignal } = useWebSocket();

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
    disconnectRoomWs();
  }, [disconnectRoomWs]);

  // Tombol End di CallOverlay -> DATA_DO -> CALL_ENDED -> ROOM_DO putus
  const handleEnd = useCallback(async () => {
    try {
      await fetch(`https://auth.readtalk.workers.dev/call/${callId}/end`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getSession()}` },
      });
    } catch {}
    cleanup();
    clearCallSignal();
    onClose();
  }, [callId, cleanup, clearCallSignal, onClose]);

  // DATA_DO -> ROOM_DO: pas CALL_ACCEPTED, baru connect ROOM_DO + bikin PeerConnection
  useEffect(() => {
    if (didInitRef.current) return;
    // Incoming: tombol Accept di IncomingCallOverlay udah dipencet, langsung connect ROOM_DO
    // Outgoing: nunggu CALL_ACCEPTED dari DATA_DO dulu
    const shouldStart = mode === "incoming" || (callSignal?.type === "CALL_ACCEPTED" && callSignal.callId === callId);
    if (!shouldStart) return;
    didInitRef.current = true;

    const start = async () => {
      // 1. Pindah DATA_DO -> ROOM_DO
      connectRoomWs(callId);

      // 2. Bikin PeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      // 3. Media lokal sesuai tombol Call yang dipencet: audio / video
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      pc.ontrack = (e) => {
        const s = e.streams[0];
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = s;
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = s;
        setStatus("connected");
      };

      // 4. ICE -> kirim lewat ROOM_DO, bukan DATA_DO
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          sendCallSignal({ type: "CALL_ICE", callId, chatId, fromId: getMyId(), candidate: e.candidate });
        }
      };

      // 5. Caller (CallOverlay outgoing) yang bikin Offer, callee nunggu Offer
      if (mode === "outgoing") {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        // Tunggu ROOM_DO connect dulu dikit, biar Offer gak kebuang kayak kemaren
        setTimeout(() => {
          sendCallSignal({ type: "CALL_OFFER", callId, chatId, fromId: getMyId(), sdp: pc.localDescription });
        }, 400);
        setStatus("ringing...");
      }
    };
    start();
  }, [mode, callSignal, callId, chatId, callType, connectRoomWs]);

  // Terima SDP lewat ROOM_DO -> callSdpSignal
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

  // Lawan pencet End / Decline -> DATA_DO kirim CALL_ENDED -> tutup
  useEffect(() => {
    if (!callSignal || callSignal.callId !== callId) return;
    if (callSignal.type === "CALL_ENDED" || callSignal.type === "CALL_DECLINED" || callSignal.type === "CALL_CANCELLED" || callSignal.type === "CALL_MISSED") {
      cleanup();
      clearCallSignal();
      onClose();
    }
  }, [callSignal, callId, cleanup, clearCallSignal, onClose]);

  useEffect(() => () => cleanup(), [cleanup]);

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
      <p className="text-white/70 text-sm">{status} - {callType}</p>

      {callType === "video" ? (
        <>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <video ref={localVideoRef} autoPlay muted playsInline className="absolute bottom-24 right-4 w-32 h-44 object-cover rounded-xl border" />
        </>
      ) : (
        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl">📞</div>
      )}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Tombol di CallOverlay */}
      <div className="absolute bottom-6 flex gap-4">
        <button onClick={toggleMute} className="w-14 h-14 rounded-full bg-white/20 text-white">{muted ? "🔇" : "🎤"}</button>
        {callType === "video" && <button onClick={toggleCam} className="w-14 h-14 rounded-full bg-white/20 text-white">{camOff ? "📷❌" : "📷"}</button>}
        <button onClick={handleEnd} className="w-14 h-14 rounded-full bg-red-500 text-white text-2xl">📞</button>
      </div>
    </div>
  );
}
