"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { DotsThreeVertical, Gear, Phone, VideoCamera, User } from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/context/LanguageContext";

type MutualUser = {
	id: string;
	username: string;
	yourname: string;
	avatar: string | null;
};

function CallContent() {
	const { t } = useLanguage();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [mutuals, setMutuals] = useState<MutualUser[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchMutuals = async () => {
			const token = localStorage.getItem("session");
			if (!token) {
				setIsLoading(false);
				return;
			}
			try {
				const res = await fetch("/api/users/mutual", {
					headers: { "Authorization": `Bearer ${token}` }
				});
				const data = (await res.json()) as { success: boolean; users: MutualUser[] };
				if (data.success) {
					setMutuals(data.users);
				}
			} catch (error) {
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchMutuals();
	}, []);

	const handleCall = (targetUser: MutualUser, type: "audio" | "video") => {
		alert(`${t("calling")} ${targetUser.yourname} (${type}) - ${t("comingSoon")}`);
	};

	return (
		<div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-950 transition-colors relative">

			<div className="flex-none bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between transition-colors">
				<h1 className="text-xl font-bold text-gray-900 dark:text-zinc-50 transition-colors">{t("navCall")}</h1>
				<div className="relative">
					<button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 p-1 transition-colors">
						<DotsThreeVertical size={24} weight="bold" />
					</button>
					{isDropdownOpen && (
						<div className="absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-800 z-50 overflow-hidden flex flex-col py-1 transition-colors">
							<Link href="/settings" onClick={() => setIsDropdownOpen(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
								<Gear size={16} /> {t("settings")}
							</Link>
						</div>
					)}
				</div>
			</div>

			<div className="flex-1 overflow-y-auto min-h-0 pb-20 md:pb-0 bg-white dark:bg-zinc-950 transition-colors">
				<div className="max-w-2xl mx-auto bg-white dark:bg-zinc-950 transition-colors">
					{isLoading ? (
						<div className="p-8 text-center text-gray-500 dark:text-zinc-400">{t("loadingData")}</div>
					) : mutuals.length === 0 ? (
						<div className="p-8 text-center text-gray-500 dark:text-zinc-400 flex flex-col items-center gap-2">
							<User size={48} className="text-gray-300 dark:text-zinc-700" />
							<p>{t("noMutualsYet")}</p>
						</div>
					) : (
						<div className="divide-y divide-gray-100 dark:divide-zinc-800">
							{mutuals.map((m) => (
								<div key={m.id} className="flex items-center gap-3 p-4 transition-colors">
									<Link href={`/profile/@${m.username}`} className="shrink-0">
										<div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-zinc-400 font-bold overflow-hidden transition-colors">
											{m.avatar ? <img src={m.avatar} alt={m.username} className="w-full h-full object-cover" /> : m.username?.[0]?.toUpperCase()}
										</div>
									</Link>
									<div className="flex-1 min-w-0">
										<Link href={`/profile/@${m.username}`} className="hover:underline">
											<p className="text-gray-900 dark:text-zinc-100 font-semibold truncate">{m.yourname}</p>
											<p className="text-gray-500 dark:text-zinc-400 text-xs truncate">@{m.username}</p>
										</Link>
									</div>
									<div className="flex items-center gap-2">
										<button onClick={() => handleCall(m, "audio")} className="p-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors" aria-label={t("audioCall")}>
											<Phone size={20} weight="bold" />
										</button>
										<button onClick={() => handleCall(m, "video")} className="p-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors" aria-label={t("videoCall")}>
											<VideoCamera size={20} weight="bold" />
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			<button aria-label={t("newCall")} className="md:hidden fixed bottom-24 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-black dark:bg-white text-white dark:text-black shadow-lg active:scale-95 transition">
				<Phone size={26} weight="fill" />
			</button>
		</div>
	);
}

export default function CallPage() {
	return <Suspense fallback={<div className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 transition-colors" />}><CallContent /></Suspense>;
}
