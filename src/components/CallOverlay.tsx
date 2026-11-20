"use client";

import { useEffect, useRef, useState } from "react";
import { Phone, Microphone, VideoCamera, SpeakerHigh, CaretDown } from "@phosphor-icons/react/dist/ssr";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  username: string;
  avatar: string | null;
  type: "audio" | "video";
};

export default function CallOverlay({ isOpen, onClose, name, username, avatar, type }: Props) {
  const [status, setStatus] = useState("Calling...");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setStatus("Calling...");
    setIsMuted(false);
    setIsSpeaker(false);
    setIsCameraOff(false);
    setHasPermission(false);

    const startCall = async () => {
      const token = localStorage.getItem("session");
      if (!token) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: type === "video",
        });

        streamRef.current = stream;
        setHasPermission(true);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          await localVideoRef.current.play().catch(() => {});
        }

        await fetch("/api/calls", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ targetUsername: username, type }),
        });

        await fetch("/api/call/credentials", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStatus("Ringing...");
      } catch (error) {
        console.error(error);
        setStatus("Permission denied");
      }
    };

    startCall();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    };
  }, [isOpen, username, type]);

  useEffect(() => {
    if (hasPermission && localVideoRef.current && streamRef.current) {
      localVideoRef.current.srcObject = streamRef.current;
      localVideoRef.current.play().catch(() => {});
    }
  }, [hasPermission, type]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !next;
    });
  };

  const toggleCamera = () => {
    const next = !isCameraOff;
    setIsCameraOff(next);
    streamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = !next;
    });
  };

  const toggleSpeaker = () => {
    setIsSpeaker(!isSpeaker);
  };

  const handleEnd = async () => {
    const token = localStorage.getItem("session");
    if (token) {
      try {
        await fetch("/api/call/log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ targetUsername: username, type, status: "ended" }),
        });
      } catch (error) {
        console.error(error);
      }
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
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-800">
            <CaretDown size={20} />
          </button>
        </div>
        <div className="relative flex-1 flex flex-col items-center justify-center gap-4">
          {type === "audio" ? (
            <>
              <img src={avatar || "/default-avatar.png"} className="w-32 h-32 rounded-full object-cover bg-zinc-800" alt="" />
              <p className="text-zinc-400 text-sm">{status}</p>
            </>
          ) : (
            <div className="w-full flex-1 mx-4 mb-2 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-500 text-sm overflow-hidden">
              {hasPermission ? (
                <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">Waiting for {name}...</div>
              ) : (
                "Video coming"
              )}
            </div>
          )}
          {type === "video" && (
            <div className="absolute bottom-28 right-4 w-24 h-32 bg-zinc-800 rounded-xl border border-zinc-700 flex items-center justify-center text-xs text-zinc-400 overflow-hidden">
              {hasPermission ? (
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
              ) : (
                "You"
              )}
            </div>
          )}
        </div>
        <div className="pb-8 pt-4 px-6 flex items-center justify-center gap-4">
          <button onClick={toggleMute} className={`w-12 h-12 rounded-full flex items-center justify-center ${isMuted ? "bg-white text-black" : "bg-zinc-800"}`}>
            <Microphone size={20} />
          </button>
          {type === "video" && (
            <button onClick={toggleCamera} className={`w-12 h-12 rounded-full flex items-center justify-center ${isCameraOff ? "bg-white text-black" : "bg-zinc-800"}`}>
              <VideoCamera size={20} />
            </button>
          )}
          <button onClick={toggleSpeaker} className={`w-12 h-12 rounded-full flex items-center justify-center ${isSpeaker ? "bg-white text-black" : "bg-zinc-800"}`}>
            <SpeakerHigh size={20} />
          </button>
          <button onClick={handleEnd} className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center">
            <Phone size={24} weight="fill" className="rotate-[135deg]" />
          </button>
        </div>
      </div>
    </>
  );
}
