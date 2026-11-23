"use client";

import { useState, Suspense } from "react";
import { DotsThreeVertical, Gear } from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext";
import PanelCommunity from "@/components/PanelCommunity";

function CommunitiesContent() {
  const { t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-950 transition-colors">
      <div className="flex-none bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between transition-colors">
        <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-50 transition-colors">{t("navCommunity")}</h1>
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
          <div className="flex flex-col items-center justify-center gap-4 py-20 px-4">
            <p className="text-center text-gray-500 dark:text-zinc-400 text-sm">{t("noCommunitiesYet")}</p>
            <button onClick={() => setIsPanelOpen(true)} className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-semibold active:scale-95 transition">
              Start Communities
            </button>
          </div>
        </div>
      </div>
      <PanelCommunity isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
    </div>
  );
}

export default function CommunitiesPage() {
  return <Suspense fallback={<div className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 transition-colors" />}><CommunitiesContent /></Suspense>;
}
