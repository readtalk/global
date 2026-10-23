"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Sidebar() {
	const [isMobileNavHidden, setIsMobileNavHidden] = useState(true);
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		fetch("/api/auth/status")
			.then((res) => res.json() as Promise<{ loggedIn: boolean }>)
			.then((data) => setIsLoggedIn(data.loggedIn))
			.catch(() => setIsLoggedIn(false));
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
					aria-expanded={!isMobileNavHidden}
					className="p-2 hover:bg-gray-200 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-30"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="icon icon-tabler icon-tabler-menu-2"
						width={20}
						height={20}
						viewBox="0 0 24 24"
						strokeWidth="1.5"
						stroke="#718096"
						fill="none"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path stroke="none" d="M0 0h24v24H0z" />
						<line x1={4} y1={6} x2={20} y2={6} />
						<line x1={4} y1={12} x2={20} y2={12} />
						<line x1={4} y1={18} x2={20} y2={18} />
					</svg>
				</button>
				<nav aria-label="Main navigation">
					<ul aria-orientation="vertical" className="rounded py-8">
						<li className={`text-gray-600 text-sm leading-3 py-1 tracking-normal ${isMobileNavHidden ? 'cursor-pointer hover:text-blue-700 focus-within:text-blue-700' : 'pointer-events-none'}`}>
							<Link href="/" aria-label="Home" className={`p-2 block hover:bg-gray-200 rounded relative z-30 ${isMobileNavHidden ? 'focus:outline-none focus:ring-2 focus:ring-blue-500' : 'pointer-events-none'}`}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="icon icon-tabler icon-tabler-grid"
									width={20}
									height={20}
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="currentColor"
									fill="none"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden="true"
								>
									<path stroke="none" d="M0 0h24v24H0z" />
									<rect x={4} y={4} width={6} height={6} rx={1} />
									<rect x={14} y={4} width={6} height={6} rx={1} />
									<rect x={4} y={14} width={6} height={6} rx={1} />
									<rect x={14} y={14} width={6} height={6} rx={1} />
								</svg>
							</Link>
						</li>
						<li className={`text-gray-600 text-sm leading-3 tracking-normal mt-6 py-1 ${isMobileNavHidden ? 'cursor-pointer hover:text-blue-700 focus-within:text-blue-700' : 'pointer-events-none' } flex items-center`}>
							<Link href={isLoggedIn ? `/api/auth/logout` : `/api/auth/login`} aria-label={isLoggedIn ? 'Logout' : 'Login or Register'} className={`p-2 block hover:bg-gray-200 rounded relative z-30 ${isMobileNavHidden ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 ' : 'pointer-events-none'}`}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="icon icon-tabler icon-tabler-users"
									width={20}
									height={20}
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="currentColor"
									fill="none"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden="true"
								>
									<path stroke="none" d="M0 0h24v24H0z" />
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
			<div
				className={`absolute top-0 min-h-screen left-0 ml-10 flex items-start flex-col bg-gray-100 transition duration-300 ease-in-out transform ${isMobileNavHidden ? '-left-full opacity-0 pointer-events-none' : 'left-0 opacity-100 pointer-events-auto'}`}
				id="mobile-nav"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="opacity-0 pointer-events-none icon icon-tabler icon-tabler-menu-2 cursor-pointer mt-8"
					width={20}
					height={20}
					viewBox="0 0 24 24"
					strokeWidth="1.5"
					stroke="#718096"
					fill="none"
					strokeLinecap="round"
					strokeLinejoin="round"
					onClick={sidebarHandler}
				>
					<path stroke="none" d="M0 0h24v24H0z" />
					<line x1={4} y1={6} x2={20} y2={6} />
					<line x1={4} y1={12} x2={20} y2={12} />
					<line x1={4} y1={18} x2={20} y2={18} />
				</svg>
				<ul
					aria-orientation="vertical"
					className="rounded py-8 pl-2 pr-32 whitespace-no-wrap"
				>
					<li className="cursor-pointer text-gray-600 text-sm leading-3 tracking-normal py-2 hover:text-blue-700 focus-within:text-blue-700">
						<Link href="/" className="ml-2 p-2 block rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
							Home
						</Link>
					</li>
					<li className="cursor-pointer text-gray-600 text-sm leading-3 tracking-normal mt-6 py-2 hover:text-blue-700 focus-within:text-blue-700 flex items-center">
						{isLoggedIn ? (
							<Link href="/api/auth/logout" className="ml-2 p-2 block rounded focus:outline-none focus:ring-2 focus:ring-blue-500">Logout</Link>
						) : (
							<Link href="/api/auth/login" className="ml-2 p-2 block rounded focus:outline-none focus:ring-2 focus:ring-blue-500">Login/Register</Link>
						)}
					</li>
				</ul>
			</div>
		</div>
	);
}
