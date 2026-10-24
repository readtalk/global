"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Search from "@/components/Search";
import Updatelist from "@/components/Updatelist";
import UpdatelistComments from "@/components/UpdatelistComments";

export default function ForumPage() {
	const [content, setContent] = useState("");

	// Data dummy (nanti diganti dengan fetch ke /updates)
	const dummyUpdates = [
		{
			id: "1",
			user_id: "c56be407b81c32a105fd8f24b35c0645",
			content: "Ini adalah update pertama di sistem baru. UI-nya pakai kerangka Forum!",
			image_url: null,
			created_at: Math.floor(Date.now() / 1000),
			like_count: 5,
			comment_count: 2,
			repost_count: 1,
			is_liked: false,
			is_reposted: false,
			user: { username: "fadilgibson", yourname: "Fadil Gibson", avatar: null },
		},
	];

	const dummyComments = [
		{
			id: "1",
			updatelist_id: "1",
			user_id: "2",
			content: "Setuju, kerangka Forum-nya tetap keren.",
			created_at: Math.floor(Date.now() / 1000),
			user: { username: "admin", yourname: "Admin" },
		},
	];

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
														className="bg-blue-700 text-sm text-white rounded hover:bg-blue-600 transition duration-150 ease-in-out py-2 px-6 text-center w-full md:w-auto"
													>
														Post
													</button>
												</div>
											</div>
										</div>
									</div>
									<div className="mt-6">
										<Updatelist data={dummyUpdates} />
									</div>
								</div>
							</div>
							<div className="py-10 lg:w-1/3 w-full md:pl-6">
								<h3 className="mb-5 text-gray-900 font-medium text-xl">Recent comments</h3>
								<UpdatelistComments data={dummyComments} limit={7} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
