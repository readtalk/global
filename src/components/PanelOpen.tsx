"use client";

import { useEffect } from "react";
import { X } from "@phosphor-icons/react/dist/ssr";

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
				className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
				onClick={onClose}
			/>
			<div className="fixed top-0 right-0 h-full w-80 max-w-[80vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
				<div className="flex items-center justify-between p-4 border-b border-gray-200">
					<h2 className="text-lg font-bold text-gray-900">{title || "Menu"}</h2>
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-full transition"
					>
						<X size={20} weight="bold" className="text-gray-500" />
					</button>
				</div>
				<div className="flex-1 overflow-y-auto">
					{children}
				</div>
			</div>
		</>
	);
}
