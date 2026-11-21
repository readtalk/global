"use client";

import { useEffect, useRef, useState } from "react";
import { Phone, Microphone, VideoCamera, SpeakerHigh, CaretDown } from "@phosphor-icons/react/dist/ssr";
import { useWebSocket } from "@/app/WebSocketProvider";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  username: string;
  receiverId: string;
  avatar: string | null;
  type: "audio" | "video";
  callId?: string;
  mode?: "outgoing" | "incoming";
};

export default function CallOverlay({ isOpen, onClose, name, receiverId, avatar, type, callId, mode = "outgoing" }: Props) {
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
  const { callSignal, clearCallSignal } = useWebSocket();

  const getMyId = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.properties?.id || payload.sub || "";
    } catch {
      return "";
    }
  };

  const stopRingback = () => {
    if (ringbackRef.current) {
      ringbackRef.current.pause();
      ringbackRef.current.currentTime = 0;
    }
  };

  const playEnded = () => {
    if (!endedRef.current) {
      endedRef.current = new Audio("/sound/incoming-missed-call-ended.mp3");
      endedRef.current.preload = "auto";
    }
    endedRef.current.currentTime = 0;
    endedRef.current.play().catch(() => {});
  };

  const startRingback = () => {
    if (mode !== "outgoing") return;
    if (!ringbackRef.current) {
      ringbackRef.current = new Audio("/sound/ringback-tone.mp3");
      ringbackRef.current.loop = true;
      ringbackRef.current.preload = "auto";
    }
    ringbackRef.current.currentTime = 0;
    ringbackRef.current.play().catch(() => {});
  };

  useEffect(() => {
    if (!isOpen) return;
    closedRef.current = false;
    setStatus(mode === "incoming" ? "Connected" : "Calling...");
    setIsMuted(false);
    setIsSpeaker(false);
    setIsCameraOff(false);
    setHasPermission(false);
    setIsRemoteConnected(false);
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
          await localVideoRef.current.play().catch(() => {});
        }
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
        });
        pcRef.current = pc;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        pc.ontrack = (event) => {
          const remoteStream = event.streams[0];
          if (!remoteStream) return;
          setIsRemoteConnected(true);
          setStatus("Connected");
          stopRingback();
          if (type === "video" && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(() => {});
          }
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current.play().catch(() => {});
          }
        };
        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "connected") {
            setIsRemoteConnected(true);
            setStatus("Connected");
            stopRingback();
          }
          if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
            setIsRemoteConnected(false);
          }
        };
        let myId = getMyId(token);
        if (mode === "outgoing") {
          const res = await fetch("https://auth.readtalk.workers.dev/calls", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, "X-User-Id": myId },
            body: JSON.stringify({ target_user_id: receiverId, type }),
          });
          const data = (await res.json().catch(() => null)) as { success?: boolean; callId?: string } | null;
          if (data && data.success && data.callId) {
            callIdRef.current = data.callId;
          }
          setStatus("Ringing...");
          startRingback();
        } else {
          if (callId) callIdRef.current = callId;
          setStatus("Connected");
        }
      } catch (error) {
        setStatus("Permission denied");
      }
    };
    startCall();
    return () => {
      stopRingback();
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    };
  }, [isOpen, type, receiverId]);

  useEffect(() => {
    if (hasPermission && localVideoRef.current && streamRef.current) {
      localVideoRef.current.srcObject = streamRef.current;
      localVideoRef.current.play().catch(() => {});
    }
  }, [hasPermission, type]);

  useEffect(() => {
    if (!callSignal) return;
    if (!callIdRef.current) return;
    if (callSignal.callId !== callIdRef.current) return;
    if (callSignal.type === "CALL_ACCEPTED") {
      setStatus("Connected");
      setIsRemoteConnected(true);
      stopRingback();
      clearCallSignal();
    }
    if (callSignal.type === "CALL_ENDED" || callSignal.type === "CALL_DECLINED" || callSignal.type === "CALL_CANCELLED" || callSignal.type === "CALL_MISSED") {
      if (!closedRef.current) {
        closedRef.current = true;
        stopRingback();
        clearCallSignal();
        onClose();
      }
    }
  }, [callSignal, clearCallSignal, onClose]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    streamRef.current?.getAudioTracks().forEach((track) => { track.enabled = !next; });
  };

  const toggleCamera = () => {
    const next = !isCameraOff;
    setIsCameraOff(next);
    streamRef.current?.getVideoTracks().forEach((track) => { track.enabled = !next; });
  };

  const toggleSpeaker = () => setIsSpeaker(!isSpeaker);

  const handleEnd = async () => {
    if (closedRef.current) {
      onClose();
      return;
    }
    closedRef.current = true;
    stopRingback();
    playEnded();
    const token = localStorage.getItem("session");
    if (token && callIdRef.current) {
      try {
        let myId = getMyId(token);
        await fetch(`https://auth.readtalk.workers.dev/calls/${callIdRef.current}/end`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, "X-User-Id": myId },
          body: JSON.stringify({}),
        });
      } catch {}
    }
    onClose();
  };

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 bg-black/50 z-[60] md:hidden transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} />
      <div className={`fixed z-[70] bg-zinc-950 text-white flex flex-col overflow-hidden transition-transform duration-300 inset-0 ${isOpen ? "translate-y-0" : "translate-y-full"} md:inset-auto md:bottom-6 md:right-6 md:w-[360px] md:h-[560px] md:rounded-2xl md:shadow-2xl md:border md:border-zinc-800 ${isOpen ? "md:translate-y-0" : "md:translate-y-10 md:pointer-events-none"}`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={avatar || "/default-avatar.png"} className="w-9 h-9 rounded-full object-cover bg-zinc-800" alt="" />
            <div>
              <p className="font-semibold leading-none">{name}</p>
              <p className="text-xs text-zinc-400 mt-1">{type === "audio" ? "Voice call" : "Video call"} • {status}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-800"><CaretDown size={20} /></button>
        </div>
        <div className="relative flex-1 flex flex-col items-center justify-center gap-4">
          {type === "audio" ? (
            <>
              <img src={avatar || "/default-avatar.png"} className="w-32 h-32 rounded-full object-cover bg-zinc-800" alt="" />
              <p className="text-zinc-400 text-sm">{status}</p>
              <audio ref={remoteAudioRef} autoPlay playsInline />
            </>
          ) : (
            <div className="w-full flex-1 mx-4 mb-2 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-500 text-sm overflow-hidden">
              {isRemoteConnected ? (
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : hasPermission ? (
                <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">Waiting for {name}...</div>
              ) : (
                "Video coming"
              )}
              <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
            </div>
          )}
          {type === "video" && (
            <div className="absolute bottom-28 right-4 w-24 h-32 bg-zinc-800 rounded-xl border border-zinc-700 flex items-center justify-center text-xs text-zinc-400 overflow-hidden">
              {hasPermission ? <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" /> : "You"}
            </div>
          )}
        </div>
        <div className="pb-8 pt-4 px-6 flex items-center justify-center gap-4">
          <button onClick={toggleMute} className={`w-12 h-12 rounded-full flex items-center justify-center ${isMuted ? "bg-white text-black" : "bg-zinc-800"}`}><Microphone size={20} /></button>
          {type === "video" && <button onClick={toggleCamera} className={`w-12 h-12 rounded-full flex items-center justify-center ${isCameraOff ? "bg-white text-black" : "bg-zinc-800"}`}><VideoCamera size={20} /></button>}
          <button onClick={toggleSpeaker} className={`w-12 h-12 rounded-full flex items-center justify-center ${isSpeaker ? "bg-white text-black" : "bg-zinc-800"}`}><SpeakerHigh size={20} /></button>
          <button onClick={handleEnd} className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center"><Phone size={24} weight="fill" className="rotate-[135deg]" /></button>
        </div>
      </div>
    </>
  );
}
