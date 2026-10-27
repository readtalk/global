"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type SearchResult = {
	id?: string;
	content?: string;
	username?: string;
	yourname?: string;
	user?: { username: string; yourname: string };
};

export default function Search() {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchType, setSearchType] = useState("update");
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
		if (!searchQuery.trim()) {
			setResults([]);
			setIsOpen(false);
			return;
		}
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
		<div className="w-full md:w-1/2 relative" ref={wrapperRef}>
			<h3 className="text-lg font-bold text-gray-900 mb-3">Search</h3>
			
			<div className="flex gap-2 mb-2">
				<div className="relative flex-1">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
					<input
						className="text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 font-normal w-full h-10 pl-10 pr-4 text-sm border-transparent rounded-full transition-all"
						placeholder={`Search ${searchType === 'update' ? 'updates' : 'users'}...`}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleSearch()}
						onFocus={() => { if (results.length > 0) setIsOpen(true); }}
					/>
					{isLoading && (
						<div className="absolute inset-y-0 right-0 pr-3 flex items-center">
							<svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
						</div>
					)}
				</div>
			</div>

			<div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
				<button
					onClick={() => { setSearchType("update"); setResults([]); setIsOpen(false); }}
					className={`text-xs px-3 py-1.5 rounded-md font-semibold transition ${searchType === "update" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
				>
					Update
				</button>
				<button
					onClick={() => { setSearchType("username"); setResults([]); setIsOpen(false); }}
					className={`text-xs px-3 py-1.5 rounded-md font-semibold transition ${searchType === "username" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
				>
					Username
				</button>
			</div>

			{/* Dropdown Overlay Hasil Pencarian */}
			{isOpen && results.length > 0 && (
				<div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
					<ul className="divide-y divide-gray-100">
						{results.map((item, index) => (
							<li key={index}>
								{searchType === "update" ? (
									<Link 
										href={`/update/${item.id}`} 
										className="block px-4 py-3 hover:bg-gray-50 transition"
										onClick={() => setIsOpen(false)}
									>
										<p className="font-semibold text-gray-900 text-sm truncate">{item.content}</p>
										<p className="text-xs text-gray-500 mt-0.5">by @{item.user?.username || "unknown"}</p>
									</Link>
								) : (
									<Link 
										href={`/profile/@${item.username}`} 
										className="block px-4 py-3 hover:bg-gray-50 transition"
										onClick={() => setIsOpen(false)}
									>
										<p className="font-semibold text-gray-900 text-sm">{item.yourname}</p>
										<p className="text-xs text-gray-500 mt-0.5">@{item.username}</p>
									</Link>
								)}
							</li>
						))}
					</ul>
				</div>
			)}

			{isOpen && results.length === 0 && searchQuery && !isLoading && (
				<div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 text-center">
					<p className="text-sm text-gray-500">No results found.</p>
				</div>
			)}
		</div>
	);
}
