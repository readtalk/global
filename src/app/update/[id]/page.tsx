"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Updatelist, { UpdatelistItem } from "@/components/Updatelist";

type Comment = {
	id: string;
	updatelist_id: string;
	user_id: string;
	content: string;
	created_at: number;
	user?: { username: string; yourname: string; avatar: string | null } | null;
};

function UpdateDetailContent() {
	const params = useParams();
	const id = params.id as string;

	const [post, setPost] = useState<UpdatelistItem[]>([]);
	const [comments, setComments] = useState<Comment[]>([]);
	const [content, setContent] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isPosting, setIsPosting] = useState(false);

	const fetchData = async () => {
		try {
			const token = localStorage.getItem("session");
			const headers: Record<string, string> = {};
			if (token) headers["Authorization"] = `Bearer ${token}`;

			const resAll = await fetch(`/api/updates`, { headers });
			const dataAll = (await resAll.json()) as { success: boolean; updates: UpdatelistItem[] };
			
			if (dataAll.success && dataAll.updates) {
				const foundPost = dataAll.updates.filter(p => p.id === id);
				if (foundPost.length > 0) setPost(foundPost);
			}

			const resComments = await fetch(`/api/updates/${id}/comments`, { headers });
			const dataComments = (await resComments.json()) as { success: boolean; comments: Comment[] };
			if (dataComments.success) setComments(dataComments.comments);

		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [id]);

	const handlePostComment = async () => {
		if (!content.trim()) return;
		const token = localStorage.getItem("session");
		if (!token) return alert("You must be logged in to comment.");

		setIsPosting(true);
		try {
			const res = await fetch(`/api/updates/${id}/comments`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`
				},
				body: JSON.stringify({ content }),
			});

			if (res.ok) {
				setContent("");
				fetchData();
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsPosting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen bg-white">
				<Sidebar />
				<div className="flex-1 flex justify-center items-center pb-20">
					<p className="text-gray-500">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen bg-white overflow-hidden">
			<Sidebar />
			<div className="flex-1 flex flex-col h-full pb-20 md:pb-0" id="main-content" role="main">
				<div className="flex-none bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 z-10">
					<Link href="/" className="text-gray-600 hover:text-gray-900">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"></path><polyline points="12 19 5 12 12 5"></polyline></svg>
					</Link>
					<h1 className="text-lg font-bold text-gray-900">Post's Activity</h1>
				</div>

				<div className="flex-1 overflow-y-auto">
					<div className="border-b border-gray-200">
						<Updatelist data={post} onUpdate={fetchData} />
					</div>

					<div className="p-4 space-y-4">
						<div className="border-b border-gray-200 pb-2 mb-4">
							<p className="text-xs text-gray-500 text-center">Comments</p>
						</div>

						{comments.length > 0 ? (
							comments.map((comment) => (
								<div key={comment.id} className="flex gap-3 items-start">
									<Link href={`/profile/@${comment.user?.username}`} className="shrink-0">
										<div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xs overflow-hidden">
											{comment.user?.avatar ? <img src={comment.user.avatar} className="w-full h-full object-cover" /> : comment.user?.username?.[0]?.toUpperCase()}
										</div>
									</Link>
									<div className="bg-gray-100 rounded-2xl px-4 py-2 max-w-[85%]">
										<div className="flex items-center gap-2">
											<Link href={`/profile/@${comment.user?.username}`} className="text-gray-900 font-semibold text-sm hover:underline">{comment.user?.yourname}</Link>
											<span className="text-gray-400 text-[10px]">·</span>
											<span className="text-gray-500 text-[10px]">
												{new Date(comment.created_at * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
											</span>
										</div>
										<p className="text-gray-800 text-[15px]">{comment.content}</p>
									</div>
								</div>
							))
						) : (
							<p className="text-center text-gray-500 text-sm mt-4">No comments yet. Be the first to reply!</p>
						)}
					</div>
				</div>

				<div className="flex-none bg-white border-t border-gray-200 p-3 flex gap-2 pb-safe">
					<input
						type="text"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder="Write a comment..."
						className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
					/>
					<button
						onClick={handlePostComment}
						disabled={isPosting || !content.trim()}
						className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-50"
					>
						{isPosting ? "..." : "Reply"}
					</button>
				</div>
			</div>
		</div>
	);
}

export default function UpdateDetail() {
	return (
		<Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
			<UpdateDetailContent />
		</Suspense>
	);
}
