"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
	const pathname = usePathname();
	const [user, setUser] = useState<{ username: string; yourname: string } | null>(null);

	useEffect(() => {
		const session = localStorage.getItem("session");
		if (session) {
			try {
				const payload = JSON.parse(atob(session.split(".")[1]));
				const email = payload.properties?.email;
				if (email) {
					setUser({ username: email.split("@")[0], yourname: email.split("@")[0] });
					fetch("https://auth.readtalk.workers.dev/settings", {
						headers: { "Authorization": `Bearer ${session}` }
					})
					.then(res => res.json() as Promise<{ success: boolean; user?: { username: string; yourname: string } }>)
					.then(data => {
						if (data.success && data.user) setUser(data.user);
					}).catch(() => {});
				}
			} catch {}
		}
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("session");
		localStorage.removeItem("code_verifier");
		window.location.href = "/api/auth/logout";
	};

	if (pathname.startsWith("/@") || pathname.startsWith("/u/") || pathname.startsWith("/update/")) {
		return null;
	}

	return (
		<>
			<aside className="hidden md:flex flex-col w-64 h-full border-r border-gray-200 bg-white z-20 shrink-0">
				<div className="p-6 border-b border-gray-200">
					<Link href="/" className="text-2xl font-bold text-gray-900">READTalk</Link>
				</div>
				<nav className="flex-1 p-4 space-y-2 overflow-y-auto">
					<Link href="/" className={`block p-3 rounded-lg ${pathname === "/" ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"}`}>Update</Link>
					{user && (
						<>
							<Link href="/notifications" className={`block p-3 rounded-lg ${pathname === "/notifications" ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"}`}>Notifications</Link>
							<Link href={`/profile/@${user.username}`} className={`block p-3 rounded-lg ${pathname.startsWith("/profile") ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"}`}>
								Profile
							</Link>
						</>
					)}
				</nav>
				<div className="p-4 border-t border-gray-200">
					{user ? (
						<button onClick={handleLogout} className="w-full text-left p-3 rounded-lg text-red-500 hover:bg-red-50">Logout</button>
					) : (
						<Link href="/api/auth/login" className="block p-3 rounded-lg bg-blue-600 text-white text-center">Login</Link>
					)}
				</div>
			</aside>

			<nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around p-2 z-50">
				<Link href="/" className={`flex flex-col items-center p-2 text-xs ${pathname === "/" ? "text-blue-600" : "text-gray-500"}`}>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
					<span>Update</span>
				</Link>
				{user && (
					<>
						<Link href="/notifications" className={`flex flex-col items-center p-2 text-xs ${pathname === "/notifications" ? "text-blue-600" : "text-gray-500"}`}>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
							<span>Notif</span>
						</Link>
						<Link href={`/profile/@${user.username}`} className={`flex flex-col items-center p-2 text-xs ${pathname.startsWith("/profile") ? "text-blue-600" : "text-gray-500"}`}>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
							<span>Profile</span>
						</Link>
					</>
				)}
				{user ? (
					<button onClick={handleLogout} className="flex flex-col items-center p-2 text-xs text-gray-500">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
						<span>Logout</span>
					</button>
				) : (
					<Link href="/api/auth/login" className="flex flex-col items-center p-2 text-xs text-gray-500">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
						<span>Login</span>
					</Link>
				)}
			</nav>
		</>
	);
}
