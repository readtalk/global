"use client";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext";

export default function PanelCall({ isOpen, onClose, children }: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity md:hidden" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full md:w-[60vw] bg-white dark:bg-zinc-950 z-50 flex flex-col border-l border-gray-200 dark:border-zinc-800">
        <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-zinc-800">
          <button onClick={onClose} className="md:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full">
            <ArrowLeft size={20} weight="bold" className="text-gray-600 dark:text-zinc-400" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-50">{t("newCall")}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
}
