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
};

const WebSocketContext = createContext<WebSocketContextType>({
  onlineUsers: [], isWsReady: false, lastMessage: null, incomingCall: null,
  clearIncomingCall: () => {}, callSignal: null, clearCallSignal: () => {},
  callSdpSignal: null, clearCallSdpSignal: () => {}, sendCallSignal: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

export default function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isWsReady, setIsWsReady] = useState(false);
  const [lastMessage, setLastMessage] = useState<{ chatId: string; message: Message } | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const [callSignal, setCallSignal] = useState<CallSignal>(null);
  const [callSdpSignal, setCallSdpSignal] = useState<CallSdpSignal>(null);

  const wsRef = useRef<WebSocket | null>(null);
  // BIARIN, GAK DIHAPUS, GAK DIPAKE. auth.ts gak punya /room, jadi roomWs emang gak dipake.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const roomWsRef = useRef<WebSocket | null>(null);

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

  // SAMAIN auth.ts: auth.ts terima SIGNAL + signalType, forward-nya CALL_OFFER/ANSWER/ICE
  // Kirim lewat wsRef (1 jalur kayak chat), bukan roomWs
  const sendCallSignal = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      if (data.type === "CALL_OFFER" || data.type === "CALL_ANSWER" || data.type === "CALL_ICE" || data.type === "CALL_READY") {
        wsRef.current.send(JSON.stringify({
          type: "SIGNAL",
          signalType: data.type, // auth.ts: const inner = data.signalType || data.signal || data.kind
          callId: data.callId,
          chatId: data.chatId,
          fromId: data.fromId,
          sdp: data.sdp ?? data.offer ?? data.answer ?? null, // auth.ts: data.sdp ?? data.offer ?? data.answer
          candidate: data.candidate ?? null,
        }));
      } else {
        wsRef.current.send(JSON.stringify(data));
      }
    }
  }, []);

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

      // SAMAIN auth.ts: fetch() di auth.ts nyari url.searchParams.get("userId"), bukan "token"
      // File awal lu: ?token= -> userId kosong -> server.close(1008)
      const wsUrl = `wss://auth.readtalk.workers.dev/ws?userId=${currentUserId}`;
      const ws = new WebSocket(wsUrl);
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
            // auth.ts: notify(chatId, { type: "CALL_INCOMING", callId, chatId, callerId, callType })
            if (data.callerId !== currentUserId) {
              setIncomingCall({ callId: data.callId, callerId: data.callerId, chatId: data.chatId, callType: data.callType || "audio" });
            }
          } else if (data.type === "CALL_ACCEPTED") {
            // auth.ts: POST /call/:id/accept -> notify { type: "CALL_ACCEPTED", callId, chatId }
            setCallSignal({ callId: data.callId, type: "CALL_ACCEPTED", at: Date.now() });
          } else if (data.type === "CALL_ENDED" || data.type === "CALL_DECLINED" || data.type === "CALL_CANCELLED" || data.type === "CALL_MISSED") {
            // auth.ts: POST /call/:id/decline|end|missed -> notify { type: "CALL_...", callId }
            if (data.callId) playEndedSound(data.callId);
            setCallSignal({ callId: data.callId, type: data.type, at: Date.now() });
            setIncomingCall(null);
          }
          // SAMAIN auth.ts: forwardCallSignal kirim balik { type: realType, callId, chatId, fromId, sdp, candidate }
          // realType = CALL_OFFER / CALL_ANSWER / CALL_ICE / CALL_READY, bukan SIGNAL
          else if (data.type === "CALL_OFFER" || data.type === "CALL_ANSWER" || data.type === "CALL_ICE" || data.type === "CALL_READY") {
            if (data.fromId !== currentUserId) {
              setCallSdpSignal({ callId: data.callId, fromId: data.fromId, type: data.type === "CALL_READY" ? "CALL_OFFER" : data.type, sdp: data.sdp, candidate: data.candidate, at: Date.now() });
            }
          }
          // Jaga-jaga kalo ada yang kirim SIGNAL mentah
          else if (data.type === "SIGNAL") {
            const inner = data.signalType || data.signal || data.kind || data.subtype || data.event;
            const realType = typeof inner === "string" && inner.startsWith("CALL_") ? inner : "CALL_OFFER";
            if (data.fromId !== currentUserId) {
              setCallSdpSignal({ callId: data.callId, fromId: data.fromId, type: realType as any, sdp: data.sdp, candidate: data.candidate, at: Date.now() });
            }
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
    };
  }, [playEndedSound]);

  return (
    <WebSocketContext.Provider value={{ onlineUsers, isWsReady, lastMessage, incomingCall, clearIncomingCall, callSignal, clearCallSignal, callSdpSignal, clearCallSdpSignal, sendCallSignal }}>
      {children}
    </WebSocketContext.Provider>
  );
}
