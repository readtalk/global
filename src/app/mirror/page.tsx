"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import { DotsThreeVertical, Gear } from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext";

function MirrorContent() {
  const { t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [status, setStatus] = useState("connecting...");

  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let pc: RTCPeerConnection;

    async function callApi(body: any) {
      const res = await fetch("/api/mirror", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as any;
      // INI KUNCINYA: kalo Cloudflare / route nolak, tampilkan alasannya
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
        if (localRef.current) localRef.current.srcObject = localStream;

        const transceivers = localStream.getTracks().map((track) =>
          pc.addTransceiver(track, { direction: "sendonly" })
        );

        setStatus("1/4 newSession...");
        await pc.setLocalDescription(await pc.createOffer());
        const newSessionRes = (await callApi({ action: "newSession", sdp: pc.localDescription!.sdp })) as {
          sessionId: string;
          sessionDescription: RTCSessionDescriptionInit;
        };
        const sessionId = newSessionRes.sessionId;
        await pc.setRemoteDescription(new RTCSessionDescription(newSessionRes.sessionDescription));

        setStatus("2/4 waiting ICE...");
        await new Promise((resolve, reject) => {
          pc.addEventListener("iceconnectionstatechange", (ev: any) => {
            if (ev.target.iceConnectionState === "connected") resolve(true);
            if (ev.target.iceConnectionState === "failed") reject(new Error("ICE failed"));
          });
          setTimeout(() => reject(new Error("connect timeout 5s")), 8000);
        });

        setStatus("3/4 newTracks local...");
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

        setStatus("4/4 newTracks remote...");
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
          await pc.setRemoteDescription(new RTCSessionDescription(newRemoteRes.sessionDescription));
          await pc.setLocalDescription(await pc.createAnswer());
          await callApi({ action: "renegotiate", sessionId, sdp: pc.localDescription!.sdp });
        }

        const remoteTracks = await remoteTracksPromise;
        const remoteStream = new MediaStream();
        remoteStream.addTrack(remoteTracks[0]);
        remoteStream.addTrack(remoteTracks[1]);
        if (remoteRef.current) remoteRef.current.srcObject = remoteStream;
        setStatus("connected ✅");
      } catch (e: any) {
        // Tampilkan error aslinya, jangan cuma "failed"
        setStatus(`failed: ${e?.message || e}`);
        console.error(e);
      }
    }

    run();
    return () => pc?.close();
  }, []);

  // Fallback kalo key navMirror belum ada di LanguageContext
  const title = t("navMirror") === "navMirror" ? "Mirror" : t("navMirror");

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-950 transition-colors">
      <div className="flex-none bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between transition-colors">
        <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-50 transition-colors">{title}</h1>
        <div className="relative">
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 p-1 transition-colors">
            <DotsThreeVertical size={24} weight="bold" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-800 z-50 overflow-hidden flex flex-col py-1 transition-colors">
              <a href="/settings" onClick={() => setIsDropdownOpen(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <Gear size={16} /> {t("settings")}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pb-20 md:pb-0 bg-white dark:bg-zinc-950 transition-colors">
        <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-950 transition-colors">
          <p className="text-center text-red-500 text-xs py-3 px-4 break-words">{status}</p>
          <div>
            <h2 className="text-sm text-gray-900 dark:text-zinc-50 px-4 py-2">Local stream</h2>
            <video ref={localRef} autoPlay muted playsInline className="w-full" />
          </div>
          <div>
            <h2 className="text-sm text-gray-900 dark:text-zinc-50 px-4 py-2">Remote echo stream</h2>
            <video ref={remoteRef} autoPlay playsInline className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MirrorPage() {
  return <Suspense fallback={<div className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 transition-colors" />}><MirrorContent /></Suspense>;
}
