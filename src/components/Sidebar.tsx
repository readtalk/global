"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChatCircleDots, At, Bell, User, Gear } from "@phosphor-icons/react/dist/ssr";

export default function Sidebar() {
	const pathname = usePathname();
	const [user, setUser] = useState<{ username: string; yourname: string } | null>(null);

	useEffect(() => {
		const checkSession = () => {
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
			} else {
				setUser(null);
			}
		};

		checkSession();

		window.addEventListener("session-changed", checkSession);
		return () => window.removeEventListener("session-changed", checkSession);
	}, []);

	const isImmersive = 
		pathname.startsWith("/@") || 
		pathname.startsWith("/u/") || 
		pathname.startsWith("/update/") || 
		(pathname.startsWith("/chats/") && pathname !== "/chats" && pathname !== "/chats/");

	if (isImmersive) {
		return null;
	}

	return (
		<>
			<aside className="hidden md:flex flex-col w-16 h-full border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-20 shrink-0 items-center py-4 gap-4 transition-colors">
				<nav className="flex flex-col gap-4 flex-1">
					<Link href="/" className={`flex items-center justify-center w-10 h-10 rounded-lg transition ${pathname === "/" ? "bg-gray-200 dark:bg-zinc-800 text-black dark:text-white" : "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900"}`}>
						<ChatCircleDots size={24} weight={pathname === "/" ? "fill" : "regular"} />
					</Link>
					<Link href="/update" className={`flex items-center justify-center w-10 h-10 rounded-lg transition ${pathname.startsWith("/update") ? "bg-gray-200 dark:bg-zinc-800 text-black dark:text-white" : "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900"}`}>
						<At size={24} weight={pathname.startsWith("/update") ? "bold" : "regular"} />
					</Link>
					{user && (
						<>
							<Link href="/notifications" className={`flex items-center justify-center w-10 h-10 rounded-lg transition ${pathname === "/notifications" ? "bg-gray-200 dark:bg-zinc-800 text-black dark:text-white" : "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900"}`}>
								<Bell size={24} weight={pathname === "/notifications" ? "fill" : "regular"} />
							</Link>
							<Link href={`/profile/@${user.username}`} className={`flex items-center justify-center w-10 h-10 rounded-lg transition ${pathname.startsWith("/profile") ? "bg-gray-200 dark:bg-zinc-800 text-black dark:text-white" : "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900"}`}>
								<User size={24} weight={pathname.startsWith("/profile") ? "fill" : "regular"} />
							</Link>
							<Link href="/settings" className={`flex items-center justify-center w-10 h-10 rounded-lg transition ${pathname.startsWith("/settings") ? "bg-gray-200 dark:bg-zinc-800 text-black dark:text-white" : "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900"}`}>
								<Gear size={24} weight={pathname.startsWith("/settings") ? "fill" : "regular"} />
							</Link>
						</>
					)}
				</nav>

				{!user && (
					<Link href="/api/auth/login" className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
						<User size={24} />
					</Link>
				)}
			</aside>

			<nav className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 flex justify-around p-2 pb-[env(safe-area-inset-bottom)] z-50 transition-colors">
				<Link href="/" className={`flex flex-col items-center p-2 text-xs transition-colors ${pathname === "/" ? "text-black dark:text-white" : "text-gray-500 dark:text-zinc-400"}`}>
					<ChatCircleDots size={24} weight={pathname === "/" ? "fill" : "regular"} />
					<span>Chat</span>
				</Link>
				<Link href="/update" className={`flex flex-col items-center p-2 text-xs transition-colors ${pathname.startsWith("/update") ? "text-black dark:text-white" : "text-gray-500 dark:text-zinc-400"}`}>
					<At size={24} weight={pathname.startsWith("/update") ? "bold" : "regular"} />
					<span>Update</span>
				</Link>
				{user ? (
					<>
						<Link href="/notifications" className={`flex flex-col items-center p-2 text-xs transition-colors ${pathname === "/notifications" ? "text-black dark:text-white" : "text-gray-500 dark:text-zinc-400"}`}>
							<Bell size={24} weight={pathname === "/notifications" ? "fill" : "regular"} />
							<span>Notif</span>
						</Link>
						<Link href={`/profile/@${user.username}`} className={`flex flex-col items-center p-2 text-xs transition-colors ${pathname.startsWith("/profile") ? "text-black dark:text-white" : "text-gray-500 dark:text-zinc-400"}`}>
							<User size={24} weight={pathname.startsWith("/profile") ? "fill" : "regular"} />
							<span>Profile</span>
						</Link>
						<Link href="/settings" className={`flex flex-col items-center p-2 text-xs transition-colors ${pathname.startsWith("/settings") ? "text-black dark:text-white" : "text-gray-500 dark:text-zinc-400"}`}>
							<Gear size={24} weight={pathname.startsWith("/settings") ? "fill" : "regular"} />
							<span>Settings</span>
						</Link>
					</>
				) : (
					<Link href="/api/auth/login" className="flex flex-col items-center p-2 text-xs text-gray-500 dark:text-zinc-400 transition-colors">
						<User size={24} />
						<span>Login</span>
					</Link>
				)}
			</nav>
		</>
	);
}
