"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Search from "@/components/Search";
import Updatelist, { UpdatelistItem } from "@/components/Updatelist";
import UpdatelistComments, { CommentItem } from "@/components/UpdatelistComments";

export default function ForumPage() {
	const [content, setContent] = useState("");
	const [updates, setUpdates] = useState<UpdatelistItem[]>([]);
	const [comments, setComments] = useState<CommentItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				const resUpdates = await fetch("https://auth.readtalk.workers.dev/updates");
				const dataUpdates = await resUpdates.json();
				if (dataUpdates.success) {
					setUpdates(dataUpdates.updates);
				}
			} catch (error) {
				console.error("Failed to fetch updates", error);
			} finally {
				setIsLoading(false);
			}
		}
		fetchData();
	}, []);

	const handlePost = async () => {
		if (!content.trim()) return;
		// Note: POST request requires X-User-Id header which will be added when auth integration is complete
		console.log("Post submitted:", content);
		setContent("");
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
											<Updatelist data={updates} />
										) : (
											<p className="text-gray-500 text-sm">No updates yet.</p>
										)}
									</div>
								</div>
							</div>
							<div className="py-10 lg:w-1/3 w-full md:pl-6">
								<h3 className="mb-5 text-gray-900 font-medium text-xl">Recent comments</h3>
								{comments.length > 0 ? (
									<UpdatelistComments data={comments} limit={7} />
								) : (
									<p className="text-gray-500 text-sm">No recent comments.</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
