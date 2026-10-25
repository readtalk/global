"use client";

import { useState } from "react";
import Link from "next/link";

export default function Search() {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchType, setSearchType] = useState("threads");
	const [results, setResults] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const handleSearch = async () => {
		if (!searchQuery.trim()) return;
		setIsLoading(true);
		try {
			const token = localStorage.getItem("session");
			const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`, {
				headers: token ? { "Authorization": `Bearer ${token}` } : {},
			});
			const data = await res.json();
			if (data.success) {
				setResults(data.results);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full md:w-1/2">
			<h3 className="text-xl text-gray-900 mb-2">Search for threads</h3>
			<div className="relative w-full mb-2">
				<input
					className="text-gray-600 focus:outline-none focus:border focus:border-blue-700 bg-gray-100 font-normal w-full h-10 flex items-center pl-4 text-sm border-gray-300 rounded border"
					placeholder="Search"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleSearch()}
				/>
			</div>
			<div className="flex items-center gap-2">
				<select
					value={searchType}
					onChange={(e) => setSearchType(e.target.value)}
					className="bg-gray-100 border border-gray-300 text-gray-600 text-sm rounded px-2 py-2 w-full"
				>
					<option value="threads">Threads</option>
					<option value="posts">Posts</option>
				</select>
				<button
					onClick={handleSearch}
					disabled={isLoading}
					className="bg-gray-800 text-white text-sm px-4 py-2 rounded hover:bg-gray-700 transition disabled:opacity-50"
				>
					{isLoading ? "..." : "Search"}
				</button>
			</div>
			
			{results.length > 0 && (
				<div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-sm p-4 max-h-60 overflow-y-auto">
					<h4 className="text-sm font-semibold text-gray-700 mb-2">Search Results</h4>
					<ul className="space-y-2">
						{results.map((item, index) => (
							<li key={index} className="text-sm text-gray-800 border-b border-gray-100 pb-2">
								{searchType === "threads" ? (
									<Link href={`/update/${item.id}`} className="hover:underline block">
										<p className="font-medium">{item.content}</p>
										<p className="text-xs text-gray-500">by @{item.user?.username}</p>
									</Link>
								) : (
									<Link href={`/profile/@${item.username}`} className="hover:underline block">
										<p className="font-medium">{item.yourname}</p>
										<p className="text-xs text-gray-500">@{item.username}</p>
									</Link>
								)}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
