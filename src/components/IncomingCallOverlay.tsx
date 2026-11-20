"use client";

import { useState } from "react";
import { Phone, VideoCamera } from "@phosphor-icons/react/dist/ssr";
import CallOverlay from "@/components/CallOverlay";
import { useWebSocket } from "@/app/WebSocketProvider";
type MutualUser = { id: string; username: string; name: string; avatar: string | null };

export default function IncomingCallOverlay({ mutualUsers = [] }: { mutualUsers?: MutualUser[] }) {
  const { incomingCall, clearIncomingCall } = useWebSocket();
  const [isAccepted, setIsAccepted] = useState(false);
  if (!incomingCall) return null;
  const caller = mutualUsers.find(u => u.id === incomingCall.callerId);
  const fromName = caller?.name || incomingCall.callerId;
  const fromUsername = caller?.username || incomingCall.callerId;
  const fromAvatar = caller?.avatar || null;
  const fromId = incomingCall.callerId;
  const handleAccept = () => {
    setIsAccepted(true);
  };
  const handleDecline = () => {
    clearIncomingCall();
    setIsAccepted(false);
  };
  if (isAccepted) {
    return (
      <CallOverlay
        isOpen={true}
        onClose={() => { clearIncomingCall(); setIsAccepted(false); }}
        name={fromName}
        username={fromUsername}
        receiverId={fromId}
        avatar={fromAvatar}
        type={incomingCall.callType}
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
        <button onClick={handleDecline} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
          <Phone size={28} weight="fill" className="rotate-[135deg]" />
        </button>
        <button onClick={handleAccept} className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
          {incomingCall.callType === "audio" ? <Phone size={28} weight="fill" /> : <VideoCamera size={28} weight="fill" />}
        </button>
      </div>
    </div>
  );
}
