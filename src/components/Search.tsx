"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react";

type SearchResult = {
	id?: string;
	content?: string;
	username?: string;
	yourname?: string;
	user?: { username: string; yourname: string };
};

export default function Search() {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchType, setSearchType] = useState("threads");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSearch = async () => {
		if (!searchQuery.trim()) return;
		setIsLoading(true);
		try {
			const token = localStorage.getItem("session");
			const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`, {
				headers: token ? { "Authorization": `Bearer ${token}` } : {},
			});
			const data = (await res.json()) as { success: boolean; results: SearchResult[] };
			if (data.success) {
				setResults(data.results);
				setIsOpen(true);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full relative" ref={wrapperRef}>
			<div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-900 p-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
				
				<input
					className="flex-1 bg-transparent text-gray-800 dark:text-zinc-100 placeholder-gray-500 dark:placeholder-zinc-400 focus:outline-none h-9 pl-3 text-sm transition-colors"
					placeholder="Search..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleSearch()}
					onFocus={() => { if (results.length > 0) setIsOpen(true); }}
				/>
				
				<select
					value={searchType}
					onChange={(e) => { setSearchType(e.target.value); setResults([]); setIsOpen(false); }}
					className="bg-transparent text-gray-600 dark:text-zinc-400 text-sm focus:outline-none font-medium cursor-pointer border-l border-gray-300 dark:border-zinc-700 pl-2 transition-colors"
				>
					<option value="threads" className="dark:bg-zinc-900">Posts</option>
					<option value="posts" className="dark:bg-zinc-900">Users</option>
				</select>

				<button
					onClick={handleSearch}
					disabled={isLoading}
					className="bg-gray-800 dark:bg-zinc-800 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 dark:hover:bg-zinc-700 transition disabled:opacity-50 flex items-center gap-2 text-sm font-semibold"
				>
					{isLoading ? (
						<svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
					) : (
						<MagnifyingGlass size={16} weight="bold" />
					)}
					
				</button>
			</div>
			
			{isOpen && results.length > 0 && (
				<div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto transition-colors">
					<ul className="divide-y divide-gray-100 dark:divide-zinc-800">
						{results.map((item, index) => (
							<li key={index}>
								{searchType === "threads" ? (
									<Link 
										href={`/update/${item.id}`} 
										className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
										onClick={() => setIsOpen(false)}
									>
										<p className="font-medium text-gray-900 dark:text-zinc-100 text-sm truncate">{item.content}</p>
										<p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">by @{item.user?.username || "unknown"}</p>
									</Link>
								) : (
									<Link 
										href={`/profile/@${item.username}`} 
										className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
										onClick={() => setIsOpen(false)}
									>
										<p className="font-medium text-gray-900 dark:text-zinc-100 text-sm">{item.yourname}</p>
										<p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">@{item.username}</p>
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
