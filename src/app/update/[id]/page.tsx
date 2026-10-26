"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

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
		if (!token) {
			alert("You must be logged in to comment.");
			return;
		}

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
				fetchComments();
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsPosting(false);
		}
	};

	return (
		<>
			<div className="flex min-h-screen bg-gray-50">
				<Sidebar />
				<div className="flex-1 w-full pb-20 md:pb-0" id="main-content" role="main">
					<div className="max-w-2xl mx-auto p-4 md:p-6">
						<Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">← Back to Forum</Link>

						<h1 className="text-2xl font-bold mb-6 text-gray-900">Comments</h1>

						<div className="mb-8">
							<textarea
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder="Write a comment..."
								className="w-full bg-white p-4 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 text-gray-900"
								rows={3}
							/>
							<button
								onClick={handlePost}
								disabled={isPosting || !content.trim()}
								className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 font-medium"
							>
								{isPosting ? "Posting..." : "Post Comment"}
							</button>
						</div>

						{isLoading ? (
							<p className="text-gray-500">Loading comments...</p>
						) : comments.length > 0 ? (
							<div className="space-y-4">
								{comments.map((comment) => (
									<div key={comment.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
										<Link 
											href={`/profile/@${comment.user?.username || comment.user_id}`} 
											className="text-sm text-gray-600 mb-1 font-semibold hover:underline block"
										>
											{comment.user?.yourname || comment.user?.username || `User ${comment.user_id.substring(0, 8)}`}
										</Link>
										<p className="text-gray-800">{comment.content}</p>
									</div>
								))}
							</div>
						) : (
							<p className="text-gray-500">No comments yet.</p>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

export default function UpdateDetail() {
	return (
		<Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
			<UpdateDetailContent />
		</Suspense>
	);
}
