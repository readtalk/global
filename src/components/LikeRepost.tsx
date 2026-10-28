"use client";

import { useState } from "react";

type Props = {
	id: string;
	like_count?: number;
	repost_count?: number;
	is_liked?: boolean;
	is_reposted?: boolean;
	onUpdate?: () => void;
};

export default function LikeRepost({ id, like_count = 0, repost_count = 0, is_liked = false, is_reposted = false, onUpdate }: Props) {
	const [loading, setLoading] = useState<string | null>(null);

	const handleAction = async (action: "like" | "repost") => {
		const token = localStorage.getItem("session");
		if (!token) return alert(`You must be logged in to ${action}.`);
		setLoading(`${action}-${id}`);
		try {
			await fetch(`/api/updates/${id}/${action}`, {
				method: "POST",
				headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
			});
			onUpdate?.();
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(null);
		}
	};

	return (
		<>
			<button onClick={() => handleAction("repost")} disabled={loading === `repost-${id}`} className={`flex items-center gap-1 hover:text-green-500 transition ${is_reposted ? "text-green-500" : ""}`}>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
				{repost_count || 0}
			</button>
			<button onClick={() => handleAction("like")} disabled={loading === `like-${id}`} className={`flex items-center gap-1 hover:text-red-500 transition ${is_liked ? "text-red-500" : ""}`}>
				<svg width="18" height="18" viewBox="0 0 24 24" fill={is_liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
				{like_count || 0}
			</button>
		</>
	);
}
