"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  chatId?: string;
  mode?: "outgoing" | "incoming";
};

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
  const didInitRef = useRef(false);

  // Pake provider, jangan bikin roomWs sendiri. Provider udah samain istilah sama auth.ts.
  const { callSignal, clearCallSignal, callSdpSignal, clearCallSdpSignal, sendCallSignal } = useWebSocket();

  const getMyId = (token: string) => {
    try { const payload = JSON.parse(atob(token.split(".")[1])); return payload.properties?.id || payload.sub || ""; } catch { return ""; }
  };

  const stopRingback = () => {
    if (ringbackRef.current) { ringbackRef.current.pause(); ringbackRef.current.currentTime = 0; }
  };

  const playEnded = () => {
    if (!endedRef.current) {
      endedRef.current = new Audio("/sound/incoming-missed-call-ended.mp3");
      endedRef.current.preload = "auto";
    }
    endedRef.current.currentTime = 0;
    endedRef.current.play().catch(() => {});
  };

  const applySpeaker = (speakerOn: boolean) => {
    const sinkId = speakerOn ? "default" : "communications";
    const targets: any[] = [remoteAudioRef.current, ringbackRef.current, endedRef.current];
    for (const el of targets) {
      if (el && (el as any).setSinkId) { (el as any).setSinkId(sinkId).catch(() => {}); }
    }
  };

  const startRingback = () => {
    if (mode !== "outgoing") return;
    if (!ringbackRef.current) {
      ringbackRef.current = new Audio("/sound/ringback-tone.mp3");
      ringbackRef.current.loop = true;
      ringbackRef.current.preload = "auto";
    }
    applySpeaker(isSpeaker);
    ringbackRef.current.currentTime = 0;
    ringbackRef.current.play().catch(() => {});
  };

  const attachRemote = (remoteStream: MediaStream) => {
    setIsRemoteConnected(true);
    setStatus("Connected");
    stopRingback();
    applySpeaker(isSpeaker);
    if (type === "video" && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(() => {});
    }
  };

  const cleanup = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    stopRingback();
    try { pcRef.current?.close(); } catch {}
    pcRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    pendingCandidatesRef.current = [];
  }, []);

  const handleEnd = useCallback(async () => {
    if (closedRef.current) return;
    const token = localStorage.getItem("session");
    playEnded();
    if (token && callIdRef.current) {
      try {
        await fetch(`https://auth.readtalk.workers.dev/call/${callIdRef.current}/end`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, "X-User-Id": getMyId(token) },
          body: JSON.stringify({}),
        });
      } catch {}
    }
    cleanup();
    clearCallSignal();
    onClose();
  }, [cleanup, clearCallSignal, onClose]);

  const setupPc = useCallback((pc: RTCPeerConnection, myId: string) => {
    pc.onicecandidate = (e) => {
      if (e.candidate && callIdRef.current) {
        // SAMAIN auth.ts: sendCallSignal di provider ubah jadi { type: "SIGNAL", signalType: "CALL_ICE" }
        sendCallSignal({ type: "CALL_ICE", callId: callIdRef.current, chatId, fromId: myId, candidate: e.candidate.toJSON() });
      }
    };
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      if (remoteStream) attachRemote(remoteStream);
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setIsRemoteConnected(true);
        setStatus("Connected");
        stopRingback();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, sendCallSignal]);

  // Start: incoming langsung, outgoing nunggu CALL_ACCEPTED
  useEffect(() => {
    if (!isOpen) return;
    if (mode === "outgoing" && !(callSignal?.type === "CALL_ACCEPTED" && callSignal.callId === callId)) {
      // outgoing tapi belum di-accept, jangan start PC dulu, cuma ringback
      startRingback();
      return;
    }
    if (didInitRef.current) return;
    didInitRef.current = true;

    closedRef.current = false;
    pendingCandidatesRef.current = [];
    setStatus(mode === "incoming" ? "Connecting..." : "Calling...");
    setIsMuted(false);
    setIsSpeaker(false);
    setIsCameraOff(false);
    setHasPermission(false);
    setIsRemoteConnected(false);
    callIdRef.current = callId || null;

    const startCall = async () => {
      const token = localStorage.getItem("session");
      if (!token) return;
      const myId = getMyId(token);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === "video" });
        streamRef.current = stream;
        setHasPermission(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          await localVideoRef.current.play().catch(() => {});
        }
        const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
        pcRef.current = pc;
        setupPc(pc, myId);
        stream.getTracks().forEach(t => pc.addTrack(t, stream));

        if (mode === "outgoing") {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          // SAMAIN auth.ts: CALL_OFFER via SIGNAL + signalType
          sendCallSignal({ type: "CALL_OFFER", callId: callIdRef.current, chatId, fromId: myId, sdp: pc.localDescription });
          setStatus("Ringing...");
        }
      } catch {
        setStatus("Permission denied");
      }
    };
    startCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, callSignal, callId]);

  // Terima SDP dari provider (auth.ts forward CALL_OFFER / CALL_ANSWER / CALL_ICE)
  useEffect(() => {
    if (!callSdpSignal || callSdpSignal.callId !== callIdRef.current) return;
    const pc = pcRef.current;
    if (!pc) return;
    const handle = async () => {
      const token = localStorage.getItem("session");
      const myId = token ? getMyId(token) : "";
      if (callSdpSignal.type === "CALL_OFFER" && mode === "incoming") {
        await pc.setRemoteDescription(new RTCSessionDescription(callSdpSignal.sdp));
        // Flush ICE yang dateng duluan
        for (const c of pendingCandidatesRef.current) {
          try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
        }
        pendingCandidatesRef.current = [];
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendCallSignal({ type: "CALL_ANSWER", callId: callIdRef.current, chatId, fromId: myId, sdp: pc.localDescription });
        setStatus("Connected");
      } else if (callSdpSignal.type === "CALL_ANSWER" && mode === "outgoing") {
        await pc.setRemoteDescription(new RTCSessionDescription(callSdpSignal.sdp));
        for (const c of pendingCandidatesRef.current) {
          try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
        }
        pendingCandidatesRef.current = [];
        setStatus("Connected");
      } else if (callSdpSignal.type === "CALL_ICE" && callSdpSignal.candidate) {
        if (pc.remoteDescription) {
          try { await pc.addIceCandidate(new RTCIceCandidate(callSdpSignal.candidate)); } catch {}
        } else {
          pendingCandidatesRef.current.push(callSdpSignal.candidate);
        }
      }
      clearCallSdpSignal();
    };
    handle();
  }, [callSdpSignal, mode, chatId, sendCallSignal, clearCallSdpSignal]);

  // Lawan End / Decline / Missed
  useEffect(() => {
    if (!callSignal || callSignal.callId !== callIdRef.current) return;
    if (callSignal.type === "CALL_ENDED" || callSignal.type === "CALL_DECLINED" || callSignal.type === "CALL_CANCELLED" || callSignal.type === "CALL_MISSED") {
      playEnded();
      cleanup();
      clearCallSignal();
      onClose();
    }
  }, [callSignal, cleanup, clearCallSignal, onClose]);

  useEffect(() => {
    if (!isOpen) {
      didInitRef.current = false;
      closedRef.current = false;
    }
    return () => { if (!isOpen) cleanup(); };
  }, [isOpen, cleanup]);

  if (!isOpen) return null;

  const toggleMute = () => {
    const t = streamRef.current?.getAudioTracks()[0];
    if (t) { t.enabled = !t.enabled; setIsMuted(!t.enabled); }
  };
  const toggleCam = () => {
    const t = streamRef.current?.getVideoTracks()[0];
    if (t) { t.enabled = !t.enabled; setIsCameraOff(!t.enabled); }
  };
  const toggleSpeaker = () => {
    const next = !isSpeaker;
    setIsSpeaker(next);
    applySpeaker(next);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 text-white flex flex-col items-center justify-center gap-6 px-6">
      <img src={avatar || "/default-avatar.png"} className="w-28 h-28 rounded-full object-cover bg-zinc-800" alt="" />
      <div className="text-center">
        <p className="text-xl font-bold">{name}</p>
        <p className="text-zinc-400 text-sm mt-1">{status}{hasPermission ? "" : " • Waiting permission..."}</p>
        <p className="text-zinc-400 text-sm mt-1">{isRemoteConnected ? "Connected" : type === "video" ? "Video call" : "Voice call"}</p>
      </div>

      {type === "video" && (
        <div className="relative w-full max-w-md aspect-video bg-zinc-900 rounded-2xl overflow-hidden">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <video ref={localVideoRef} autoPlay muted playsInline className="absolute bottom-2 right-2 w-24 h-32 object-cover rounded-xl border border-white/20" />
        </div>
      )}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <div className="flex items-center gap-4 mt-4">
        <button onClick={toggleMute} className={`w-14 h-14 rounded-full flex items-center justify-center ${isMuted ? "bg-white text-black" : "bg-white/20"}`}>
          <Microphone size={24} weight="fill" />
        </button>
        {type === "video" && (
          <button onClick={toggleCam} className={`w-14 h-14 rounded-full flex items-center justify-center ${isCameraOff ? "bg-white text-black" : "bg-white/20"}`}>
            <VideoCamera size={24} weight="fill" />
          </button>
        )}
        <button onClick={toggleSpeaker} className={`w-14 h-14 rounded-full flex items-center justify-center ${isSpeaker ? "bg-white text-black" : "bg-white/20"}`}>
          <SpeakerHigh size={24} weight="fill" />
        </button>
        <button onClick={handleEnd} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
          <Phone size={28} weight="fill" className="rotate-[135deg]" />
        </button>
      </div>
      <button onClick={onClose} className="flex items-center gap-1 text-zinc-400 text-sm">
        <CaretDown size={16} /> Close
      </button>
    </div>
  );
}
