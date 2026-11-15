"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
	UserCircle, 
	LockKey, 
	Moon, 
	Translate, 
	Bell, 
	SignOut 
} from "@phosphor-icons/react/dist/ssr";

export default function SettingsPage() {
	const router = useRouter();
	const [user, setUser] = useState<{ username: string; yourname: string; avatar: string | null } | null>(null);

	useEffect(() => {
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
			router.replace("/");
		}
	}, [router]);

	const handleLogout = () => {
		localStorage.removeItem("session");
		localStorage.removeItem("code_verifier");
		window.location.href = "/api/auth/logout";
	};

	const menuItems = [
		{ label: "Account", desc: "Privacy, security, change email", icon: UserCircle, href: "/settings/account" },
		{ label: "Privacy", desc: "Block contacts, disappearing messages", icon: LockKey, href: "/settings/privacy" },
		{ label: "Appearance", desc: "Theme, chat wallpaper", icon: Moon, href: "/settings/appearance" },
		{ label: "Language", desc: "English", icon: Translate, href: "/settings/language" },
		{ label: "Notifications", desc: "Message, group & call tones", icon: Bell, href: "/settings/notifications" },
	];

	return (
		<div className="flex-1 overflow-y-auto min-h-0 pb-16 md:pb-0 bg-gray-50 dark:bg-zinc-950 transition-colors">
			<div className="max-w-2xl mx-auto bg-white dark:bg-zinc-950 min-h-full shadow-sm transition-colors">
				<div className="sticky top-0 z-10 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 px-4 py-3 transition-colors">
					<h1 className="text-xl font-bold text-gray-900 dark:text-zinc-50 transition-colors">Settings</h1>
				</div>

				{user && (
					<div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-4 transition-colors">
						<div className="w-16 h-16 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shrink-0 transition-colors">
							{user.avatar ? <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" /> : user.username?.[0]?.toUpperCase()}
						</div>
						<div>
							<h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 transition-colors">{user.yourname}</h2>
							<p className="text-gray-500 dark:text-zinc-400 text-sm transition-colors">@{user.username}</p>
						</div>
					</div>
				)}

				<div className="flex flex-col">
					{menuItems.map((item) => (
						<Link key={item.label} href={item.href} className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
							<div className="text-gray-500 dark:text-zinc-400 transition-colors">
								<item.icon size={24} />
							</div>
							<div className="flex-1">
								<p className="text-gray-900 dark:text-zinc-100 font-medium transition-colors">{item.label}</p>
								<p className="text-gray-500 dark:text-zinc-400 text-sm transition-colors">{item.desc}</p>
							</div>
						</Link>
					))}

					<button onClick={handleLogout} className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left w-full">
						<div className="text-red-500 dark:text-red-400 transition-colors">
							<SignOut size={24} />
						</div>
						<div className="flex-1">
							<p className="text-red-500 dark:text-red-400 font-medium transition-colors">Logout</p>
						</div>
					</button>
				</div>
			</div>
		</div>
	);
}
