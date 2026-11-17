"use client";

import { usePathname } from "next/navigation";

export default function Overlayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isActive = pathname.startsWith("/chats/ai");

	if (!isActive) return null;

	return (
		<>
			<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" />
			<div className="fixed top-0 right-0 h-full w-full md:relative md:w-full md:h-full bg-white dark:bg-zinc-950 z-50 transform transition-transform duration-300 ease-in-out flex flex-col transition-colors md:shadow-none shadow-2xl border-l border-gray-200 dark:border-zinc-800">
				<div className="flex-1 overflow-y-auto min-h-0">
					{children}
				</div>
			</div>
		</>
	);
}
