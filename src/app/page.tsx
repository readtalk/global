"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChatCircleDots, Plus, UsersThree, DotsThreeVertical, Sun, Moon, Gear, Brain, Bell } from "@phosphor-icons/react/dist/ssr";
import PanelOpen from "@/components/PanelOpen";
import AIChatsOverlay from "@/components/AIChatOverlay";
import { useWebSocket } from "./WebSocketProvider";
import { useLanguage } from "@/context/LanguageContext";
type Chat = { id: string; name: string; description: string | null; is_private: number; created_at: number; member_count: number; member_ids: string[]; };
type MutualUser = { id: string; username: string; yourname: string; avatar: string | null; };
function ChatsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { onlineUsers } = useWebSocket();
  const { t } = useLanguage();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [mutuals, setMutuals] = useState<MutualUser[]>([]);
  const [isFetchingMutuals, setIsFetchingMutuals] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const handleOpenAi = () => setIsAiOpen(true);
    window.addEventListener("open-ai-chat", handleOpenAi);
    return () => window.removeEventListener("open-ai-chat", handleOpenAi);
  }, []);
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);
  const toggleTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    const meta = document.getElementById('theme-color-meta');
    if (meta) {
      meta.setAttribute('content', newTheme === 'dark' ? '#09090b' : '#ffffff');
    }
    setIsDropdownOpen(false);
  };
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("session", token);
      window.dispatchEvent(new Event("session-changed"));
      router.replace("/");
    }
  }, [searchParams, router]);
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
    const fetchChats = async () => {
      const token = localStorage.getItem("session");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const [resChats, resMutuals] = await Promise.all([
          fetch("/api/chats", { headers: { "Authorization": `Bearer ${token}` } }),
          fetch("/api/users/mutual", { headers: { "Authorization": `Bearer ${token}` } })
        ]);
        const dataChats = (await resChats.json()) as { success: boolean; chats: Chat[] };
        if (dataChats.success) {
          setChats(dataChats.chats);
        }
        const dataMutuals = (await resMutuals.json()) as { success: boolean; users: MutualUser[] };
        if (dataMutuals.success) {
          setMutuals(dataMutuals.users);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChats();
  }, [searchParams]);
  const handleStartChat = async (targetUser: MutualUser) => {
    const token = localStorage.getItem("session");
    if (!token) return alert(t("mustBeLoggedIn"));
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: targetUser.yourname,
          is_private: 1,
          member_ids: [targetUser.id],
        }),
      });
      const data = await res.json() as { success: boolean; chat_id?: string, error?: string };
      if (data.success && data.chat_id) {
        setIsPanelOpen(false);
        router.push(`/chats/${data.chat_id}`);
      } else {
        alert(data.error || t("failedToStartChat"));
      }
    } catch (error) {
      console.error(error);
      alert(t("errorStartingChat"));
    }
  };
  const getChatDisplay = (chat: Chat) => {
    if (chat.is_private && currentUserId) {
      const otherId = chat.member_ids.find(id => id !== currentUserId);
      const otherUser = mutuals.find(u => u.id === otherId);
      if (otherUser) {
        return { name: otherUser.yourname, initial: otherUser.yourname?.[0]?.toUpperCase() || "?", avatar: otherUser.avatar };
      }
    }
    return { name: chat.name, initial: chat.name.substring(0, 2).toUpperCase(), avatar: null };
  };
  const privateChats = chats.filter((c) => c.is_private);
  const groupChats = chats.filter((c) => !c.is_private);
  const isAnyoneOnline = onlineUsers.length > 0;
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-950 transition-colors">
      <div className="flex-none bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between transition-colors">
        <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-50">READTalk</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsPanelOpen(true)} className="hidden md:block bg-black dark:bg-white text-white dark:text-black p-1.5 rounded-md transition hover:bg-gray-800 dark:hover:bg-gray-200">
            <Plus size={20} weight="bold" />
          </button>
          <Link href="/notifications" className="md:hidden text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 p-1 transition-colors">
            <Bell size={24} weight="bold" />
          </Link>
          <div className="relative">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 p-1 transition-colors">
              <DotsThreeVertical size={24} weight="bold" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-800 z-50 overflow-hidden flex flex-col py-1 transition-colors">
                <Link href="/settings" onClick={() => setIsDropdownOpen(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                  <Gear size={16} /> {t("settings")}
                </Link>
                <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1 transition-colors" />
                <button onClick={() => toggleTheme("light")} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                  <Sun size={16} /> {t("light")}
                </button>
                <button onClick={() => toggleTheme("dark")} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                  <Moon size={16} /> {t("dark")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 pb-20 md:pb-0 bg-white dark:bg-zinc-950 transition-colors">
        <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-950 transition-colors">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 dark:text-zinc-400">{t("loadingChats")}</div>
          ) : chats.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-zinc-400 flex flex-col items-center gap-2">
              <ChatCircleDots size={48} className="text-gray-300 dark:text-zinc-700" />
              <p>{t("noChatsYet")}</p>
            </div>
          ) : (
            <>
              {privateChats.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-zinc-900 flex items-center gap-2 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${isAnyoneOnline ? "bg-green-500" : "bg-gray-400 dark:bg-zinc-600"}`} />
                    <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{onlineUsers.length} {t("online")}</span>
                  </div>
                  {privateChats.map((chat) => {
                    const display = getChatDisplay(chat);
                    return (
                      <Link key={chat.id} href={`/chats/${chat.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-zinc-400 font-bold shrink-0 overflow-hidden transition-colors">
                          {display.avatar ? <img src={display.avatar} alt={display.name} className="w-full h-full object-cover" /> : display.initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 dark:text-zinc-100 font-semibold truncate">{display.name}</p>
                          <p className="text-gray-500 dark:text-zinc-400 text-sm truncate">{chat.description || t("privateChat")}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
              {groupChats.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-zinc-900 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider transition-colors">
                    {t("groupsLabel")}
                  </div>
                  {groupChats.map((chat) => (
                    <Link key={chat.id} href={`/chats/${chat.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-zinc-400 font-bold shrink-0 overflow-hidden transition-colors">
                        {chat.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-zinc-100 font-semibold truncate">{chat.name}</p>
                        <p className="text-gray-500 dark:text-zinc-400 text-sm truncate">{chat.description || `${chat.member_count} ${t("members")}`}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <button onClick={() => setIsAiOpen(true)} className="md:hidden fixed bottom-42 right-7 z-40 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-150 bg-gradient-to-b from-blue-300 to-blue-500 dark:from-blue-500 dark:to-blue-700 text-white border border-blue-400/50 dark:border-blue-600/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_4px_6px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_4px_6px_rgba(0,0,0,0.6)] active:scale-90 active:shadow-inner active:translate-y-0.5 hover:brightness-110">
        <Brain size={20} weight="bold" />
      </button>
      <button onClick={() => setIsPanelOpen(true)} className="md:hidden fixed bottom-24 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-black dark:bg-white text-white dark:text-black shadow-lg transition-all duration-150 active:scale-90 active:shadow-md active:translate-y-0.5">
        <Plus size={26} weight="bold" />
      </button>
      <PanelOpen isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={t("newChat")}>
        <div className="p-4 space-y-2 border-b border-gray-100 dark:border-zinc-800 transition-colors">
          <button className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-700 dark:text-zinc-300 transition-colors">
              <UsersThree size={20} weight="bold" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-gray-900 dark:text-zinc-100 font-semibold">{t("newGroup")}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">{t("createNewGroupChat")}</p>
            </div>
          </button>
        </div>
        <div className="p-2">
          <div className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider transition-colors">
            {t("followbackOnReadtalk")}
          </div>
          {isFetchingMutuals ? (
            <p className="text-center text-gray-500 dark:text-zinc-400 text-sm py-4">{t("loadingData")}</p>
          ) : mutuals.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-zinc-400 text-sm py-4">{t("noMutualsYet")}</p>
          ) : (
            mutuals.map((m) => (
              <button key={m.id} onClick={() => handleStartChat(m)} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-lg cursor-pointer transition-colors text-left">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-zinc-400 font-bold shrink-0 overflow-hidden transition-colors">
                  {m.avatar ? <img src={m.avatar} alt={m.username} className="w-full h-full object-cover" /> : m.username?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-zinc-100 font-semibold text-sm truncate">{m.yourname}</p>
                  <p className="text-gray-500 dark:text-zinc-400 text-xs truncate">@{m.username}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </PanelOpen>
      <AIChatsOverlay isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
export default function ChatsPage() {
  return <Suspense fallback={<div className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 transition-colors" />}><ChatsContent /></Suspense>;
}
