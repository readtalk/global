"use client";

import { useEffect, useRef, createContext, useContext, useState, useCallback } from "react";

type Message = { id: string; chat_id: string; user_id: string; content: string; assets: string; created_at: number; };
type IncomingCallData = { callId: string; callerId: string; chatId: string; callType: "audio" | "video" };
type CallSignal = { callId: string; type: "CALL_ACCEPTED" | "CALL_ENDED" | "CALL_DECLINED" | "CALL_CANCELLED" | "CALL_MISSED"; at: number } | null;
type CallSdpSignal = { callId: string; fromId: string; type: "CALL_OFFER" | "CALL_ANSWER" | "CALL_ICE"; sdp?: any; candidate?: any; at: number } | null;

type WebSocketContextType = {
  onlineUsers: string[];
  isWsReady: boolean;
  lastMessage: { chatId: string; message: Message } | null;
  incomingCall: IncomingCallData | null;
  clearIncomingCall: () => void;
  callSignal: CallSignal;
  clearCallSignal: () => void;
  callSdpSignal: CallSdpSignal;
  clearCallSdpSignal: () => void;
  sendCallSignal: (data: any) => void;
  connectRoomWs: (callId: string) => void;
  disconnectRoomWs: () => void;
};

const WebSocketContext = createContext<WebSocketContextType>({
  onlineUsers: [], isWsReady: false, lastMessage: null, incomingCall: null,
  clearIncomingCall: () => {}, callSignal: null, clearCallSignal: () => {},
  callSdpSignal: null, clearCallSdpSignal: () => {}, sendCallSignal: () => {},
  connectRoomWs: () => {}, disconnectRoomWs: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

export default function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isWsReady, setIsWsReady] = useState(false);
  const [lastMessage, setLastMessage] = useState<{ chatId: string; message: Message } | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const [callSignal, setCallSignal] = useState<CallSignal>(null);
  const [callSdpSignal, setCallSdpSignal] = useState<CallSdpSignal>(null);

  const wsRef = useRef<WebSocket | null>(null); // DATA_DO
  const roomWsRef = useRef<WebSocket | null>(null); // ROOM_DO - biarin, gak dihapus
  const currentUserIdRef = useRef<string>("");
  const roomCallIdRef = useRef<string>("");
  const endedAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastEndedRef = useRef<string>("");

  const playEndedSound = useCallback((callId: string) => {
    if (lastEndedRef.current === callId) return;
    lastEndedRef.current = callId;
    setTimeout(() => { if (lastEndedRef.current === callId) lastEndedRef.current = ""; }, 2000);
    if (!endedAudioRef.current) {
      endedAudioRef.current = new Audio('/sound/incoming-missed-call-ended.mp3');
      endedAudioRef.current.preload = 'auto';
    }
    endedAudioRef.current.currentTime = 0;
    endedAudioRef.current.play().catch(() => {});
    if (navigator.vibrate) navigator.vibrate(200);
  }, []);

  const clearIncomingCall = useCallback(() => setIncomingCall(null), []);
  const clearCallSignal = useCallback(() => setCallSignal(null), []);
  const clearCallSdpSignal = useCallback(() => setCallSdpSignal(null), []);

  const disconnectRoomWs = useCallback(() => {
    if (roomWsRef.current) { try { roomWsRef.current.close(); } catch {} roomWsRef.current = null; }
    roomCallIdRef.current = "";
  }, []);

  // Ini yang hilang di file lama lu: roomWsRef ada tapi gak pernah di-connect
  // Dipanggil pas tombol Accept di IncomingCallOverlay / CallOverlay
  const connectRoomWs = useCallback((callId: string) => {
    const session = localStorage.getItem("session");
    if (!session || !callId) return;
    if (roomWsRef.current && roomWsRef.current.readyState === WebSocket.OPEN && roomCallIdRef.current === callId) return;
    disconnectRoomWs();
    roomCallIdRef.current = callId;
    const currentUserId = currentUserIdRef.current;
    const rws = new WebSocket(`wss://auth.readtalk.workers.dev/room?callId=${callId}&token=${session}`);
    roomWsRef.current = rws;

    rws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "CALL_OFFER" || data.type === "CALL_ANSWER" || data.type === "CALL_ICE") {
          if (data.fromId !== currentUserId) {
            setCallSdpSignal({ callId: data.callId || callId, fromId: data.fromId, type: data.type, sdp: data.sdp, candidate: data.candidate, at: Date.now() });
          }
        } else if (data.type === "SIGNAL") {
          const inner = data.signalType || data.signal || data.kind;
          const realType = typeof inner === "string" && inner.startsWith("CALL_") ? inner : "CALL_OFFER";
          if (data.fromId !== currentUserId) {
            setCallSdpSignal({ callId: data.callId || callId, fromId: data.fromId, type: realType, sdp: data.sdp, candidate: data.candidate, at: Date.now() });
          }
        }
      } catch {}
    };
    rws.onclose = () => { if (roomWsRef.current === rws) roomWsRef.current = null; };
  }, [disconnectRoomWs]);

  // Ini yang bikin call macet: dulu kirim ke roomWs yang null, sekarang auto-connect dulu
  const sendCallSignal = useCallback((data: any) => {
    if (roomWsRef.current && roomWsRef.current.readyState === WebSocket.OPEN) {
      roomWsRef.current.send(JSON.stringify(data));
      return;
    }
    if (data.callId) {
      connectRoomWs(data.callId);
      setTimeout(() => {
        if (roomWsRef.current && roomWsRef.current.readyState === WebSocket.OPEN) {
          roomWsRef.current.send(JSON.stringify(data));
        }
      }, 350);
    }
  }, [connectRoomWs]);

  useEffect(() => {
    let isMounted = true;
    const connect = () => {
      const session = localStorage.getItem("session");
      if (!session) return;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;
      let currentUserId = "";
      try {
        const payload = JSON.parse(atob(session.split(".")[1]));
        currentUserId = payload.properties?.id || payload.sub;
      } catch {}
      currentUserIdRef.current = currentUserId;
      setIsWsReady(false);

      const fetchOnlineUsers = async () => {
        try {
          const res = await fetch("https://auth.readtalk.workers.dev/users/online");
          const data = (await res.json()) as { success: boolean; onlineUsers: string[] };
          if (data.success && isMounted) {
            setOnlineUsers(prev => {
              const merged = new Set([...prev, ...data.onlineUsers, currentUserId]);
              return Array.from(merged).filter(Boolean);
            });
          }
        } catch {}
      };

      const ws = new WebSocket(`wss://auth.readtalk.workers.dev/ws?token=${session}`);
      wsRef.current = ws;

      ws.onopen = async () => {
        if (!isMounted) return;
        setOnlineUsers((prev) => prev.includes(currentUserId) ? prev : [...prev, currentUserId]);
        await fetchOnlineUsers();
        if (isMounted) setIsWsReady(true);
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === "USER_CONNECTED") {
            setOnlineUsers((prev) => prev.includes(data.userId) ? prev : [...prev, data.userId]);
          } else if (data.type === "USER_DISCONNECTED") {
            setOnlineUsers((prev) => prev.filter(id => id !== data.userId));
          } else if (data.type === "NEW_MESSAGE") {
            setLastMessage({ chatId: data.chatId, message: data.message });
            if (data.message.user_id !== currentUserId) {
              const audio = new Audio('/sound/incoming-chat-effect.mp3');
              audio.play().catch(() => {});
              if (navigator.vibrate) navigator.vibrate(200);
            }
          } else if (data.type === "CALL_INCOMING") {
            if (data.callerId !== currentUserId) {
              setIncomingCall({ callId: data.callId, callerId: data.callerId, chatId: data.chatId, callType: data.callType || "audio" });
            }
          } else if (data.type === "CALL_ACCEPTED") {
            setCallSignal({ callId: data.callId, type: "CALL_ACCEPTED", at: Date.now() });
            connectRoomWs(data.callId); // DATA_DO -> ROOM_DO, pas tombol Accept
          } else if (data.type === "CALL_ENDED" || data.type === "CALL_DECLINED" || data.type === "CALL_CANCELLED" || data.type === "CALL_MISSED") {
            if (data.callId) playEndedSound(data.callId);
            setCallSignal({ callId: data.callId, type: data.type, at: Date.now() });
            setIncomingCall(null);
            disconnectRoomWs();
          }
        } catch (err) { console.error("WS Error:", err); }
      };
    };

    connect();
    const handleSessionChanged = () => { connect(); };
    window.addEventListener("session-changed", handleSessionChanged);
    return () => {
      isMounted = false;
      window.removeEventListener("session-changed", handleSessionChanged);
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
      disconnectRoomWs();
    };
  }, [playEndedSound, connectRoomWs, disconnectRoomWs]);

  return (
    <WebSocketContext.Provider value={{ onlineUsers, isWsReady, lastMessage, incomingCall, clearIncomingCall, callSignal, clearCallSignal, callSdpSignal, clearCallSdpSignal, sendCallSignal, connectRoomWs, disconnectRoomWs }}>
      {children}
    </WebSocketContext.Provider>
  );
}
