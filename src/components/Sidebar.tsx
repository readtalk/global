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

	return (
		<>
			{/* Desktop Sidebar */}
			<aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-gray-200 bg-white z-20">
				<div className="p-6 border-b border-gray-200">
					<Link href="/" className="text-2xl font-bold text-gray-900">READTalk</Link>
				</div>
				<nav className="flex-1 p-4 space-y-2">
					<Link href="/" className={`block p-3 rounded-lg ${pathname === "/" ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"}`}>Update</Link>
					{user && (
						<Link href={`/profile/@${user.username}`} className={`block p-3 rounded-lg ${pathname.startsWith("/profile") ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"}`}>
							Profile
						</Link>
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

			{/* Mobile Bottom Navigation */}
			<nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around p-2 z-50">
				
				{/* Tab Chat (Belum aktif, nanti diisi fitur DO) */}
				<button className="flex flex-col items-center p-2 text-xs text-gray-500">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
					<span>Chat</span>
				</button>

				{/* Tab Update (Sekarang pakai ikon Kamera seperti di referensi) */}
				<Link href="/" className={`flex flex-col items-center p-2 text-xs ${pathname === "/" ? "text-red-600 font-semibold" : "text-gray-500"}`}>
					<div className={`p-2 rounded-xl ${pathname === "/" ? "bg-red-100" : ""}`}>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
					</div>
					<span>Update</span>
				</Link>
				
				{/* Tab Communities (Placeholder) */}
				<button className="flex flex-col items-center p-2 text-xs text-gray-500">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
					<span>Communities</span>
				</button>

				{/* Tab Call (Placeholder) */}
				<button className="flex flex-col items-center p-2 text-xs text-gray-500">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
					<span>Call</span>
				</button>
			</nav>
		</>
	);
}
