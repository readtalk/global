"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Search from "@/components/Search";
import Updatelist, { UpdatelistItem } from "@/components/Updatelist";

export default function ForumPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [content, setContent] = useState("");
	const [updates, setUpdates] = useState<UpdatelistItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// 1. Tangkap token dari URL (abis balik dari callback) dan simpen ke localStorage
	useEffect(() => {
		const token = searchParams.get("token");
		if (token) {
			localStorage.setItem("session", token);
			router.replace("/"); // Bersihin URL dari ?token=...
		}
	}, [searchParams, router]);

	// 2. Fetch data dari API lokal Next.js
	const fetchData = useCallback(async () => {
		setIsLoading(true);
		try {
			const res = await fetch("/api/updates");
			const data = (await res.json()) as { success: boolean; updates: UpdatelistItem[]; users: { id: string, username: string, yourname: string }[] };

			if (data.success) {
				const userMap = new Map(data.users.map(u => [u.id, u]));
				const mergedUpdates = data.updates.map(post => ({
					...post,
					user: userMap.get(post.user_id) || null
				}));
				setUpdates(mergedUpdates);
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

		try {
			const res = await fetch("https://auth.readtalk.workers.dev/updates", {
				method: "POST",
				headers: { 
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`
				},
				body: JSON.stringify({ content }),
			});
			
			const data = await res.json();
			if (res.ok) {
				setContent("");
				fetchData();
			} else {
				alert(data.error || "Failed to post update.");
			}
		} catch (error) {
			console.error("Failed to post", error);
			alert("An error occurred while posting.");
		}
	};

	return (
		<>
			<div className="flex flex-no-wrap">
				<Sidebar />
				<div className="w-full" id="main-content" role="main">
					<div className="w-full px-6">
						<div className="lg:flex flex-wrap">
							<div className="py-10 lg:w-2/3 w-full md:pr-6 md:border-r border-gray-300">
								<div>
									<Link href="/"><h1 className="text-3xl text-gray-900 font-bold mb-3">Forum</h1></Link>
									
									<div className="flex flex-col mt-10 md:flex-row md:items-center">
										<Search />
										<div className="w-full md:w-1/2 pt-3 md:pt-0 md:pl-3">
											<h3 className="text-xl text-gray-900 mb-2">Post an update</h3>
											<div className="flex flex-col">
												<label htmlFor="post_update" className="text-gray-800 text-sm font-bold leading-tight tracking-normal mb-2">
													Content
												</label>
												<div className="relative w-full mb-2">
													<textarea
														id="post_update"
														className="text-gray-600 focus:outline-none focus:border focus:border-blue-700 bg-gray-100 font-normal w-full h-24 p-4 text-sm border-gray-300 rounded border resize-none"
														placeholder="Type something..."
														value={content}
														onChange={(e) => setContent(e.target.value)}
													/>
												</div>
											</div>
											<div className="flex flex-col md:flex-row md:items-center">
												<div className="w-full md:w-1/2" />
												<div className="w-full md:w-1/2 md:flex md:mb-0 mb-4 justify-end">
													<button
														onClick={handlePost}
														className="bg-blue-700 text-sm text-white rounded hover:bg-blue-600 transition duration-150 ease-in-out py-2 px-6 text-center w-full md:w-auto"
													>
														Post
													</button>
												</div>
											</div>
										</div>
									</div>
									
									<div className="mt-6">
										{isLoading ? (
											<p className="text-gray-500 text-sm">Loading updates...</p>
										) : updates.length > 0 ? (
											<Updatelist data={updates} onUpdate={fetchData} />
										) : (
											<p className="text-gray-500 text-sm">No updates yet. Be the first to post!</p>
										)}
									</div>
								</div>
							</div>
							<div className="py-10 lg:w-1/3 w-full md:pl-6">
								<h3 className="mb-5 text-gray-900 font-medium text-xl">Recent comments</h3>
								<p className="text-gray-500 text-sm">Coming soon.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
