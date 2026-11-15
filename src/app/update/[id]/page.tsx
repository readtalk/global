"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { timeAgo } from "@/lib/timer";
import { ArrowBendUpLeft, ArrowLeft } from "@phosphor-icons/react";
import LikeRepost from "@/components/LikeRepost";
import Preview from "@/components/Preview";

type UpdatelistItem = { id: string; user_id: string; content: string; image_url: string | null; created_at: number; like_count: number; comment_count: number; repost_count: number; is_liked?: boolean; is_reposted?: boolean; author_username?: string; author_yourname?: string; author_avatar?: string | null; link_preview?: any; };
type Comment = { id: string; updatelist_id: string; user_id: string; content: string; created_at: number; parent_id?: string | null; author_username?: string; author_yourname?: string; author_avatar?: string | null; };

function UpdateDetailContent() {
	const params = useParams();
	const id = params.id as string;
	const [post, setPost] = useState<UpdatelistItem | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [content, setContent] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isPosting, setIsPosting] = useState(false);
	const [currentUser, setCurrentUser] = useState<{ username: string; yourname: string; avatar: string | null } | null>(null);
	const [replyTo, setReplyTo] = useState<Comment | null>(null);
	const [focusedComment, setFocusedComment] = useState<Comment | null>(null);

	const fetchData = async (showLoading = true) => {
		if (showLoading) setIsLoading(true);
		try {
			const token = localStorage.getItem("session");
			const headers: Record<string, string> = {};
			if (token) headers["Authorization"] = `Bearer ${token}`;
			const [resPost, resComments] = await Promise.all([
				fetch(`/api/updates/${id}`, { headers, cache: "no-store" }),
				fetch(`/api/updates/${id}/comments`, { headers, cache: "no-store" }),
			]);
			const dataPost = (await resPost.json()) as { success: boolean; update?: UpdatelistItem; updates?: UpdatelistItem[] };
			if (dataPost.success) {
				const found = dataPost.update ?? dataPost.updates?.[0] ?? null;
				if (found) setPost(found);
			}
			const dataComments = (await resComments.json()) as { success: boolean; comments: Comment[] };
			if (dataComments.success) {
				setComments(dataComments.comments);
			}
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

	const handlePostComment = async () => {
		if (!content.trim()) return;
		const token = localStorage.getItem("session");
		if (!token) return alert("You must be logged in to comment.");
		
		const commentContent = content;
		const parentId = replyTo ? replyTo.id : (focusedComment ? focusedComment.id : null);
		
		const tempComment: Comment = {
			id: crypto.randomUUID(),
			updatelist_id: id,
			user_id: currentUser?.username || "temp",
			content: commentContent,
			created_at: Math.floor(Date.now() / 1000),
			parent_id: parentId,
			author_username: currentUser?.username,
			author_yourname: currentUser?.yourname,
			author_avatar: currentUser?.avatar
		};

		setComments((prev) => [...prev, tempComment]);
		setContent("");
		setReplyTo(null);
		setIsPosting(true);

		try {
			const res = await fetch(`/api/updates/${id}/comments`, { 
				method: "POST", 
				headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, 
				body: JSON.stringify({ content: commentContent, parent_id: parentId }) 
			});
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

	const handleReplyClick = (targetComment: Comment) => {
		setReplyTo(targetComment);
		setContent(`@${targetComment.author_username} `);
	};

	const renderContentWithMentions = (text: string) => {
		const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
		return parts.map((part, i) => 
			part.startsWith("@") ? (
				<span key={i} className="text-blue-500 hover:underline cursor-pointer">{part}</span>
			) : (
				part
			)
		);
	};

	const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);
	
	const renderComment = (comment: Comment, isReply = false) => {
		const replies = getReplies(comment.id);
		const isOwnComment = currentUser?.username === comment.author_username;

		return (
			<div key={comment.id} className={`flex flex-col gap-2 ${isReply ? 'mt-2 w-full' : ''}`}>
				<div className="flex gap-3 items-start">
					<Link href={`/profile/@${comment.author_username}`} className="shrink-0">
						<div className={`${isReply ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'} rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-zinc-400 font-bold overflow-hidden transition-colors`}>
							{comment.author_avatar ? <img src={comment.author_avatar} className="w-full h-full object-cover" /> : comment.author_username?.[0]?.toUpperCase()}
						</div>
					</Link>
					<div className="flex-1 min-w-0 flex justify-between items-start gap-4">
						<div className={`${isReply ? 'bg-gray-50 dark:bg-zinc-900' : 'bg-gray-100 dark:bg-zinc-800'} rounded-2xl px-4 py-2 max-w-[85%] transition-colors`}>
							<div className="flex items-center gap-2 flex-wrap">
								<Link href={`/profile/@${comment.author_username}`} className={`text-gray-900 dark:text-zinc-100 font-semibold ${isReply ? 'text-xs' : 'text-sm'} hover:underline transition-colors`}>{comment.author_yourname}</Link>
								{comment.author_username === post?.author_username && (
									<span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] px-1.5 py-0.5 rounded font-semibold transition-colors">Creator</span>
								)}
								{comment.created_at && (<><span className="text-gray-400 dark:text-zinc-500 text-[10px] transition-colors">·</span><span className="text-gray-500 dark:text-zinc-400 text-[10px] transition-colors">{timeAgo(comment.created_at)}</span></>)}
							</div>
							<p className={`text-gray-800 dark:text-zinc-200 ${isReply ? 'text-[14px]' : 'text-[15px]'} break-words whitespace-pre-wrap transition-colors`}>{renderContentWithMentions(comment.content)}</p>
						</div>
						{!isOwnComment && (
							<button onClick={() => handleReplyClick(comment)} className="flex items-center gap-1 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 transition mt-1 shrink-0">
								<ArrowBendUpLeft size={16} weight="bold" />
							</button>
						)}
					</div>
				</div>
				
				{replies.length > 0 && (
					<div className={`flex flex-col ${isReply ? '' : 'ml-10 border-l-2 border-gray-100 dark:border-zinc-800 pl-3'} transition-colors`}>
						{replies.map((reply) => renderComment(reply, true))}
					</div>
				)}
			</div>
		);
	};

	if (isLoading) return <div className="w-full h-full flex justify-center items-center bg-white dark:bg-zinc-950 transition-colors"><p className="text-gray-500 dark:text-zinc-400">Loading...</p></div>;

	if (focusedComment) {
		const focusedReplies = getReplies(focusedComment.id);
		
		return (
			<div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden bg-white dark:bg-zinc-950 transition-colors">
				<div className="flex-none bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-4 z-10 transition-colors">
					<button onClick={() => setFocusedComment(null)} className="text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors">
						<ArrowLeft size={24} weight="bold" />
					</button>
					<h1 className="text-lg font-bold text-gray-900 dark:text-zinc-50 transition-colors">Focused Thread</h1>
				</div>
				
				<div className="flex-1 overflow-y-auto p-4">
					{post && (
						<div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm mb-4 transition-colors">
							<div className="flex items-center gap-3 mb-2">
								<Link href={`/profile/@${post.author_username}`} className="shrink-0"><div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-zinc-400 font-bold overflow-hidden transition-colors">{post.author_avatar ? <img src={post.author_avatar} className="w-full h-full object-cover" /> : post.author_username?.[0]?.toUpperCase()}</div></Link>
								<div>
									<div className="flex items-center gap-2">
										<Link href={`/profile/@${post.author_username}`} className="text-gray-900 dark:text-zinc-100 font-semibold hover:underline transition-colors">{post.author_yourname}</Link>
										{post.created_at && (<><span className="text-gray-400 dark:text-zinc-500 text-xs transition-colors">·</span><span className="text-gray-500 dark:text-zinc-400 text-xs transition-colors">{timeAgo(post.created_at)}</span></>)}
									</div>
									<p className="text-gray-500 dark:text-zinc-400 text-xs transition-colors">@{post.author_username}</p>
								</div>
							</div>
							<p className="text-gray-800 dark:text-zinc-200 whitespace-pre-wrap text-[15px] break-words transition-colors">{renderContentWithMentions(post.content)}</p>
							{post.link_preview && <Preview data={post.link_preview} />}
							{post.image_url && <img src={post.image_url} alt="Post Image" className="mt-3 rounded-lg max-h-80 w-full object-cover" />}
						</div>
					)}

					<div className="flex flex-col ml-5 pl-5 border-l-2 border-gray-300 dark:border-zinc-700 pb-4 transition-colors">
						<div className="bg-white dark:bg-zinc-950 -ml-5 rounded-xl border border-gray-200 dark:border-zinc-800 p-3 shadow-sm mb-4 transition-colors">
							<div className="flex gap-3 items-start">
								<Link href={`/profile/@${focusedComment.author_username}`} className="shrink-0">
									<div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-zinc-400 font-bold overflow-hidden transition-colors">
										{focusedComment.author_avatar ? <img src={focusedComment.author_avatar} className="w-full h-full object-cover" /> : focusedComment.author_username?.[0]?.toUpperCase()}
									</div>
								</Link>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<Link href={`/profile/@${focusedComment.author_username}`} className="text-gray-900 dark:text-zinc-100 font-semibold text-sm hover:underline transition-colors">{focusedComment.author_yourname}</Link>
										{focusedComment.author_username === post?.author_username && (
											<span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] px-1.5 py-0.5 rounded font-semibold transition-colors">Creator</span>
										)}
										<span className="text-gray-500 dark:text-zinc-400 text-[10px] transition-colors">{timeAgo(focusedComment.created_at)}</span>
									</div>
									<p className="text-gray-800 dark:text-zinc-200 text-[15px] mt-1 break-words transition-colors">{renderContentWithMentions(focusedComment.content)}</p>
								</div>
							</div>
						</div>

						<div className="flex flex-col gap-3">
							{focusedReplies.map(reply => (
								<div key={reply.id} className="flex gap-3 items-start">
									<Link href={`/profile/@${reply.author_username}`} className="shrink-0">
										<div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-zinc-400 font-bold text-[10px] overflow-hidden transition-colors">
											{reply.author_avatar ? <img src={reply.author_avatar} className="w-full h-full object-cover" /> : reply.author_username?.[0]?.toUpperCase()}
										</div>
									</Link>
									<div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl px-4 py-2 max-w-[85%] transition-colors">
										<div className="flex items-center gap-2">
											<Link href={`/profile/@${reply.author_username}`} className="text-gray-900 dark:text-zinc-100 font-semibold text-xs hover:underline transition-colors">{reply.author_yourname}</Link>
											{reply.author_username === post?.author_username && (
												<span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] px-1.5 py-0.5 rounded font-semibold transition-colors">Creator</span>
											)}
											<span className="text-gray-500 dark:text-zinc-400 text-[10px] transition-colors">{timeAgo(reply.created_at)}</span>
										</div>
										<p className="text-gray-800 dark:text-zinc-200 text-[14px] mt-0.5 break-words transition-colors">{renderContentWithMentions(reply.content)}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="flex-none bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 p-3 pb-safe pb-[max(12px,env(safe-area-inset-bottom))] transition-colors">
					{replyTo && (
						<div className="flex justify-between items-center bg-gray-50 dark:bg-zinc-900 px-3 py-1.5 rounded-t-lg border border-b-0 border-gray-200 dark:border-zinc-800 text-xs text-gray-500 dark:text-zinc-400 mb-[-1px] transition-colors">
							<span>Replying to @{replyTo.author_username}</span>
							<button onClick={() => { setReplyTo(null); setContent(""); }} className="font-bold text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">✕</button>
						</div>
					)}
					<div className="flex gap-2">
						<input 
							type="text" 
							value={content} 
							onChange={(e) => setContent(e.target.value)} 
							placeholder={replyTo ? `Reply to @${replyTo.author_username}...` : `Reply to @${focusedComment.author_username}...`} 
							className="flex-1 bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 placeholder-gray-500 dark:placeholder-zinc-400 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-zinc-400 transition-colors" 
							onKeyDown={(e) => e.key === "Enter" && handlePostComment()} 
						/>
						<button onClick={handlePostComment} disabled={isPosting || !content.trim()} className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-50 transition-colors">{isPosting ? "..." : "Reply"}</button>
					</div>
				</div>
			</div>
		);
	}

	const rootComments = comments.filter(c => !c.parent_id);

	return (
		<div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden bg-white dark:bg-zinc-950 transition-colors">
			<div className="flex-none bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-4 z-10 transition-colors">
				<Link href="/update" className="text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"></path><polyline points="12 19 5 12 12 5"></polyline></svg></Link>
				<h1 className="text-lg font-bold text-gray-900 dark:text-zinc-50 transition-colors">Post's Activity</h1>
			</div>
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{post && (
					<div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm transition-colors">
						<div className="flex items-center gap-3 mb-2">
							<Link href={`/profile/@${post.author_username}`} className="shrink-0"><div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-zinc-400 font-bold overflow-hidden transition-colors">{post.author_avatar ? <img src={post.author_avatar} className="w-full h-full object-cover" /> : post.author_username?.[0]?.toUpperCase()}</div></Link>
							<div>
								<div className="flex items-center gap-2">
									<Link href={`/profile/@${post.author_username}`} className="text-gray-900 dark:text-zinc-100 font-semibold hover:underline transition-colors">{post.author_yourname}</Link>
									{post.created_at && (<><span className="text-gray-400 dark:text-zinc-500 text-xs transition-colors">·</span><span className="text-gray-500 dark:text-zinc-400 text-xs transition-colors">{timeAgo(post.created_at)}</span></>)}
								</div>
								<p className="text-gray-500 dark:text-zinc-400 text-xs transition-colors">@{post.author_username}</p>
							</div>
						</div>
						<p className="text-gray-800 dark:text-zinc-200 whitespace-pre-wrap text-[15px] break-words transition-colors">{renderContentWithMentions(post.content)}</p>
						{post.link_preview && <Preview data={post.link_preview} />}
						{post.image_url && <img src={post.image_url} alt="Post Image" className="mt-3 rounded-lg max-h-80 w-full object-cover" />}
						<div className="mt-4 flex items-center gap-6 text-gray-500 dark:text-zinc-400 text-sm border-t border-gray-200 dark:border-zinc-800 pt-3 transition-colors">
							<Link href={`/update/${post.id}`} className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>{post.comment_count || 0}</Link>
							<LikeRepost 
								id={post.id} 
								like_count={post.like_count} 
								repost_count={post.repost_count} 
								is_liked={post.is_liked} 
								is_reposted={post.is_reposted} 
								onUpdate={() => fetchData(false)} 
							/>
						</div>
					</div>
				)}
				<div className="border-b border-gray-200 dark:border-zinc-800 pb-2 mb-4 transition-colors"><p className="text-xs text-gray-500 dark:text-zinc-400 text-center transition-colors">Comments</p></div>
				
				{rootComments.length > 0 ? (
					rootComments.map((comment) => (
						<div key={comment.id} className="w-full">
							{renderComment(comment)}
							<div className="ml-10 mb-4">
								<button onClick={() => setFocusedComment(comment)} className="text-xs font-semibold text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
									See more  →
								</button>
							</div>
						</div>
					))
				) : (<p className="text-center text-gray-500 dark:text-zinc-400 text-sm mt-4 transition-colors">No comments yet. Be the first to reply!</p>)}
			</div>
			
			<div className="flex-none bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 p-3 pb-safe pb-[max(12px,env(safe-area-inset-bottom))] transition-colors">
				{replyTo && (
					<div className="flex justify-between items-center bg-gray-50 dark:bg-zinc-900 px-3 py-1.5 rounded-t-lg border border-b-0 border-gray-200 dark:border-zinc-800 text-xs text-gray-500 dark:text-zinc-400 mb-[-1px] transition-colors">
						<span>Replying to @{replyTo.author_username}</span>
						<button onClick={() => { setReplyTo(null); setContent(""); }} className="font-bold text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">✕</button>
					</div>
				)}
				<div className="flex gap-2">
					<input 
						type="text" 
						value={content} 
						onChange={(e) => setContent(e.target.value)} 
						placeholder={replyTo ? `Reply to @${replyTo.author_username}...` : "Write a comment..."} 
						className="flex-1 bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 placeholder-gray-500 dark:placeholder-zinc-400 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-zinc-400 transition-colors" 
						onKeyDown={(e) => e.key === "Enter" && handlePostComment()} 
					/>
					<button onClick={handlePostComment} disabled={isPosting || !content.trim()} className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-50 transition-colors">{isPosting ? "..." : "Reply"}</button>
				</div>
			</div>
		</div>
	);
}

export default function UpdateDetail() {
	return <Suspense fallback={<div className="p-4 text-center bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 transition-colors">Loading...</div>}><UpdateDetailContent /></Suspense>;
}
