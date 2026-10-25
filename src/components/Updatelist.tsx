"use client";

import { useState } from "react";
import Link from "next/link";

export type UpdatelistItem = {
	id: string;
	user_id: string;
	content: string;
	image_url: string | null;
	created_at: number;
	like_count: number;
	comment_count: number;
	repost_count: number;
	is_liked: boolean;
	is_reposted: boolean;
	user?: { username: string; yourname: string; avatar?: string | null } | null;
};

export default function Updatelist({ data, limit = Infinity, onUpdate }: { data: UpdatelistItem[]; limit?: number; onUpdate: () => void }) {
	const [loading, setLoading] = useState<string | null>(null);

	const handleAction = async (id: string, action: "like" | "repost") => {
		const token = localStorage.getItem("session");
		if (!token) return alert(`You must be logged in to ${action}.`);

		setLoading(`${action}-${id}`);
		try {
			await fetch(`/api/updates/${id}/${action}`, {
				method: "POST",
				headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
			});
			onUpdate();
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(null);
		}
	};

	return (
		<>
			{data?.slice(0, limit)?.map((update) => (
				<article key={update.id} className="p-5 border-b border-gray-200 hover:bg-gray-50 transition">
					<div className="flex items-center gap-3">
						<Link href={`/profile/@${update.user?.username || update.user_id}`} className="shrink-0">
							<div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden">
								{update.user?.avatar ? (
									<img src={update.user.avatar} alt={update.user.username} className="w-full h-full object-cover" />
								) : (
									update.user?.username?.[0]?.toUpperCase() || "?"
								)}
							</div>
						</Link>
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<Link href={`/profile/@${update.user?.username || update.user_id}`} className="hover:underline">
									<p className="text-gray-900 font-semibold">{update.user?.yourname || "Unknown"}</p>
								</Link>
								<span className="text-gray-400 text-xs">·</span>
								<span className="text-gray-500 text-xs">
									{new Date(update.created_at * 1000).toLocaleDateString(undefined, { 
										day: 'numeric', 
										month: 'short' 
									})}
								</span>
							</div>
							<Link href={`/profile/@${update.user?.username || update.user_id}`} className="hover:underline">
								<p className="text-gray-500 text-xs">@{update.user?.username || update.user_id.substring(0, 8)}</p>
							</Link>
						</div>
					</div>

					<p className="mt-3 text-gray-800 whitespace-pre-wrap">{update.content}</p>

					<div className="mt-4 flex items-center gap-6 text-gray-500 text-sm">
						<Link href={`/update/${update.id}`} className="flex items-center gap-1 hover:text-blue-500 transition">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
							{update.comment_count || 0}
						</Link>
						<button 
							onClick={() => handleAction(update.id, "repost")}
							disabled={loading === `repost-${update.id}`}
							className={`flex items-center gap-1 hover:text-green-500 transition ${update.is_reposted ? 'text-green-500' : ''}`}
						>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
							{update.repost_count || 0}
						</button>
						<button 
							onClick={() => handleAction(update.id, "like")}
							disabled={loading === `like-${update.id}`}
							className={`flex items-center gap-1 hover:text-red-500 transition ${update.is_liked ? 'text-red-500' : ''}`}
						>
							<svg width="18" height="18" viewBox="0 0 24 24" fill={update.is_liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
							{update.like_count || 0}
						</button>
					</div>
				</article>
			))}
		</>
	);
}
