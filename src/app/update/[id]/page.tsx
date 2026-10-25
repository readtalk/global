"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Comment = {
	id: string;
	updatelist_id: string;
	user_id: string;
	content: string;
	created_at: number;
	user?: { username: string; yourname: string } | null;
};

function UpdateDetailContent() {
	const params = useParams();
	const id = params.id as string;
	
	const [comments, setComments] = useState<Comment[]>([]);
	const [content, setContent] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isPosting, setIsPosting] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editContent, setEditContent] = useState("");

	const currentUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("session") ? atob(localStorage.getItem("session")!.split(".")[1]) : "{}") : {};
	const currentUserId = currentUser?.properties?.id;

	const fetchComments = async () => {
		try {
			const token = localStorage.getItem("session");
			const res = await fetch(`/api/updates/${id}/comments`, {
				headers: token ? { "Authorization": `Bearer ${token}` } : {},
			});
			const data = (await res.json()) as { success: boolean; comments: Comment[] };
			if (data.success) {
				setComments(data.comments);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchComments();
	}, [id]);

	const handlePost = async () => {
		if (!content.trim()) return;
		const token = localStorage.getItem("session");
		if (!token) return alert("You must be logged in to comment.");

		setIsPosting(true);
		try {
			const res = await fetch(`/api/updates/${id}/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
				body: JSON.stringify({ content }),
			});
			if (res.ok) {
				setContent("");
				fetchComments();
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsPosting(false);
		}
	};

	const handleDeleteComment = async (commentId: string) => {
		if (!confirm("Delete this comment?")) return;
		const token = localStorage.getItem("session");
		if (!token) return;

		try {
			await fetch(`/api/updates/${id}/comments/${commentId}`, {
				method: "DELETE",
				headers: { "Authorization": `Bearer ${token}` },
			});
			fetchComments();
		} catch (error) {
			console.error(error);
		}
	};

	const handleEditSave = async (commentId: string) => {
		const token = localStorage.getItem("session");
		if (!token) return;

		try {
			await fetch(`/api/updates/${id}/comments/${commentId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
				body: JSON.stringify({ content: editContent }),
			});
			setEditingId(null);
			fetchComments();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="max-w-2xl mx-auto p-6">
			<Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Forum</Link>
			
			<h1 className="text-2xl font-bold mb-6">Comments</h1>

			<div className="mb-8">
				<textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Write a comment..."
					className="w-full bg-gray-100 p-4 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
					rows={3}
				/>
				<button
					onClick={handlePost}
					disabled={isPosting || !content.trim()}
					className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
				>
					{isPosting ? "Posting..." : "Post Comment"}
				</button>
			</div>

			{isLoading ? (
				<p className="text-gray-500">Loading comments...</p>
			) : comments.length > 0 ? (
				<div className="space-y-4">
					{comments.map((comment) => (
						<div key={comment.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
							<div className="flex justify-between items-start">
								<Link 
									href={`/profile/@${comment.user?.username || comment.user_id}`} 
									className="text-sm text-gray-600 mb-1 font-semibold hover:underline block"
								>
									{comment.user?.yourname || comment.user?.username || `User ${comment.user_id.substring(0, 8)}`}
								</Link>
								{currentUserId === comment.user_id && (
									<div className="flex gap-2 text-xs text-gray-500">
										<button onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }} className="hover:text-blue-500">Edit</button>
										<button onClick={() => handleDeleteComment(comment.id)} className="hover:text-red-500">Delete</button>
									</div>
								)}
							</div>
							
							{editingId === comment.id ? (
								<div className="mt-2">
									<textarea
										value={editContent}
										onChange={(e) => setEditContent(e.target.value)}
										className="w-full bg-white p-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
										rows={2}
									/>
									<div className="mt-2 flex gap-2">
										<button onClick={() => handleEditSave(comment.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs">Save</button>
										<button onClick={() => setEditingId(null)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs">Cancel</button>
									</div>
								</div>
							) : (
								<p className="text-gray-800">{comment.content}</p>
							)}
						</div>
					))}
				</div>
			) : (
				<p className="text-gray-500">No comments yet.</p>
			)}
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
