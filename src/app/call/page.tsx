"use client";

import { useState, Suspense } from "react";
import { DotsThreeVertical, Gear, Phone } from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext";

function CallContent() {
  const { t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleFabCall = () => {
    window.dispatchEvent(new Event("open-call-dialer"));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-950 transition-colors relative">
      
      <div className="flex-none h-14 min-h-14 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 px-4 flex items-center justify-between transition-colors">
        <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-50 transition-colors">{t("navCall")}</h1>
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
          <div className="divide-y divide-gray-100 dark:divide-zinc-800 transition-colors">
            <p className="text-center text-gray-500 dark:text-zinc-400 text-sm py-10 transition-colors">
              {t("noCallsYet")}
            </p>
          </div>
        </div>
      </div>

      
      <button
        onClick={handleFabCall}
        aria-label={t("navCall")}
        className="md:hidden fixed bottom-20 right-4 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-blue-500 dark:bg-blue-600 text-white shadow-lg active:scale-95 transition"
      >
        <Phone size={26} weight="fill" />
      </button>
    </div>
  );
}

export default function CallPage() {
  return <Suspense fallback={<div className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 transition-colors" />}><CallContent /></Suspense>;
}
