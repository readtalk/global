"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChatCircleDots, At, Bell, Gear, UsersThree, Phone, User, Brain } from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext"; // sesuaikan path-mu

export default function Sidebar() {
	const pathname = usePathname();
	const { t } = useLanguage();
	const [user, setUser] = useState<{ username: string; yourname: string; avatar: string | null } | null>(null);

	useEffect(() => {
		const checkSession = () => {
			const session = localStorage.getItem("session");
			if (session) {
				try {
					const payload = JSON.parse(atob(session.split(".")[1]));
					const email = payload.properties?.email;
					if (email) {
						setUser({ username: email.split("@")[0], yourname: email.split("@")[0], avatar: null });
						fetch("https://auth.readtalk.workers.dev/settings", {
							headers: { "Authorization": `Bearer ${session}` }
						})
						.then(res => res.json() as Promise<{ success: boolean; user?: { username: string; yourname: string; avatar: string | null } }>)
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

	const handleAiClick = () => {
		window.dispatchEvent(new Event("open-ai-chat"));
	};

	return (
		<>
			<aside className="hidden md:flex flex-col w-16 h-full border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-20 shrink-0 items-center py-4 transition-colors">
				<nav className="flex flex-col gap-4 flex-1 w-full items-center">
					<Link href="/" title={t("navChat")} aria-label={t("navChat")} className={`flex items-center justify-center w-10 h-10 rounded-lg transition ${pathname === "/" ? "bg-gray-200 dark:bg-zinc-800 text-black dark:text-white" : "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900"}`}>
						<ChatCircleDots size={24} weight={pathname === "/" ? "fill" : "regular"} />
					</Link>
					<Link href="/update" title={t("navUpdate")} aria-label={t("navUpdate")} className={`flex items-center justify-center w-10 h-10 rounded-lg transition ${pathname.startsWith("/update") ? "bg-gray-200 dark:bg-zinc-800 text-black dark:text-white" : "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900"}`}>
						<At size={24} weight={pathname.startsWith("/update") ? "bold" : "regular"} />
					</Link>
					<Link href="/community" title={t("navCommunity")} aria-label={t("navCommunity")} className={`flex items-center justify-center w-10 h-10 rounded-lg transition ${pathname.startsWith("/communities") ? "bg-gray-200 dark:bg-zinc-800 text-black dark:text-white" : "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900"}`}>
						<UsersThree size={24} weight={pathname.startsWith("/communities") ? "fill" : "regular"} />
					</Link>
					<Link href="/call" title={t("navCall")} aria-label={t("navCall")} className={`flex items-center justify-center w-10 h-10 rounded-lg transition ${pathname.startsWith("/call") ? "bg-gray-200 dark:bg-zinc-800 text-black dark:text-white" : "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900"}`}>
						<Phone size={24} weight={pathname.startsWith("/call") ? "fill" : "regular"} />
					</Link>

					<button onClick={handleAiClick} title={t("aiAssistant")} aria-label={t("aiAssistant")} className="flex items-center justify-center w-12 h-12 rounded-full mt-2 transition-all duration-200 bg-gradient-to-b from-blue-300 to-blue-500 dark:from-blue-500 dark:to-blue-700 text-white border border-blue-400/50 dark:border-blue-600/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_4px_6px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_4px_6px_rgba(0,0,0,0.6)] active:shadow-inner active:translate-y-0.5 hover:brightness-110">
						<Brain size={24} weight="bold" />
					</button>
				</nav>

				<div className="flex flex-col gap-4 w-full items-center">
					{user && (
						<>
							<Link href="/notifications" title={t("notifications")} aria-label={t("notifications")} className={`flex items-center justify-center w-10 h-10 rounded-lg transition ${pathname === "/notifications" ? "bg-gray-200 dark:bg-zinc-800 text-black dark:text-white" : "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900"}`}>
								<Bell size={24} weight={pathname === "/notifications" ? "fill" : "regular"} />
							</Link>
							<Link href="/settings" title={t("settings")} aria-label={t("settings")} className={`flex items-center justify-center w-10 h-10 rounded-lg transition ${pathname.startsWith("/settings") ? "bg-gray-200 dark:bg-zinc-800 text-black dark:text-white" : "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900"}`}>
								<Gear size={24} weight={pathname.startsWith("/settings") ? "fill" : "regular"} />
							</Link>
						</>
					)}
					<Link href={user ? `/profile/@${user.username}` : "/api/auth/login"} title={t("profile")} aria-label={t("profile")} className={`flex items-center justify-center w-10 h-10 rounded-lg transition ${pathname.startsWith("/profile") ? "bg-gray-200 dark:bg-zinc-800" : "hover:bg-gray-50 dark:hover:bg-zinc-900"}`}>
						<div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold ${pathname.startsWith("/profile") ? "text-black dark:text-white" : "text-gray-500 dark:text-zinc-400"}`}>
							{user?.avatar ? (
								<img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
							) : user ? (
								user.username?.[0]?.toUpperCase()
							) : (
								<User size={24} />
							)}
						</div>
					</Link>
				</div>
			</aside>

			<nav className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 flex justify-around p-2 z-50 transition-colors">
				<Link href="/" className={`flex flex-col items-center p-2 text-xs transition-colors ${pathname === "/" ? "text-black dark:text-white" : "text-gray-500 dark:text-zinc-400"}`}>
					<ChatCircleDots size={24} weight={pathname === "/" ? "fill" : "regular"} />
					<span>{t("navChat")}</span>
				</Link>
				<Link href="/update" className={`flex flex-col items-center p-2 text-xs transition-colors ${pathname.startsWith("/update") ? "text-black dark:text-white" : "text-gray-500 dark:text-zinc-400"}`}>
					<At size={24} weight={pathname.startsWith("/update") ? "bold" : "regular"} />
					<span>{t("navUpdate")}</span>
				</Link>
				<Link href="/communities" className={`flex flex-col items-center p-2 text-xs transition-colors ${pathname.startsWith("/communities") ? "text-black dark:text-white" : "text-gray-500 dark:text-zinc-400"}`}>
					<UsersThree size={24} weight={pathname.startsWith("/communities") ? "fill" : "regular"} />
					<span>{t("navCommunity")}</span>
				</Link>
				<Link href="/call" className={`flex flex-col items-center p-2 text-xs transition-colors ${pathname.startsWith("/call") ? "text-black dark:text-white" : "text-gray-500 dark:text-zinc-400"}`}>
					<Phone size={24} weight={pathname.startsWith("/call") ? "fill" : "regular"} />
					<span>{t("navCall")}</span>
				</Link>
			</nav>
		</>
	);
}
