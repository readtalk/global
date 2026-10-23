//
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PwaPopup() {
	const pathname = usePathname();
	const [isStandalone, setIsStandalone] = useState<boolean | null>(null);
	const [isVisible, setIsVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

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

	const handleLogin = async () => {
		setIsLoading(true);
		try {
			const array = new Uint32Array(56);
			window.crypto.getRandomValues(array);
			const verifier = Array.from(array, (dec) => ("0" + dec.toString(16)).substr(-2)).join("");

			const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			const challenge = btoa(String.fromCharCode.apply(null, hashArray))
				.replace(/\+/g, "-")
				.replace(/\//g, "_")
				.replace(/=+$/, "");

			localStorage.setItem("code_verifier", verifier);

			window.location.href = `https://auth.readtalk.workers.dev/authorize?response_type=code&client_id=your-client-id&redirect_uri=https://global.readtalk.workers.dev/callback&code_challenge=${challenge}&code_challenge_method=S256`;
		} catch (error) {
			console.error(error);
			setIsLoading(false);
		}
	};

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
					onClick={handleLogin}
					disabled={isLoading}
					className="mt-6 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
				>
					{isLoading ? "Redirecting..." : "Login OpenAuth"}
				</button>
			</div>
		</div>
	);
}
