"use client";

import { useEffect } from "react";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

type PanelOpenProps = {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	title?: string;
};

export default function PanelOpen({ isOpen, onClose, children, title }: PanelOpenProps) {
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<>
			<div
				className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity md:hidden"
				onClick={onClose}
			/>
			<div className="fixed top-0 right-0 h-full w-full md:w-80 md:max-w-[80vw] bg-white dark:bg-zinc-950 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col transition-colors">
				<div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-zinc-800 transition-colors">
					<button
						onClick={onClose}
						className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
					>
						<ArrowLeft size={20} weight="bold" className="text-gray-600 dark:text-zinc-400" />
					</button>
					<h2 className="text-lg font-bold text-gray-900 dark:text-zinc-50">{title || "Menu"}</h2>
				</div>
				<div className="flex-1 overflow-y-auto">
					{children}
				</div>
			</div>
		</>
	);
}
