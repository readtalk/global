"use client";
import { useEffect, useRef, useState } from "react";
import { X, PhoneDisconnect } from "@phosphor-icons/react/dist/ssr";

export default function MirrorOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [status, setStatus] = useState("connecting...");
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    let pc: RTCPeerConnection;
    let cancelled = false;

    async function callApi(body: any) {
      const res = await fetch("/api/mirror", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(`API ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
      if (data.errorCode) throw new Error(`Cloudflare: ${data.errorDescription}`);
      return data;
    }

    async function run() {
      try {
        pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }],
          bundlePolicy: "max-bundle",
        });
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) return;
        if (localRef.current) localRef.current.srcObject = localStream;

        const transceivers = localStream.getTracks().map((track) =>
          pc.addTransceiver(track, { direction: "sendonly" })
        );

        await pc.setLocalDescription(await pc.createOffer());
        const newSessionRes = (await callApi({ action: "newSession", sdp: pc.localDescription!.sdp })) as {
          sessionId: string;
          sessionDescription: RTCSessionDescriptionInit;
        };
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
        const newLocalRes = (await callApi({
          action: "newTracks",
          sessionId,
          tracks: trackObjects,
          sdp: pc.localDescription!.sdp,
        })) as { sessionDescription: RTCSessionDescriptionInit };
        await pc.setRemoteDescription(new RTCSessionDescription(newLocalRes.sessionDescription));

        const remoteTrackObjects = trackObjects.map((t) => ({
          location: "remote",
          sessionId,
          trackName: t.trackName,
        }));
        const remoteTracksPromise = new Promise<MediaStreamTrack[]>((resolve) => {
          const tracks: MediaStreamTrack[] = [];
          pc.ontrack = (e) => {
            tracks.push(e.track);
            if (tracks.length >= 2) resolve(tracks);
          };
        });
        const newRemoteRes = (await callApi({
          action: "newTracks",
          sessionId,
          tracks: remoteTrackObjects,
        })) as {
          requiresImmediateRenegotiation?: boolean;
          sessionDescription: RTCSessionDescriptionInit;
        };
        if (newRemoteRes.requiresImmediateRenegotiation) {
          if (newRemoteRes.sessionDescription.type === "offer") {
            await pc.setRemoteDescription(new RTCSessionDescription(newRemoteRes.sessionDescription));
            await pc.setLocalDescription(await pc.createAnswer());
            await callApi({ action: "renegotiate", sessionId, sdp: pc.localDescription!.sdp });
          }
        }

        const remoteTracks = await remoteTracksPromise;
        const remoteStream = new MediaStream();
        remoteStream.addTrack(remoteTracks[0]);
        remoteStream.addTrack(remoteTracks[1]);
        if (cancelled) return;
        if (remoteRef.current) {
          remoteRef.current.srcObject = remoteStream;
          remoteRef.current.play().catch(() => {});
        }
        setStatus("connected ✅");
      } catch (e: any) {
        if (!cancelled) setStatus(`failed: ${e?.message || e}`);
      }
    }

    run();
    return () => {
      cancelled = true;
      pc?.close();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 flex flex-col">
      {/* Header overlay */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <p className="font-bold text-gray-900 dark:text-zinc-50 leading-none">Mirror</p>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">{status}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900">
          <X size={20} />
        </button>
      </div>

      {/* ISI YANG LU PASTE TADI, CUMA UKURANNYA SQUARE */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-2xl mx-auto">
          {status.startsWith("failed") && (
            <p className="text-center text-red-500 text-xs py-3 px-4 break-words">{status}</p>
          )}

          <div>
            <h2 className="text-sm text-gray-900 dark:text-zinc-50 px-4 py-2">Local stream</h2>
            {/* SQUARE: aspect-square + object-cover, biar kotak 1:1 */}
            <div className="px-4">
              <video
                ref={localRef}
                autoPlay
                muted
                playsInline
                className="w-full aspect-square object-cover rounded-2xl bg-black"
              />
            </div>
          </div>

          <div>
            <h2 className="text-sm text-gray-900 dark:text-zinc-50 px-4 py-2">Remote echo stream</h2>
            {/* SQUARE: aspect-square + object-cover, video + audio dari sini */}
            <div className="px-4">
              <video
                ref={remoteRef}
                autoPlay
                playsInline
                className="w-full aspect-square object-cover rounded-2xl bg-black"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center py-5 bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800">
        <button
          onClick={onClose}
          className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center active:scale-95"
        >
          <PhoneDisconnect size={26} weight="fill" />
        </button>
      </div>
    </div>
  );
}
