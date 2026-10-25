"use client";

import { useState, useEffect } from "react";
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
	user?: { username: string; yourname: string } | null;
};

export default function Updatelist({ data, limit = Infinity, onUpdate }: { data: UpdatelistItem[]; limit?: number; onUpdate: () => void }) {
	const [loading, setLoading] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editContent, setEditContent] = useState("");
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);

	useEffect(() => {
		fetch("/api/auth/me")
			.then(res => res.json() as Promise<{ success: boolean; user?: { id: string } }>)
			.then((data) => {
				if (data.success && data.user) {
					setCurrentUserId(data.user.id);
				}
			})
			.catch(() => {});
	}, []);

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

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this post?")) return;
		const token = localStorage.getItem("session");
		if (!token) return;

		try {
			await fetch(`/api/updates/${id}`, {
				method: "DELETE",
				headers: { "Authorization": `Bearer ${token}` },
			});
			onUpdate();
		} catch (error) {
			console.error(error);
		}
	};

	const handleEditSave = async (id: string) => {
		const token = localStorage.getItem("session");
		if (!token) return;

		try {
			await fetch(`/api/updates/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
				body: JSON.stringify({ content: editContent }),
			});
			setEditingId(null);
			onUpdate();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<>
			{data?.slice(0, limit)?.map((update) => (
				<article key={update.id} className="p-5 border-b border-gray-200 hover:bg-gray-50 transition">
					<div className="flex items-center gap-3">
						<Link href={`/profile/@${update.user?.username || update.user_id}`} className="shrink-0">
							<div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
								{update.user?.username?.[0]?.toUpperCase() || "?"}
							</div>
						</Link>
						<div className="flex-1">
							<Link href={`/profile/@${update.user?.username || update.user_id}`} className="hover:underline">
								<p className="text-gray-900 font-semibold">{update.user?.yourname || "Unknown"}</p>
							</Link>
							<Link href={`/profile/@${update.user?.username || update.user_id}`} className="hover:underline">
								<p className="text-gray-500 text-xs">@{update.user?.username || update.user_id.substring(0, 8)}</p>
							</Link>
						</div>
						{currentUserId === update.user_id && (
							<div className="flex gap-2 text-sm text-gray-500">
								<button onClick={() => { setEditingId(update.id); setEditContent(update.content); }} className="hover:text-blue-500">Edit</button>
								<button onClick={() => handleDelete(update.id)} className="hover:text-red-500">Delete</button>
							</div>
						)}
					</div>

					{editingId === update.id ? (
						<div className="mt-3">
							<textarea
								value={editContent}
								onChange={(e) => setEditContent(e.target.value)}
								className="w-full bg-gray-100 p-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
								rows={3}
							/>
							<div className="mt-2 flex gap-2">
								<button onClick={() => handleEditSave(update.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Save</button>
								<button onClick={() => setEditingId(null)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm">Cancel</button>
							</div>
						</div>
					) : (
						<p className="mt-3 text-gray-800 whitespace-pre-wrap">{update.content}</p>
					)}

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
