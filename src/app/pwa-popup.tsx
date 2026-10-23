"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PwaPopup() {
	const pathname = usePathname();
	const [isStandalone, setIsStandalone] = useState<boolean | null>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (pathname.startsWith("/@") || pathname.startsWith("/u/")) {
			setIsVisible(false);
			return;
		}

		const checkStandalone =
			window.matchMedia("(display-mode: standalone)").matches ||
			(window.navigator as unknown as { standalone?: boolean }).standalone === true;

		setIsStandalone(checkStandalone);
		setIsVisible(true);
	}, [pathname]);

	if (!isVisible || isStandalone === null) return null;

	if (!isStandalone) {
		return (
			<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
				<div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-lg dark:bg-zinc-900 dark:text-white">
					<h2 className="text-xl font-bold">Install App</h2>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
						Please install the app first to continue.
					</p>
					<div className="mt-4 rounded-lg bg-gray-100 p-3 text-left text-xs dark:bg-zinc-800">
						<p className="font-semibold mb-1">Android:</p>
						<p>Browser menu &rarr; &quot;Install app&quot; / &quot;Add to Home screen&quot;</p>
						<p className="font-semibold mt-2 mb-1">iOS:</p>
						<p>Share button &rarr; &quot;Add to Home Screen&quot;</p>
					</div>
					<button
						onClick={() => setIsVisible(false)}
						className="mt-6 w-full rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black"
					>
						Close
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
			<div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-lg dark:bg-zinc-900 dark:text-white">
				<h2 className="text-xl font-bold">Continue to Login</h2>
				<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
					App is already installed. Please log in via OpenAuth.
				</p>
				<button
					onClick={() => {
						window.location.href = "https://auth.readtalk.workers.dev";
					}}
					className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
				>
					Login OpenAuth
				</button>
				<button
					onClick={() => setIsVisible(false)}
					className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-zinc-700 dark:text-gray-300"
				>
					Later
				</button>
			</div>
		</div>
	);
}
