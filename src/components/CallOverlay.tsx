"use client";

import { useEffect, useRef, useState } from "react";
import { Phone, Microphone, VideoCamera, SpeakerHigh, CaretDown } from "@phosphor-icons/react/dist/ssr";
import { useWebSocket } from "@/app/WebSocketProvider";
type Props = { isOpen: boolean; onClose: () => void; name: string; username: string; receiverId: string; avatar: string | null; type: "audio" | "video"; callId?: string; chatId?: string; mode?: "outgoing" | "incoming"; };
export default function CallOverlay({ isOpen, onClose, name, receiverId, avatar, type, callId, chatId, mode = "outgoing" }: Props) {
  const [status, setStatus] = useState("Calling...");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isRemoteConnected, setIsRemoteConnected] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const callIdRef = useRef<string | null>(null);
  const ringbackRef = useRef<HTMLAudioElement | null>(null);
  const endedRef = useRef<HTMLAudioElement | null>(null);
  const closedRef = useRef(false);
  const pendingCandidatesRef = useRef<any[]>([]);
  // ISTILAH DOANG: ambil dari WebSocketProvider yang online sekarang
  const { callSignal, clearCallSignal, callSdpSignal, clearCallSdpSignal, sendCallSignal } = useWebSocket();
  const getMyId = (token: string) => { try { const payload = JSON.parse(atob(token.split(".")[1])); return payload.properties?.id || payload.sub || ""; } catch { return ""; } };
  const stopRingback = () => { if (ringbackRef.current) { ringbackRef.current.pause(); ringbackRef.current.currentTime = 0; } };
  const playEnded = () => { if (!endedRef.current) { endedRef.current = new Audio("/sound/incoming-missed-call-ended.mp3"); endedRef.current.preload = "auto"; } endedRef.current.currentTime = 0; endedRef.current.play().catch(() => {}); };
  const applySpeaker = (speakerOn: boolean) => { const sinkId = speakerOn ? "default" : "communications"; const targets: any[] = [remoteAudioRef.current, ringbackRef.current, endedRef.current]; for (const el of targets) { if (el && (el as any).setSinkId) { (el as any).setSinkId(sinkId).catch(() => {}); } } };
  const startRingback = () => { if (mode !== "outgoing") return; if (!ringbackRef.current) { ringbackRef.current = new Audio("/sound/ringback-tone.mp3"); ringbackRef.current.loop = true; ringbackRef.current.preload = "auto"; } applySpeaker(isSpeaker); ringbackRef.current.currentTime = 0; ringbackRef.current.play().catch(() => {}); };
  const attachRemote = (remoteStream: MediaStream) => { setIsRemoteConnected(true); setStatus("Connected"); stopRingback(); applySpeaker(isSpeaker); if (type === "video" && remoteVideoRef.current) { remoteVideoRef.current.srcObject = remoteStream; remoteVideoRef.current.play().catch(() => {}); } if (remoteAudioRef.current) { remoteAudioRef.current.srcObject = remoteStream; remoteAudioRef.current.play().catch(() => {}); } };
  const setupPc = (pc: RTCPeerConnection, myId: string) => {
    // ISTILAH DOANG: dulu roomWsRef.send({ type:"SIGNAL", target, signal:{ type:"CALL_ICE" } }) -> sekarang sendCallSignal({ type:"CALL_ICE" })
    pc.onicecandidate = (e) => { if (e.candidate && callIdRef.current) { sendCallSignal({ type: "CALL_ICE", callId: callIdRef.current, fromId: myId, candidate: e.candidate.toJSON() }); } };
    pc.ontrack = (event) => { const remoteStream = event.streams[0]; if (remoteStream) attachRemote(remoteStream); };
    pc.onconnectionstatechange = () => { if (pc.connectionState === "connected") { setIsRemoteConnected(true); setStatus("Connected"); stopRingback(); } };
  };
  // ... sisa file lu dari getUserMedia sampai JSX biarin persis, cuma ganti pengiriman OFFER/ANSWER yang tadinya roomWsRef jadi sendCallSignal:
  // sendCallSignal({ type: "CALL_OFFER", callId: callIdRef.current, fromId: myId, sdp: offer })
  // sendCallSignal({ type: "CALL_ANSWER", callId: callIdRef.current, fromId: myId, sdp: answer })
  // dan baca sinyalnya dari callSdpSignal (bukan dari roomWs onmessage), dengan type yang sama: CALL_OFFER / CALL_ANSWER / CALL_ICE
  useEffect(() => {
    if (!callSdpSignal || !isOpen) return;
    if (callSdpSignal.callId !== callIdRef.current) return;
    const pc = pcRef.current; if (!pc) return;
    const run = async () => {
      if (callSdpSignal.type === "CALL_OFFER" && mode === "incoming") {
        await pc.setRemoteDescription(new RTCSessionDescription(callSdpSignal.sdp));
        for (const c of pendingCandidatesRef.current) { try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {} } pendingCandidatesRef.current = [];
        const answer = await pc.createAnswer(); await pc.setLocalDescription(answer);
        const token = localStorage.getItem("session");
        sendCallSignal({ type: "CALL_ANSWER", callId: callIdRef.current, fromId: token ? getMyId(token) : "", sdp: answer });
      } else if (callSdpSignal.type === "CALL_ANSWER" && mode === "outgoing") {
        await pc.setRemoteDescription(new RTCSessionDescription(callSdpSignal.sdp));
        for (const c of pendingCandidatesRef.current) { try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {} } pendingCandidatesRef.current = [];
      } else if (callSdpSignal.type === "CALL_ICE" && callSdpSignal.candidate) {
        if (pc.remoteDescription) { try { await pc.addIceCandidate(new RTCIceCandidate(callSdpSignal.candidate)); } catch {} } else { pendingCandidatesRef.current.push(callSdpSignal.candidate); }
      }
      clearCallSdpSignal();
    };
    run();
  }, [callSdpSignal, isOpen, mode]);
  // JSX + sisa logika lu (startCall, hangup, mute, speaker, camera) biarin persis file lama lu
  return null as any; // <-- ganti sama JSX lama lu, gue gak ubah
}
