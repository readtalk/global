"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { DotsThreeVertical, Gear, Phone, PhoneCall, PhoneIncoming, PhoneOutgoing, PhoneMissed, VideoCamera } from "@phosphor-icons/react/dist/ssr";
import IncomingCallOverlay from "@/components/IncomingCallOverlay";
import PanelCall from "@/components/PanelCall";
import { useLanguage } from "@/context/LanguageContext";
import { formatDuration, formatCallTime } from "@/lib/duration";

type MutualUser = {
  id: string;
  username: string;
  yourname: string;
  avatar: string | null;
};

type CallHistory = {
  id: string;
  caller_id: string;
  receiver_id: string;
  chat_id: string | null;
  type: "audio" | "video";
  status: string;
  duration: number;
  created_at: number;
  caller_username: string;
  caller_yourname: string;
  caller_avatar: string | null;
  receiver_username: string;
  receiver_yourname: string;
  receiver_avatar: string | null;
};

function CallContent() {
  const { t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [mutuals, setMutuals] = useState<MutualUser[]>([]);
  const [history, setHistory] = useState<CallHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) {
      try {
        const payload = JSON.parse(atob(session.split(".")[1]));
        setCurrentUserId(payload.properties?.id || payload.sub);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("session");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const [resMutuals, resHistory] = await Promise.all([
          fetch("/api/users/mutual", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/call/history", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const dataMutuals = (await resMutuals.json()) as { success: boolean; users: MutualUser[] };
        if (dataMutuals.success) setMutuals(dataMutuals.users);
        const dataHistory = (await resHistory.json()) as { success: boolean; history: CallHistory[] };
        if (dataHistory.success) setHistory(dataHistory.history);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-950 transition-colors">
      <div className="flex-none bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between transition-colors">
        <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-50 transition-colors">{t("navCall")}</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsPanelOpen(true)} className="hidden md:block bg-black dark:bg-white text-white dark:text-black p-1.5 rounded-md transition hover:bg-gray-800 dark:hover:bg-gray-200">
            <Phone size={20} weight="fill" />
          </button>
          <div className="relative">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 p-1 transition-colors">
              <DotsThreeVertical size={24} weight="bold" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-800 z-50 overflow-hidden flex flex-col py-1 transition-colors">
                <Link href="/settings" onClick={() => setIsDropdownOpen(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                  <Gear size={16} /> {t("settings")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pb-20 md:pb-0 bg-white dark:bg-zinc-950 transition-colors">
        <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-950 transition-colors">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 dark:text-zinc-400">{t("loadingData")}</div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-zinc-400 flex flex-col items-center gap-2">
              <PhoneCall size={48} className="text-gray-300 dark:text-zinc-700" />
              <p>{t("noCallsYet")}</p>
            </div>
          ) : (
            history.map((call) => {
              const isOutgoing = call.caller_id === currentUserId;
              const otherName = isOutgoing ? call.receiver_yourname : call.caller_yourname;
              const otherAvatar = isOutgoing ? call.receiver_avatar : call.caller_avatar;
              const isMissed = call.status === "missed" || call.status === "declined";
              const Icon = isMissed ? PhoneMissed : isOutgoing ? PhoneOutgoing : PhoneIncoming;
              return (
                <div key={call.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-zinc-400 font-bold shrink-0 overflow-hidden">
                    {otherAvatar ? <img src={otherAvatar} alt={otherName} className="w-full h-full object-cover" /> : otherName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${isMissed ? "text-red-500" : "text-gray-900 dark:text-zinc-100"}`}>{otherName}</p>
                    <p className={`text-sm truncate flex items-center gap-1 ${isMissed ? "text-red-500" : "text-gray-500 dark:text-zinc-400"}`}>
                      <Icon size={14} weight="bold" />
                      {isMissed ? (call.status === "declined" ? "Declined" : "Missed") : isOutgoing ? "Outgoing" : "Incoming"}
                      <span>• {call.type === "video" ? <VideoCamera size={14} className="inline" /> : <Phone size={14} className="inline" />}</span>
                      {!isMissed && <span>• {formatDuration(call.duration)}</span>}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-zinc-500 shrink-0">{formatCallTime(call.created_at)}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <button onClick={() => setIsPanelOpen(true)} aria-label={t("newCall")} className="md:hidden fixed bottom-24 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-black dark:bg-white text-white dark:text-black shadow-lg transition-all duration-150 active:scale-90 active:shadow-md active:translate-y-0.5">
        <Phone size={26} weight="fill" />
      </button>

      <PanelCall isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} mutuals={mutuals} isLoading={isLoading} />
      <IncomingCallOverlay />
    </div>
  );
}

export default function CallPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 transition-colors" />}>
      <CallContent />
    </Suspense>
  );
}
