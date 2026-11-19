"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, PaperPlaneRight, Check, DotsThreeVertical, GearSix, User, Bell } from "@phosphor-icons/react/dist/ssr";
import { useWebSocket } from "../../WebSocketProvider";
import { useLanguage } from "@/context/LanguageContext";
type Message = { id: string; chat_id: string; user_id: string; content: string; assets: string; created_at: number; status?: "delivered"; };
const isSameDay = (a: number, b: number) => { const da = new Date(a * 1000); const db = new Date(b * 1000); return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate(); };
const formatTime = (timestamp: number) => { return new Date(timestamp * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', }); };
function ChatRoomContent() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const id = params.id as string;
  const { lastMessage } = useWebSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  const formatDay = (timestamp: number) => {
    const d = new Date(timestamp * 1000);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return t("today");
    if (d.toDateString() === yesterday.toDateString()) return t("yesterday");
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) {
      try {
        const payload = JSON.parse(atob(session.split(".")[1]));
        const uid = payload.properties?.id || payload.sub;
        if (uid) setCurrentUserId(uid);
      } catch {}
    }
  }, []);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem("session");
      if (!token) return;
      try {
        const res = await fetch(`/api/chats/${id}/messages`, { headers: { "Authorization": `Bearer ${token}` }, });
        const data = (await res.json()) as { success: boolean; messages: Message[] };
        if (data.success) {
          const fetchedMessages = data.messages.reverse().map((m: Message) => ({ ...m, status: "delivered" as const }));
          setMessages(fetchedMessages);
          setTimeout(scrollToBottom, 100);
        }
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    fetchMessages();
  }, [id]);
  useEffect(() => {
    if (lastMessage && lastMessage.chatId === id) {
      const incomingMsg = lastMessage.message;
      setMessages((prev) => {
        if (prev.some(m => m.id === incomingMsg.id)) return prev;
        return [...prev, { ...incomingMsg, status: "delivered" }];
      });
      scrollToBottom();
    }
  }, [lastMessage, id]);
  const handleSend = async () => {
    if (!content.trim()) return;
    const token = localStorage.getItem("session");
    if (!token) return;
    const text = content;
    setContent("");
    setIsSending(true);
    const audio = new Audio('/sound/all-eyes-on-me.mp3');
    audio.play().catch(() => {});
    try {
      await fetch(`/api/chats/${id}/messages`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, }, body: JSON.stringify({ content: text, assets: [] }), });
    } catch (error) { console.error(error); setContent(text); } finally { setIsSending(false); }
  };
  return (
    <div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden bg-white dark:bg-zinc-950 transition-colors">
      <div className="flex-none bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/")} className="text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-50">{t("chatRoom")}</h1>
        </div>
        <div className="relative" ref={settingsRef}>
          <button onClick={() => setShowSettings(!showSettings)} className="text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 transition-colors p-1 flex items-center justify-center">
            <DotsThreeVertical size={24} weight="bold" />
          </button>
          {showSettings && (
            <div className="absolute right-0 top-10 w-52 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-lg p-2 z-20">
              <button onClick={() => { setShowSettings(false); router.push("/profile"); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-800 dark:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                <User size={18} /> {t("profile")}
              </button>
              <button onClick={() => { setShowSettings(false); router.push("/notifications"); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-800 dark:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                <Bell size={18} /> {t("notifications")}
              </button>
              <button onClick={() => { setShowSettings(false); router.push("/settings"); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-800 dark:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                <GearSix size={18} /> {t("settings")}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 dark:text-zinc-400">{t("loadingMessages")}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 dark:text-zinc-400 text-sm">{t("noMessages")}</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.user_id === currentUserId;
            const prev = messages[index - 1];
            const isNewDay = !prev || !isSameDay(prev.created_at, msg.created_at);
            return (
              <div key={msg.id}>
                {isNewDay && (
                  <div className="flex justify-center my-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 transition-colors">
                      {formatDay(msg.created_at)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-4 py-2 rounded-2xl flex flex-col gap-1 transition-colors ${isMe ? "bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-br-sm" : "bg-gray-100 dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 rounded-bl-sm"}`}>
                    <p className="text-[15px] whitespace-pre-wrap break-words">{msg.content}</p>
                    <div className={`flex items-center justify-end gap-1 ${isMe ? "text-gray-500 dark:text-zinc-400" : "text-gray-400 dark:text-zinc-500"}`}>
                      <span className="text-[10px]">{formatTime(msg.created_at)}</span>
                      {isMe && (
                        <span className="flex mb-0.5">
                          <Check size={12} weight="bold" className="-mr-1" />
                          <Check size={12} weight="bold" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {isSending && (
          <div className="flex justify-end">
            <span className="text-xs text-gray-400 dark:text-zinc-500 flex items-center gap-1 animate-pulse"> {t("sending")} </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex-none bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 p-3 flex gap-2 pb-safe pb-[max(12px,env(safe-area-inset-bottom))] transition-colors">
        <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder={t("typeMessage")} className="flex-1 bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 placeholder-gray-500 dark:placeholder-zinc-400 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-zinc-400 transition-colors" onKeyDown={(e) => e.key === "Enter" && handleSend()} />
        <button onClick={handleSend} disabled={isSending || !content.trim()} className="bg-black dark:bg-white text-white dark:text-black p-2.5 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center" >
          <PaperPlaneRight size={20} weight="fill" />
        </button>
      </div>
    </div>
  );
}
export default function ChatRoom() {
  const { t } = useLanguage();
  return <Suspense fallback={<div className="p-4 text-center">{t("loading")}</div>}><ChatRoomContent /></Suspense>;
}
