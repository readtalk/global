"use client";

import { useEffect, useRef } from "react";

export default function MirrorPage() {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let pc: RTCPeerConnection;

    async function run() {
      // 1. PC sama kayak file lu
      pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }],
        bundlePolicy: "max-bundle",
      });

      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localRef.current) localRef.current.srcObject = localStream;

      const transceivers = localStream.getTracks().map((track) =>
        pc.addTransceiver(track, { direction: "sendonly" })
      );

      // 2. newSession, tapi manggil route.ts, BUKAN langsung ke Cloudflare
      await pc.setLocalDescription(await pc.createOffer());
      const newSessionRes = await fetch("/api/mirror", {
        method: "POST",
        body: JSON.stringify({ action: "newSession", sdp: pc.localDescription!.sdp }),
      }).then((r) => r.json());
      const sessionId = newSessionRes.sessionId;
      await pc.setRemoteDescription(new RTCSessionDescription(newSessionRes.sessionDescription));

      await new Promise((resolve, reject) => {
        pc.addEventListener("iceconnectionstatechange", (ev: any) => {
          if (ev.target.iceConnectionState === "connected") resolve(true);
        });
        setTimeout(() => reject("connect timeout"), 5000);
      });

      // 3. newTracks local
      const trackObjects = transceivers.map((t) => ({
        location: "local",
        mid: t.mid,
        trackName: t.sender.track!.id,
      }));
      await pc.setLocalDescription(await pc.createOffer());
      const newLocalRes = await fetch("/api/mirror", {
        method: "POST",
        body: JSON.stringify({ action: "newTracks", sessionId, tracks: trackObjects, sdp: pc.localDescription!.sdp }),
      }).then((r) => r.json());
      await pc.setRemoteDescription(new RTCSessionDescription(newLocalRes.sessionDescription));

      // 4. pull balik jadi remote echo, sama kayak file lu
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

      const newRemoteRes = await fetch("/api/mirror", {
        method: "POST",
        body: JSON.stringify({ action: "newTracks", sessionId, tracks: remoteTrackObjects }),
      }).then((r) => r.json());

      if (newRemoteRes.requiresImmediateRenegotiation) {
        await pc.setRemoteDescription(new RTCSessionDescription(newRemoteRes.sessionDescription));
        await pc.setLocalDescription(await pc.createAnswer());
        await fetch("/api/mirror", {
          method: "POST",
          body: JSON.stringify({ action: "renegotiate", sessionId, sdp: pc.localDescription!.sdp }),
        });
      }

      const remoteTracks = await remoteTracksPromise;
      const remoteStream = new MediaStream();
      remoteStream.addTrack(remoteTracks[0]);
      remoteStream.addTrack(remoteTracks[1]);
      if (remoteRef.current) remoteRef.current.srcObject = remoteStream;
    }

    run();
    return () => pc?.close();
  }, []);

  return (
    <div className="grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
      <h1 style={{ gridColumn: "1 / -1" }}>Realtime Echo Demo</h1>
      <div>
        <h2>Local stream</h2>
        <video ref={localRef} autoPlay muted playsInline style={{ width: "100%" }} />
      </div>
      <div>
        <h2>Remote echo stream</h2>
        <video ref={remoteRef} autoPlay playsInline style={{ width: "100%" }} />
      </div>
    </div>
  );
}
