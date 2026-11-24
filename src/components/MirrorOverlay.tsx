"use client";

import { useEffect, useRef, useState } from "react";
import { X, PhoneDisconnect } from "@phosphor-icons/react/dist/ssr";

type MirrorOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  name?: string;
  username?: string;
  receiverId?: string;
  avatar?: string | null;
  type?: "audio" | "video";
  mutuals?: string[];
};

export default function MirrorOverlay({
  isOpen,
  onClose,
  name,
  username,
  receiverId,
  avatar,
  type = "video",
  mutuals = [],
}: MirrorOverlayProps) {
  const [status, setStatus] = useState("connecting...");
  const [elapsed, setElapsed] = useState(0);
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const isConnected = status.startsWith("connected");
  const isAudioOnly = type === "audio";

  // Format elapsed seconds to HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleClose = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (localRef.current) localRef.current.srcObject = null;
    if (remoteRef.current) remoteRef.current.srcObject = null;
    setStatus("connecting...");
    setElapsed(0);
    onClose();
  };

  // Run call timer only when connected
  useEffect(() => {
    if (!isConnected) return;
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isConnected]);

  useEffect(() => {
    if (!isOpen) return;
    let pc: RTCPeerConnection;
    let cancelled = false;

    async function callApi(path: string, body: any) {
      const session = localStorage.getItem("session");
      const res = await fetch(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session}`,
        },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(`API ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
      if (data.errorCode) throw new Error(`Cloudflare: ${data.errorDescription}`);
      const result = data.session || data.result || data;
      return {
        sessionId: data.sessionId || result.sessionId,
        sessionDescription: result.sessionDescription || data.sessionDescription,
        requiresImmediateRenegotiation: result.requiresImmediateRenegotiation,
      };
    }

    async function run() {
      try {
        pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }],
          bundlePolicy: "max-bundle",
        });

        const localStream = await navigator.mediaDevices.getUserMedia({
          video: type === "video",
          audio: true,
        });
        localStreamRef.current = localStream;
        if (cancelled) return;
        if (localRef.current) localRef.current.srcObject = localStream;

        const transceivers = localStream
          .getTracks()
          .map((track) => pc.addTransceiver(track, { direction: "sendonly" }));

        await pc.setLocalDescription(await pc.createOffer());
        const newSessionRes = (await callApi("/api/call/session", {
          sdp: pc.localDescription!.sdp,
        })) as any;
        const sessionId = newSessionRes.sessionId;
        await pc.setRemoteDescription(new RTCSessionDescription(newSessionRes.sessionDescription));

        await new Promise((resolve, reject) => {
          pc.addEventListener("iceconnectionstatechange", (ev: any) => {
            if (ev.target.iceConnectionState === "connected") resolve(true);
          });
          setTimeout(() => reject(new Error("connect timeout")), 5000);
        });

        const trackObjects = transceivers.map((t) => ({
          location: "local",
          mid: t.mid,
          trackName: t.sender.track!.id,
        }));

        await pc.setLocalDescription(await pc.createOffer());
        const newLocalRes = (await callApi("/api/call/tracks", {
          sessionId,
          tracks: trackObjects,
          sdp: pc.localDescription!.sdp,
        })) as any;
        await pc.setRemoteDescription(new RTCSessionDescription(newLocalRes.sessionDescription));

        const remoteTrackObjects = trackObjects.map((t) => ({
          location: "remote",
          sessionId,
          trackName: t.trackName,
        }));

        const expectedTracks = trackObjects.length;
        const remoteTracksPromise = new Promise<MediaStreamTrack[]>((resolve) => {
          const tracks: MediaStreamTrack[] = [];
          pc.ontrack = (e) => {
            tracks.push(e.track);
            if (tracks.length >= expectedTracks) resolve(tracks);
          };
        });

        const newRemoteRes = (await callApi("/api/call/tracks", {
          sessionId,
          tracks: remoteTrackObjects,
        })) as any;

        if (newRemoteRes.requiresImmediateRenegotiation) {
          if (newRemoteRes.sessionDescription?.type === "offer") {
            await pc.setRemoteDescription(new RTCSessionDescription(newRemoteRes.sessionDescription));
            await pc.setLocalDescription(await pc.createAnswer());
            await callApi("/api/call/renegotiate", {
              sessionId,
              sdp: pc.localDescription!.sdp,
            });
          }
        }

        const remoteTracks = await remoteTracksPromise;
        const remoteStream = new MediaStream();
        remoteTracks.forEach((t) => remoteStream.addTrack(t));
        if (cancelled) return;
        if (remoteRef.current) {
          remoteRef.current.srcObject = remoteStream;
          remoteRef.current.play().catch(() => {});
        }
        setStatus("connected");
      } catch (e: any) {
        if (!cancelled) setStatus(`failed: ${e?.message || e}`);
      }
    }

    run();

    return () => {
      cancelled = true;
      pc?.close();
    };
  }, [isOpen, type]);

  if (!isOpen) return null;

  return (
    <div className="fixed z-[9999] bg-black flex flex-col overflow-hidden inset-0 md:inset-auto md:bottom-4 md:right-4 md:w-[380px] md:h-[560px] md:rounded-2xl md:shadow-2xl md:border md:border-white/20">
      <div className="flex-1 relative min-h-0 bg-black overflow-hidden">
        {/* Remote echo video - hidden in audio mode but still plays audio */}
        <video
          ref={remoteRef}
          autoPlay
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isConnected && !isAudioOnly ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Local video - big when connecting, small PiP when connected */}
        <video
          ref={localRef}
          autoPlay
          muted
          playsInline
          className={`object-cover bg-zinc-900 transition-all duration-500 ease-in-out ${
            isAudioOnly
              ? "hidden"
              : isConnected
                ? "absolute bottom-24 right-4 w-28 md:w-20 md:bottom-20 aspect-[3/4] rounded-2xl border border-white/30 shadow-lg z-10"
                : "absolute inset-0 w-full h-full"
          }`}
        />

        {/* Audio mode - dark screen with avatar and mutuals in center */}
        {isAudioOnly && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-950 via-black to-zinc-950 px-6">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={name || "Avatar"}
                className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border border-white/20 shadow-2xl"
              />
            ) : (
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-zinc-800 flex items-center justify-center text-white text-4xl font-bold border border-white/20 shadow-2xl">
                {(name || "M")?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <p className="text-white font-bold text-xl mt-5 text-center leading-tight">
              {name || "Mirror"}
            </p>
            {username && <p className="text-white/60 text-sm mt-1">@{username}</p>}
            {mutuals.length > 0 && (
              <p className="text-white/50 text-xs mt-2 text-center">
                Mutual: {mutuals.slice(0, 2).join(", ")}
                {mutuals.length > 2 ? ` +${mutuals.length - 2} more` : ""}
              </p>
            )}
            <p className="text-white/70 text-xs mt-4 tracking-wide">
              {isConnected ? formatTime(elapsed) : status}
            </p>
            {!isConnected && !status.startsWith("failed") && (
              <p className="text-white/50 text-xs mt-1">
                {name ? `Calling ${name}...` : "Calling..."}
              </p>
            )}
          </div>
        )}

        {/* Video mode - connecting overlay */}
        {!isAudioOnly && !isConnected && !status.startsWith("failed") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 pointer-events-none">
            <p className="text-white font-bold text-lg">
              {name ? `Calling ${name}...` : "Calling..."}
            </p>
            {username && <p className="text-white/70 text-xs mt-1">@{username}</p>}
            <p className="text-white/70 text-xs mt-1">{status}</p>
          </div>
        )}

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent z-20">
          <div>
            <p className="font-bold text-white leading-none">{name || "Mirror"}</p>
            <p className="text-xs text-white/70 mt-1">
              {isConnected ? formatTime(elapsed) : status}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-black/40 text-white backdrop-blur"
          >
            <X size={20} />
          </button>
        </div>

        {status.startsWith("failed") && (
          <p className="absolute top-16 left-4 right-4 text-center text-red-400 text-xs bg-black/60 rounded-lg py-2 px-3 break-words z-20">
            {status}
          </p>
        )}

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center py-5 bg-gradient-to-t from-black/60 to-transparent z-20">
          <button
            onClick={handleClose}
            className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center active:scale-95 shadow-lg"
          >
            <PhoneDisconnect size={26} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  );
}
