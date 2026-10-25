//
"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";

type Comment = {
	id: string;
	updatelist_id: string;
	user_id: string;
	content: string;
	created_at: number;
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
			const res = await fetch(`/api/updates/${id}/comments`);
			const data = await res.json();
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
		<div className="max-w-2xl mx-auto p-6">
			<a href="/" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Forum</a>
			
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
							<p className="text-sm text-gray-600 mb-1">User {comment.user_id.substring(0, 8)}</p>
							<p className="text-gray-800">{comment.content}</p>
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
