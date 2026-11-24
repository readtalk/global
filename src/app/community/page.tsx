"use client";

import { useState, Suspense } from "react";
import { DotsThreeVertical, Gear, House, GraduationCap, BuildingOffice } from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext";
import PanelCommunity from "@/components/PanelCommunity";

type Category = "neighbors" | "schools" | "corporate";

const categories = [
  { id: "neighbors" as Category, label: "Neighbors", Icon: House },
  { id: "schools" as Category, label: "Schools", Icon: GraduationCap },
  { id: "corporate" as Category, label: "Corporate", Icon: BuildingOffice },
];

type Community = {
  id: string;
  name: string;
  category: Category;
};

function CommunitiesContent() {
  const { t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [communities] = useState<Community[]>([]);

  const openPanel = (category: Category | null) => {
    setSelectedCategory(category);
    setIsPanelOpen(true);
  };

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
          {communities.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 py-16 px-4">
              <div className="flex items-start justify-center gap-6 sm:gap-10">
                {categories.map(({ id, label, Icon }) => (
                  <button key={id} onClick={() => openPanel(id)} className="flex flex-col items-center gap-2 active:scale-95 transition">
                    <span className="w-14 h-14 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-700 dark:text-zinc-200">
                      <Icon size={26} weight="bold" />
                    </span>
                    <span className="text-xs font-medium text-gray-600 dark:text-zinc-400 text-center leading-tight max-w-[80px]">{label}</span>
                  </button>
                ))}
              </div>
              <p className="text-center text-gray-500 dark:text-zinc-400 text-sm">{t("noCommunitiesYet")}</p>
              <button onClick={() => openPanel(null)} className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-semibold active:scale-95 transition">
                Start Communities
              </button>
            </div>
          ) : (
            <div className="flex flex-col py-4">
              {categories.map(({ id, label, Icon }) => {
                const items = communities.filter((c) => c.category === id);
                if (items.length === 0) return null;
                return (
                  <div key={id} className="flex flex-col">
                    <div className="flex items-center gap-2 px-4 py-3">
                      <Icon size={16} weight="bold" className="text-gray-500 dark:text-zinc-400" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-400">{label}</span>
                      <span className="flex-1 h-px bg-gray-100 dark:bg-zinc-800" />
                    </div>
                    {items.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                        <span className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-gray-600 dark:text-zinc-300">{c.name[0]?.toUpperCase()}</span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100 truncate">{c.name}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <PanelCommunity isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} category={selectedCategory} />
    </div>
  );
}

export default function CommunitiesPage() {
  return <Suspense fallback={<div className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 transition-colors" />}><CommunitiesContent /></Suspense>;
}
