//
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Sidebar() {
	const [isMobileNavHidden, setIsMobileNavHidden] = useState(true);
	const [user, setUser] = useState<{ username: string; yourname: string } | null>(null);

	useEffect(() => {
		fetch("/api/auth/me")
			.then((res) => res.json() as Promise<{ success: boolean; user?: { username: string; yourname: string } }>)
			.then((data) => {
				if (data.success && data.user) {
					setUser(data.user);
				}
			})
			.catch(() => setUser(null));
	}, []);

	const sidebarHandler = () => {
		setIsMobileNavHidden(!isMobileNavHidden);
	};

	return (
		<div className="min-h-screen border-r border-gray-100 sticky top-0 h-full bg-gray-100 z-20">
			<div className="relative top-0 min-h-screen bottom-0 flex items-center flex-col p-4">
				<button
					onClick={sidebarHandler}
					aria-label="Toggle navigation menu"
					className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-30"
				>
					<svg width={20} height={20} viewBox="0 0 24 24" strokeWidth="1.5" stroke="#718096" fill="none" strokeLinecap="round" strokeLinejoin="round">
						<line x1={4} y1={6} x2={20} y2={6} />
						<line x1={4} y1={12} x2={20} y2={12} />
						<line x1={4} y1={18} x2={20} y2={18} />
					</svg>
				</button>
				<nav aria-label="Main navigation">
					<ul aria-orientation="vertical" className="rounded py-8">
						<li className={`text-gray-600 text-sm leading-3 py-1 tracking-normal ${isMobileNavHidden ? 'cursor-pointer hover:text-blue-700' : 'pointer-events-none'}`}>
							<Link href="/" className={`p-2 block hover:bg-gray-200 rounded relative z-30 ${isMobileNavHidden ? '' : 'pointer-events-none'}`}>
								<svg width={20} height={20} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
									<rect x={4} y={4} width={6} height={6} rx={1} />
									<rect x={14} y={4} width={6} height={6} rx={1} />
									<rect x={4} y={14} width={6} height={6} rx={1} />
									<rect x={14} y={14} width={6} height={6} rx={1} />
								</svg>
							</Link>
						</li>
						<li className={`text-gray-600 text-sm leading-3 tracking-normal mt-6 py-1 ${isMobileNavHidden ? 'cursor-pointer hover:text-blue-700' : 'pointer-events-none' } flex items-center`}>
							<Link href={user ? `/api/auth/logout` : `/api/auth/login`} className={`p-2 block hover:bg-gray-200 rounded relative z-30 ${isMobileNavHidden ? '' : 'pointer-events-none'}`}>
								<svg width={20} height={20} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
									<circle cx={9} cy={7} r={4} />
									<path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
									<path d="M16 3.13a4 4 0 0 1 0 7.75" />
									<path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
								</svg>
							</Link>
						</li>
					</ul>
				</nav>
			</div>
			<div className={`absolute top-0 min-h-screen left-0 ml-10 flex items-start flex-col bg-gray-100 transition duration-300 ease-in-out transform ${isMobileNavHidden ? '-left-full opacity-0 pointer-events-none' : 'left-0 opacity-100 pointer-events-auto'}`}>
				<ul className="rounded py-8 pl-2 pr-32 whitespace-no-wrap">
					{user && (
						<li className="text-gray-600 text-sm tracking-normal py-2">
							<span className="ml-2 font-semibold block">{user.yourname || user.username}</span>
						</li>
					)}
					<li className="cursor-pointer text-gray-600 text-sm tracking-normal py-2 hover:text-blue-700">
						<Link href="/" className="ml-2 p-2 block rounded">Home</Link>
					</li>
					<li className="cursor-pointer text-gray-600 text-sm tracking-normal mt-6 py-2 hover:text-blue-700 flex items-center">
						{user ? (
							<Link href="/api/auth/logout" className="ml-2 p-2 block rounded">Logout</Link>
						) : (
							<Link href="/api/auth/login" className="ml-2 p-2 block rounded">Login/Register</Link>
						)}
					</li>
				</ul>
			</div>
		</div>
	);
}
