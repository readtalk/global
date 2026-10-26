"use client";

import { useState } from "react";

export default function ShareButton({ username }: { username: string }) {
	const [copied, setCopied] = useState(false);
	const url = typeof window !== "undefined" ? `${window.location.origin}/@${username}` : "";

	const handleShare = async () => {
		if (typeof navigator !== "undefined" && navigator.share) {
			try {
				await navigator.share({
					title: `@${username} di READTalk`,
					text: `Cek profil @${username} di READTalk`,
					url: url,
				});
			} catch (error) {
				console.log("Share cancelled", error);
			}
		} else {
			try {
				await navigator.clipboard.writeText(url);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch (error) {
				console.error("Failed to copy", error);
			}
		}
	};

	return (
		<button
			onClick={handleShare}
			className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold transition"
		>
			{copied ? "Copied!" : "Share"}
		</button>
	);
}
