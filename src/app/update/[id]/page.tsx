"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { timeAgo } from "@/lib/timer";

type UpdatelistItem = { id: string; user_id: string; content: string; image_url: string | null; created_at: number; like_count: number; comment_count: number; repost_count: number; user?: { username: string; yourname: string; avatar: string | null } | null; };
type Comment = { id: string; updatelist_id: string; user_id: string; content: string; created_at: number; user?: { username: string; yourname: string; avatar: string | null } | null; };

function UpdateDetailContent() {
	const params = useParams();
	const id = params.id as string;
	const [post, setPost] = useState<UpdatelistItem | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [content, setContent] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isPosting, setIsPosting] = useState(false);
	const [loadingAction, setLoadingAction] = useState<string | null>(null);
	const [currentUser, setCurrentUser] = useState<{ username: string; yourname: string; avatar: string | null } | null>(null);

	const fetchData = async (showLoading = true) => {
		if (showLoading) setIsLoading(true);
		try {
			const token = localStorage.getItem("session");
			const headers: Record<string, string> = {};
			if (token) headers["Authorization"] = `Bearer ${token}`;
			const resAll = await fetch(`/api/updates`, { headers });
			const dataAll = (await resAll.json()) as { success: boolean; updates: UpdatelistItem[] };
			if (dataAll.success && dataAll.updates) {
				const foundPost = dataAll.updates.find(p => p.id === id);
				if (foundPost) setPost(foundPost);
			}
			const resComments = await fetch(`/api/updates/${id}/comments`, { headers });
			const dataComments = (await resComments.json()) as { success: boolean; comments: Comment[] };
			if (dataComments.success) setComments(dataComments.comments);
		} catch (error) { console.error(error); } finally { if (showLoading) setIsLoading(false); }
	};

	useEffect(() => { 
		fetchData(); 
		const session = localStorage.getItem("session");
		if (session) {
			try {
				const payload = JSON.parse(atob(session.split(".")[1]));
				const email = payload.properties?.email;
				if (email) setCurrentUser({ username: email.split("@")[0], yourname: email.split("@")[0], avatar: null });
				fetch("https://auth.readtalk.workers.dev/settings", { headers: { "Authorization": `Bearer ${session}` } })
				.then(res => res.json() as Promise<{ success: boolean; user?: any }>)
				.then(data => { if (data.success && data.user) setCurrentUser(data.user); })
				.catch(() => {});
			} catch {}
		}
	}, [id]);

	const handleAction = async (action: "like" | "repost") => {
		if (!post) return;
		const token = localStorage.getItem("session");
		if (!token) return alert(`You must be logged in to ${action}.`);
		setLoadingAction(`${action}-${post.id}`);
		try {
			await fetch(`/api/updates/${post.id}/${action}`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` } });
			await fetchData(false);
		} catch (error) { console.error(error); } finally { setLoadingAction(null); }
	};

	const handlePostComment = async () => {
		if (!content.trim()) return;
		const token = localStorage.getItem("session");
		if (!token) return alert("You must be logged in to comment.");
		
		const commentContent = content;
		
		const tempComment: Comment = {
			id: crypto.randomUUID(),
			updatelist_id: id,
			user_id: currentUser?.username || "temp",
			content: commentContent,
			created_at: Math.floor(Date.now() / 1000),
			user: currentUser ? { username: currentUser.username, yourname: currentUser.yourname, avatar: currentUser.avatar } : { username: "You", yourname: "You", avatar: null }
		};

		setComments((prev) => [...prev, tempComment]);
		setContent("");
		setIsPosting(true);

		try {
			const res = await fetch(`/api/updates/${id}/comments`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify({ content: commentContent }) });
			if (res.ok) { 
				await fetchData(false); 
			}
		} catch (error) { 
			console.error(error); 
			fetchData(false);
		} finally { 
			setIsPosting(false); 
		}
	};

	if (isLoading) return <div className="w-full h-full flex justify-center items-center"><p className="text-gray-500">Loading...</p></div>;

	return (
		<div className="w-full h-full flex flex-col bg-white">
			<div className="flex-none bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 z-10">
				<Link href="/" className="text-gray-600 hover:text-gray-900"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"></path><polyline points="12 19 5 12 12 5"></polyline></svg></Link>
				<h1 className="text-lg font-bold text-gray-900">Post's Activity</h1>
			</div>
			
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{post && (
					<div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
						<div className="flex items-center gap-3 mb-2">
							<Link href={`/profile/@${post.user?.username}`} className="shrink-0"><div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden">{post.user?.avatar ? <img src={post.user.avatar} className="w-full h-full object-cover" /> : post.user?.username?.[0]?.toUpperCase()}</div></Link>
							<div>
								<div className="flex items-center gap-2">
									<Link href={`/profile/@${post.user?.username}`} className="text-gray-900 font-semibold hover:underline">{post.user?.yourname}</Link>
									{post.created_at && (<><span className="text-gray-400 text-xs">·</span><span className="text-gray-500 text-xs">{timeAgo(post.created_at)}</span></>)}
								</div>
								<p className="text-gray-500 text-xs">@{post.user?.username}</p>
							</div>
						</div>
						<p className="text-gray-800 whitespace-pre-wrap text-[15px]">{post.content}</p>
						{post.image_url && <img src={post.image_url} alt="Post Image" className="mt-3 rounded-lg max-h-80 w-full object-cover" />}
						<div className="mt-4 flex items-center gap-6 text-gray-500 text-sm border-t border-gray-200 pt-3">
							<Link href={`/update/${post.id}`} className="flex items-center gap-1 hover:text-blue-500 transition"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>{post.comment_count || 0}</Link>
							<button onClick={() => handleAction("repost")} disabled={loadingAction === `repost-${post.id}`} className="flex items-center gap-1 hover:text-green-500 transition"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>{post.repost_count || 0}</button>
							<button onClick={() => handleAction("like")} disabled={loadingAction === `like-${post.id}`} className="flex items-center gap-1 hover:text-red-500 transition"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>{post.like_count || 0}</button>
						</div>
					</div>
				)}
				<div className="border-b border-gray-200 pb-2 mb-4"><p className="text-xs text-gray-500 text-center">Comments</p></div>
				{comments.length > 0 ? (
					comments.map((comment) => (
						<div key={comment.id} className="flex gap-3 items-start">
							<Link href={`/profile/@${comment.user?.username}`} className="shrink-0"><div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xs overflow-hidden">{comment.user?.avatar ? <img src={comment.user.avatar} className="w-full h-full object-cover" /> : comment.user?.username?.[0]?.toUpperCase()}</div></Link>
							<div className="bg-gray-100 rounded-2xl px-4 py-2 max-w-[85%]">
								<div className="flex items-center gap-2">
									<Link href={`/profile/@${comment.user?.username}`} className="text-gray-900 font-semibold text-sm hover:underline">{comment.user?.yourname}</Link>
									{comment.created_at && (<><span className="text-gray-400 text-[10px]">·</span><span className="text-gray-500 text-[10px]">{timeAgo(comment.created_at)}</span></>)}
								</div>
								<p className="text-gray-800 text-[15px]">{comment.content}</p>
							</div>
						</div>
					))
				) : (<p className="text-center text-gray-500 text-sm mt-4">No comments yet. Be the first to reply!</p>)}
			</div>

			<div className="flex-none bg-white border-t border-gray-200 p-3 flex gap-2">
				<input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write a comment..." className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" onKeyDown={(e) => e.key === "Enter" && handlePostComment()} />
				<button onClick={handlePostComment} disabled={isPosting || !content.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-50">{isPosting ? "..." : "Reply"}</button>
			</div>
		</div>
	);
}

export default function UpdateDetail() {
	return <Suspense fallback={<div className="p-4 text-center">Loading...</div>}><UpdateDetailContent /></Suspense>;
}
