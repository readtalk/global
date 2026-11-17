"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Overlayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		if (pathname.startsWith("/chats/ai")) {
			setIsAnimating(true);
		} else {
			setIsAnimating(false);
		}
	}, [pathname]);

	if (!pathname.startsWith("/chats/ai")) {
		return null;
	}

	return (
		<div
			className={`fixed inset-0 z-40 bg-white dark:bg-zinc-950 transition-transform duration-300 ease-out md:relative md:inset-auto md:w-full md:h-full md:z-auto ${
				isAnimating ? "translate-x-0" : "translate-x-full"
			}`}
		>
			{children}
		</div>
	);
}
