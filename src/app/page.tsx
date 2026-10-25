"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Search from "@/components/Search";
import Updatelist, { UpdatelistItem } from "@/components/Updatelist";

function ForumContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [content, setContent] = useState("");
	const [updates, setUpdates] = useState<UpdatelistItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isPosting, setIsPosting] = useState(false);

	useEffect(() => {
		const token = searchParams.get("token");
		if (token) {
			localStorage.setItem("session", token);
			router.replace("/");
		}
	}, [searchParams, router]);

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		try {
			const token = localStorage.getItem("session");
			const res = await fetch("/api/updates", {
				headers: token ? { "Authorization": `Bearer ${token}` } : {},
			});
			const data = (await res.json()) as { success: boolean; updates: UpdatelistItem[] };

			if (data.success) {
				setUpdates(data.updates);
			}
		} catch (error) {
			console.error("Failed to fetch data", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handlePost = async () => {
		if (!content.trim()) return;
		const token = localStorage.getItem("session");
		if (!token) {
			alert("You must be logged in to post.");
			return;
		}

		const postContent = content;
		const tempId = crypto.randomUUID();
		
		let currentUser = { username: "You", yourname: "You" };
		try {
			const payload = JSON.parse(atob(token.split(".")[1]));
			const email = payload.properties?.email;
			if (email) {
				const name = email.split("@")[0];
				currentUser = { username: name, yourname: name };
			}
		} catch {}

		const newPost: UpdatelistItem = {
			id: tempId,
			user_id: "temp",
			content: postContent,
			image_url: null,
			created_at: Math.floor(Date.now() / 1000),
			like_count: 0,
			comment_count: 0,
			repost_count: 0,
			is_liked: false,
			is_reposted: false,
			user: currentUser,
		};

		setUpdates((prev) => [newPost, ...prev]);
		setContent("");
		setIsPosting(true);

		try {
			const res = await fetch("/api/updates", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`
				},
				body: JSON.stringify({ content: postContent }),
			});
			
			if (res.ok) {
				await fetchData();
			}
		} catch (error) {
			console.error("Failed to post", error);
		} finally {
			setIsPosting(false);
		}
	};

	return (
		<div className="flex min-h-screen bg-gray-50">
			<Sidebar />
			<div className="flex-1 w-full pb-20 md:pb-0" id="main-content" role="main">
				<div className="max-w-2xl mx-auto bg-white min-h-screen shadow-sm">
					<div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
						<h1 className="text-xl font-bold text-gray-900">Update</h1>
					</div>

					<div className="p-4 border-b border-gray-200">
						<Search />
					</div>

					<div className="p-4 border-b border-gray-200 bg-white">
						<div className="flex gap-3">
							<div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0">
								U
							</div>
							<div className="flex-1">
								<textarea
									className="w-full bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none resize-none text-lg"
									placeholder="What's happening?"
									rows={3}
									value={content}
									onChange={(e) => setContent(e.target.value)}
									disabled={isPosting}
								/>
								<div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
									<div className="text-blue-500">
										<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
									</div>
									<button
										onClick={handlePost}
										disabled={isPosting || !content.trim()}
										className="bg-blue-600 text-white px-5 py-1.5 rounded-full font-bold text-sm hover:bg-blue-700 transition disabled:opacity-50"
									>
										{isPosting ? "Posting..." : "Post"}
									</button>
								</div>
							</div>
						</div>
					</div>

					<div className="bg-white">
						{isLoading ? (
							<div className="p-8 text-center text-gray-500">Loading updates...</div>
						) : updates.length > 0 ? (
							<Updatelist data={updates} onUpdate={fetchData} />
						) : (
							<div className="p-8 text-center text-gray-500">No updates yet. Be the first to post!</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default function ForumPage() {
	return (
		<Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
			<ForumContent />
		</Suspense>
	);
}
