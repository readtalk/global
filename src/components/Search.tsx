"use client";

import { useState } from "react";

export default function Search({ onSearchResults }: { onSearchResults?: (results: unknown[]) => void }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchType, setSearchType] = useState("threads");

	const handleSearch = () => {
		if (onSearchResults) {
			onSearchResults([]);
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
					className="bg-gray-800 text-white text-sm px-4 py-2 rounded hover:bg-gray-700 transition"
				>
					Search
				</button>
			</div>
		</div>
	);
}
