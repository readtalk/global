"use client";

import { useState } from "react";
import Link from "next/link";

export default function HomePage() {
	const [title, setTitle] = useState("");
	const [searchQuery, setSearchQuery] = useState("");

	return (
		<div className="flex flex-no-wrap min-h-screen bg-white text-black">
			<aside className="w-16 border-r border-gray-200 flex flex-col items-center py-4 gap-6 shrink-0">
				<button className="text-gray-500 hover:text-black">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
				</button>
				<button className="text-gray-500 hover:text-black">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
				</button>
				<button className="text-gray-500 hover:text-black">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
				</button>
			</aside>

			<main className="w-full px-6">
				<div className="lg:flex flex-wrap">
					<div className="py-10 lg:w-2/3 w-full md:pr-6 md:border-r border-gray-300">
						<div>
							<Link href="/">
								<h1 className="text-3xl text-gray-900 font-bold mb-3">Forum</h1>
							</Link>
							
							<div className="flex flex-col mt-10 md:flex-row md:items-center">
								<div className="w-full md:w-1/2">
									<h3 className="text-xl text-gray-900 mb-2">Search for threads</h3>
									<div className="relative w-full mb-2">
										<input
											className="text-gray-600 focus:outline-none focus:border focus:border-blue-700 bg-gray-100 font-normal w-full h-10 flex items-center pl-4 text-sm border-gray-300 rounded border"
											placeholder="Search"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</div>
									<div className="flex items-center gap-2">
										<select className="bg-gray-100 border border-gray-300 text-gray-600 text-sm rounded px-2 py-2 w-full">
											<option>Threads</option>
										</select>
										<button className="bg-gray-800 text-white text-sm px-4 py-2 rounded">Search</button>
									</div>
								</div>

								<div className="w-full md:w-1/2 pt-3 md:pt-0 md:pl-3">
									<h3 className="text-xl text-gray-900 mb-2">Post a thread</h3>
									<div className="flex flex-col">
										<label htmlFor="post_thread" className="text-gray-800 text-sm font-bold leading-tight tracking-normal mb-2">
											Thread title
										</label>
										<div className="relative w-full mb-2">
											<input
												id="post_thread"
												className="text-gray-600 focus:outline-none focus:border focus:border-blue-700 bg-gray-100 font-normal w-full h-10 flex items-center pl-4 text-sm border-gray-300 rounded border"
												placeholder="Type a title"
												value={title}
												onChange={(e) => setTitle(e.target.value)}
											/>
										</div>
									</div>
									<div className="flex flex-col md:flex-row md:items-center">
										<div className="w-full md:w-1/2" />
										<div className="w-full md:w-1/2 md:flex md:mb-0 mb-4 justify-end">
											<Link
												className="bg-blue-700 text-sm text-white rounded hover:bg-blue-600 transition duration-150 ease-in-out py-2 px-6 text-center"
												href="#"
											>
												Continue
											</Link>
										</div>
									</div>
								</div>
							</div>

							<div className="mt-6">
								<h3 className="mb-5 text-gray-900 font-medium text-xl">Threads</h3>
								<div className="text-gray-500 text-sm">Belum ada data thread.</div>
							</div>
						</div>
					</div>

					<div className="py-10 lg:w-1/3 w-full md:pl-6">
						<h3 className="mb-5 text-gray-900 font-medium text-xl">Recent posts</h3>
						<div className="text-gray-500 text-sm">Belum ada data post.</div>
					</div>
				</div>
			</main>
		</div>
	);
}
