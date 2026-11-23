"use client";

import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

type PanelCommunityProps = {
  isOpen: boolean;
  onClose: () => void;
  category?: "family" | "school" | "corporate" | null;
};

export default function PanelCommunity({ isOpen, onClose, category }: PanelCommunityProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity md:hidden" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full md:w-[60vw] bg-white dark:bg-zinc-950 z-50 transform transition-transform duration-300 ease-in-out flex flex-col transition-colors md:shadow-none shadow-2xl border-l border-gray-200 dark:border-zinc-800">
        <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-zinc-800 transition-colors">
          <button onClick={onClose} className="md:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
            <ArrowLeft size={20} weight="bold" className="text-gray-600 dark:text-zinc-400" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-50">New Community</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {category && <p className="text-xs text-gray-500 dark:text-zinc-400 px-4 py-3 uppercase tracking-wide">{category}</p>}
        </div>
      </div>
    </>
  );
}
