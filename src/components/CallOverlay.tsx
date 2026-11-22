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
  // HAPUS: roomWsRef — istilah lama
  const ringbackRef = useRef<HTMLAudioElement | null>(null);
  const endedRef = useRef<HTMLAudioElement | null>(null);
  const closedRef = useRef(false);
  const pendingCandidatesRef = useRef<any[]>([]);
  // ISTILAH DOANG: tambah callSdpSignal + sendCallSignal
  const { callSignal, clearCallSignal, callSdpSignal, clearCallSdpSignal, sendCallSignal } = useWebSocket();
  const getMyId = (token: string) => { try { const payload = JSON.parse(atob(token.split(".")[1])); return payload.properties?.id || payload.sub || ""; } catch { return ""; } };
  const stopRingback = () => { if (ringbackRef.current) { ringbackRef.current.pause(); ringbackRef.current.currentTime = 0; } };
  const playEnded = () => { if (!endedRef.current) { endedRef.current = new Audio("/sound/incoming-missed-call-ended.mp3"); endedRef.current.preload = "auto"; } endedRef.current.currentTime = 0; endedRef.current.play().catch(() => {}); };
  const applySpeaker = (speakerOn: boolean) => { const sinkId = speakerOn ? "default" : "communications"; const targets: any[] = [remoteAudioRef.current, ringbackRef.current, endedRef.current]; for (const el of targets) { if (el && (el as any).setSinkId) { (el as any).setSinkId(sinkId).catch(() => {}); } } };
  const startRingback = () => { if (mode !== "outgoing") return; if (!ringbackRef.current) { ringbackRef.current = new Audio("/sound/ringback-tone.mp3"); ringbackRef.current.loop = true; ringbackRef.current.preload = "auto"; } applySpeaker(isSpeaker); ringbackRef.current.currentTime = 0; ringbackRef.current.play().catch(() => {}); };
  const attachRemote = (remoteStream: MediaStream) => { setIsRemoteConnected(true); setStatus("Connected"); stopRingback(); applySpeaker(isSpeaker); if (type === "video" && remoteVideoRef.current) { remoteVideoRef.current.srcObject = remoteStream; remoteVideoRef.current.play().catch(() => {}); } if (remoteAudioRef.current) { remoteAudioRef.current.srcObject = remoteStream; remoteAudioRef.current.play().catch(() => {}); } };
  const setupPc = (pc: RTCPeerConnection, myId: string) => {
    pc.onicecandidate = (e) => {
      if (e.candidate && callIdRef.current) {
        // ISTILAH DOANG: dulu roomWs.send({ type:"SIGNAL", target, signal:{ type:"CALL_ICE" } }) -> sekarang ini
        sendCallSignal({ type: "CALL_ICE", callId: callIdRef.current, fromId: myId, candidate: e.candidate.toJSON() });
      }
    };
    pc.ontrack = (event) => { const remoteStream = event.streams[0]; if (remoteStream) attachRemote(remoteStream); };
    pc.onconnectionstatechange = () => { if (pc.connectionState === "connected") { setIsRemoteConnected(true); setStatus("Connected"); stopRingback(); } };
  };
  useEffect(() => {
    if (!isOpen) return;
    closedRef.current = false;
    pendingCandidatesRef.current = [];
    setStatus(mode === "incoming" ? "Connecting..." : "Calling...");
    setIsMuted(false); setIsSpeaker(false); setIsCameraOff(false); setHasPermission(false); setIsRemoteConnected(false);
    callIdRef.current = callId || null;
    const startCall = async () => {
      const token = localStorage.getItem("session");
      if (!token) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === "video" });
        streamRef.current = stream;
        setHasPermission(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          await localVideoRef
