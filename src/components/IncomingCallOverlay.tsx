"use client";

import { useEffect, useRef, useState } from "react";
import { Phone, VideoCamera } from "@phosphor-icons/react/dist/ssr";
import CallOverlay from "@/components/CallOverlay";

type IncomingCall = {
  fromId: string;
  fromUsername: string;
  fromName: string;
  fromAvatar: string | null;
  type: "audio" | "video";
  callId: string;
};

export default function IncomingCallOverlay() {
  const [incoming, setIncoming] = useState<IncomingCall | null>(null);
  const [isAccepted, setIsAccepted] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("session");
    if (!token) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "incoming_call") {
          setIncoming({
            fromId: data.fromId || data.caller_id || data.fromUserId || data.fromUsername,
            fromUsername: data.fromUsername,
            fromName: data.fromName,
            fromAvatar: data.fromAvatar,
            type: data.callType || "audio",
            callId: data.callId,
          });
          setIsAccepted(false);
        }
        if (data.type === "call_ended" || data.type === "call_declined") {
          setIncoming(null);
          setIsAccepted(false);
        }
      } catch (error) {
        console.error(error);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleAccept = () => {
    setIsAccepted(true);
  };

  const handleDecline = () => {
    if (wsRef.current && incoming) {
      wsRef.current.send(JSON.stringify({
        type: "call_declined",
        callId: incoming.callId,
        toUsername: incoming.fromUsername,
      }));
    }
    setIncoming(null);
    setIsAccepted(false);
  };

  if (!incoming) return null;

  if (isAccepted) {
    return (
      <CallOverlay
        isOpen={true}
        onClose={() => {
          setIncoming(null);
          setIsAccepted(false);
        }}
        name={incoming.fromName}
        username={incoming.fromUsername}
        receiverId={incoming.fromId}
        avatar={incoming.fromAvatar}
        type={incoming.type}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[80] bg-zinc-950 text-white flex flex-col items-center justify-center gap-6 px-6">
      <img src={incoming.fromAvatar || "/default-avatar.png"} className="w-28 h-28 rounded-full object-cover bg-zinc-800" alt="" />
      <div className="text-center">
        <p className="text-xl font-bold">{incoming.fromName}</p>
        <p className="text-zinc-400 text-sm mt-1">@{incoming.fromUsername}</p>
        <p className="text-zinc-400 text-sm mt-3">{incoming.type === "audio" ? "Voice call" : "Video call"} • Incoming...</p>
      </div>
      <div className="flex items-center gap-10 mt-4">
        <button onClick={handleDecline} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
          <Phone size={28} weight="fill" className="rotate-[135deg]" />
        </button>
        <button onClick={handleAccept} className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
          {incoming.type === "audio" ? <Phone size={28} weight="fill" /> : <VideoCamera size={28} weight="fill" />}
        </button>
      </div>
    </div>
  );
}
