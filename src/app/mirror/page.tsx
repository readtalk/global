"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { DotsThreeVertical, Gear, Phone, PhoneCall } from "@phosphor-icons/react/dist/ssr";
import MirrorOverlay from "@/components/MirrorOverlay";
import { useLanguage } from "@/context/LanguageContext";

function MirrorContent() {
  const { t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMirrorOpen, setIsMirrorOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-950 transition-colors">
      <div className="flex-none bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between transition-colors">
        <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-50 transition-colors">{t("navMirror") === "navMirror" ? "Mirror" : t("navMirror")}</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMirrorOpen(true)} className="hidden md:block bg-black dark:bg-white text-white dark:text-black p-1.5 rounded-md">
            <Phone size={20} weight="fill" />
          </button>
          <div className="relative">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-gray-600 dark:text-zinc-400 p-1"><DotsThreeVertical size={24} weight="bold" /></button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-800 z-50 py-1">
                <Link href="/settings" onClick={() => setIsDropdownOpen(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"><Gear size={16} /> {t("settings")}</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pb-20 md:pb-0 bg-white dark:bg-zinc-950 transition-colors">
        <div className="max-w-2xl mx-auto">
          <div className="p-8 text-center text-gray-500 dark:text-zinc-400 flex flex-col items-center gap-2">
            <PhoneCall size={48} className="text-gray-300 dark:text-zinc-700" />
            <p>Mirror test - video + audio</p>
            <button onClick={() => setIsMirrorOpen(true)} className="mt-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-medium">Open Mirror</button>
          </div>
        </div>
      </div>

      <button onClick={() => setIsMirrorOpen(true)} aria-label="Open Mirror" className="md:hidden fixed bottom-24 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-black dark:bg-white text-white dark:text-black shadow-lg active:scale-90">
        <Phone size={26} weight="fill" />
      </button>

      <MirrorOverlay isOpen={isMirrorOpen} onClose={() => setIsMirrorOpen(false)} />
    </div>
  );
}

export default function MirrorPage() {
  return <Suspense fallback={<div className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 transition-colors" />}><MirrorContent /></Suspense>;
}
