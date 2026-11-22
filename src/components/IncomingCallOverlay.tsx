"use client";

import { useEffect, useRef, useState } from "react";
import { Phone, VideoCamera } from "@phosphor-icons/react/dist/ssr";
import CallOverlay from "@/components/CallOverlay";
import { useWebSocket } from "@/app/WebSocketProvider";

type MutualUser = { id: string; username: string; yourname: string; avatar: string | null };

export default function IncomingCallOverlay({ mutualUsers = [] }: { mutualUsers?: MutualUser[] }) {
  const { incomingCall, clearIncomingCall } = useWebSocket();
  const [isAccepted, setIsAccepted] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const ringingRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!incomingCall) {
      setIsAccepted(false);
      setIsBusy(false);
      return;
    }
    setIsBusy(false);
  }, [incomingCall]);

  useEffect(() => {
    if (!incomingCall || isAccepted) {
      if (ringingRef.current) {
        ringingRef.current.pause();
        ringingRef.current.currentTime = 0;
      }
      return;
    }
    if (!ringingRef.current) {
      ringingRef.current = new Audio("/sound/incoming-call-ringing.mp3");
      ringingRef.current.loop = true;
      ringingRef.current.preload = "auto";
    }
    ringingRef.current.currentTime = 0;
    ringingRef.current.play().catch(() => {});
    return () => {
      if (ringingRef.current) {
        ringingRef.current.pause();
        ringingRef.current.currentTime = 0;
      }
    };
  }, [incomingCall, isAccepted]);

  useEffect(() => {
    return () => {
      if (ringingRef.current) {
        ringingRef.current.pause();
        ringingRef.current.currentTime = 0;
      }
    };
  }, []);

  if (!incomingCall) return null;

  const caller = mutualUsers.find(u => u.id === incomingCall.callerId);
  const fromName = caller?.yourname || incomingCall.callerId;
  const fromUsername = caller?.username || incomingCall.callerId;
  const fromAvatar = caller?.avatar || null;
  const fromId = incomingCall.callerId;

  const getMyId = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.properties?.id || payload.sub || "";
    } catch {
      return "";
    }
  };

  const handleAccept = async () => {
    if (isBusy) return;
    setIsBusy(true);
    const token = localStorage.getItem("session");
    if (ringingRef.current) {
      ringingRef.current.pause();
      ringingRef.current.currentTime = 0;
    }
    if (token && incomingCall.callId) {
      try {
        await fetch(`https://auth.readtalk.workers.dev/call/${incomingCall.callId}/accept`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "X-User-Id": getMyId(token) },
          body: JSON.stringify({}),
        });
      } catch {}
    }
    setIsAccepted(true);
    setIsBusy(false);
  };

  const handleDecline = async () => {
    if (isBusy) return;
    setIsBusy(true);
    const token = localStorage.getItem("session");
    if (ringingRef.current) {
      ringingRef.current.pause();
      ringingRef.current.currentTime = 0;
    }
    const ended = new Audio("/sound/incoming-missed-call-ended.mp3");
    ended.play().catch(() => {});
    clearIncomingCall();
    setIsAccepted(false);
    if (token && incomingCall.callId) {
      try {
        await fetch(`https://auth.readtalk.workers.dev/call/${incomingCall.callId}/decline`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "X-User-Id": getMyId(token) },
          body: JSON.stringify({}),
        });
      } catch {}
    }
    setIsBusy(false);
  };

  if (isAccepted) {
    return (
      <CallOverlay
        isOpen={true}
        onClose={() => {
          clearIncomingCall();
          setIsAccepted(false);
        }}
        name={fromName}
        username={fromUsername}
        receiverId={fromId}
        avatar={fromAvatar}
        type={incomingCall.callType}
        callId={incomingCall.callId}
        mode="incoming"
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[80] bg-zinc-950 text-white flex flex-col items-center justify-center gap-6 px-6">
      <img src={fromAvatar || "/default-avatar.png"} className="w-28 h-28 rounded-full object-cover bg-zinc-800" alt="" />
      <div className="text-center">
        <p className="text-xl font-bold">{fromName}</p>
        <p className="text-zinc-400 text-sm mt-1">@{fromUsername}</p>
        <p className="text-zinc-400 text-sm mt-3">{incomingCall.callType === "audio" ? "Voice call" : "Video call"} • Incoming...</p>
      </div>
      <div className="flex items-center gap-10 mt-4">
        <button onClick={handleDecline} disabled={isBusy} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center disabled:opacity-50">
          <Phone size={28} weight="fill" className="rotate-[135deg]" />
        </button>
        <button onClick={handleAccept} disabled={isBusy} className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center disabled:opacity-50">
          {incomingCall.callType === "audio" ? <Phone size={28} weight="fill" /> : <VideoCamera size={28} weight="fill" />}
        </button>
      </div>
    </div>
  );
}
