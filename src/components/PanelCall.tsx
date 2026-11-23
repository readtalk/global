"use client";

import { useState } from "react";
import { ArrowLeft, Phone, VideoCamera, X } from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext";
import MirrorOverlay from "@/components/MirrorOverlay";

type MutualUser = {
  id: string;
  username: string;
  yourname: string;
  avatar: string | null;
};

type PanelCallProps = {
  isOpen: boolean;
  onClose: () => void;
  mutuals: MutualUser[];
  isLoading: boolean;
};

export default function PanelCall({ isOpen, onClose, mutuals, isLoading }: PanelCallProps) {
  const { t } = useLanguage();
  const [selectedUser, setSelectedUser] = useState<MutualUser | null>(null);
  const [callType, setCallType] = useState<"audio" | "video">("audio");
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const handleCall = (targetUser: MutualUser, type: "audio" | "video") => {
    setSelectedUser(targetUser);
    setCallType(type);
    setIsOverlayOpen(true);
  };

  const handleCloseOverlay = () => {
    setIsOverlayOpen(false);
    setSelectedUser(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity md:hidden" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full md:w-[60vw] bg-white dark:bg-zinc-950 z-50 transform transition-transform duration-300 ease-in-out flex flex-col transition-colors md:shadow-none shadow-2xl border-l border-gray-200 dark:border-zinc-800">
        <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-zinc-800 transition-colors">
          <button onClick={onClose} className="md:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
            <ArrowLeft size={20} weight="bold" className="text-gray-600 dark:text-zinc-400" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-50">{t("newCall")}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="text-center text-gray-500 dark:text-zinc-400 text-sm py-4">{t("loadingData")}</p>
          ) : mutuals.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-zinc-400 text-sm py-4">{t("noMutualsYet")}</p>
          ) : (
            mutuals.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-zinc-400 font-bold shrink-0 overflow-hidden transition-colors">
                  {m.avatar ? <img src={m.avatar} alt={m.username} className="w-full h-full object-cover" /> : m.username?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-zinc-100 font-semibold text-sm truncate">{m.yourname}</p>
                  <p className="text-gray-500 dark:text-zinc-400 text-xs truncate">@{m.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleCall(m, "audio")} className="p-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors" aria-label={t("audioCall")}>
                    <Phone size={20} weight="bold" />
                  </button>
                  <button onClick={() => handleCall(m, "video")} className="p-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors" aria-label={t("videoCall")}>
                    <VideoCamera size={20} weight="bold" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedUser && (
        <MirrorOverlay
          isOpen={isOverlayOpen}
          onClose={handleCloseOverlay}
          name={selectedUser.yourname}
          username={selectedUser.username}
          receiverId={selectedUser.id}
          avatar={selectedUser.avatar}
          type={callType}
        />
      )}
    </>
  );
}
