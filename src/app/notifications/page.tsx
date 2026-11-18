"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/timer";
import { useLanguage } from "@/context/LanguageContext";

type Notification = {
	id: string;
	user_id: string;
	actor_id: string;
	type: string;
	target_id: string | null;
	is_read: number;
	created_at: number;
	actor_username?: string;
	actor_yourname?: string;
	actor_avatar?: string | null;
};

function NotificationsContent() {
	const { t } = useLanguage();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchNotifications = async () => {
			const token = localStorage.getItem("session");
			if (!token) {
				setIsLoading(false);
				return;
			}

			try {
				const res = await fetch("/api/notifications", {
					headers: { "Authorization": `Bearer ${token}` },
					cache: "no-store",
				});
				const data = (await res.json()) as { success: boolean; notifications: Notification[] };
				
				if (data.success && data.notifications) {
					setNotifications(data.notifications);

					if (data.notifications.some((n) => !n.is_read)) {
						await fetch("/api/notifications/read", {
							method: "PUT",
							headers: { "Authorization": `Bearer ${token}` },
						});
					}
				}
			} catch (error) {
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchNotifications();
	}, []);

	return (
		<div className="flex-1 overflow-y-auto min-h-0 pb-24 md:pb-0 bg-white dark:bg-zinc-950 transition-colors">
			<div className="max-w-2xl mx-auto bg-white dark:bg-zinc-950 min-h-full shadow-sm transition-colors">
				<div className="sticky top-0 z-10 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 px-4 py-3 transition-colors">
					<h1 className="text-xl font-bold text-gray-900 dark:text-zinc-50 transition-colors">{t("notifications")}</h1>
				</div>
				
				<div className="divide-y divide-gray-100 dark:divide-zinc-800 transition-colors">
					{isLoading ? (
						<div className="p-8 text-center text-gray-500 dark:text-zinc-400">{t("loadingNotifications")}</div>
					) : notifications.length === 0 ? (
						<p className="text-center text-gray-500 dark:text-zinc-400 text-sm py-10 transition-colors">{t("noNotificationsYet")}</p>
					) : (
						notifications.map((notif) => (
							<div key={notif.id} className={`p-4 flex gap-3 transition-colors ${notif.is_read ? 'bg-white dark:bg-zinc-950' : 'bg-blue-50/30 dark:bg-blue-900/10'}`}>
								<Link href={`/profile/@${notif.actor_username || notif.actor_id}`} className="shrink-0">
									<div className="w-10 h-10 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white font-bold overflow-hidden transition-colors">
										{notif.actor_avatar ? (
											<img src={notif.actor_avatar} className="w-full h-full object-cover" alt={notif.actor_username} />
										) : (
											notif.actor_username?.[0]?.toUpperCase() || "?"
										)}
									</div>
								</Link>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<Link href={`/profile/@${notif.actor_username || notif.actor_id}`} className="text-gray-900 dark:text-zinc-100 font-semibold text-sm hover:underline transition-colors">
											{notif.actor_yourname || notif.actor_username || t("unknownUser")}
										</Link>
										<span className="text-gray-500 dark:text-zinc-400 text-xs transition-colors">{timeAgo(notif.created_at)}</span>
									</div>
									<p className="text-gray-600 dark:text-zinc-300 text-sm mt-0.5 transition-colors">
										{notif.type === "follow" && t("notifFollowed")}
										{notif.type === "like" && t("notifLiked")}
										{notif.type === "comment" && t("notifCommented")}
										{notif.type === "repost" && t("notifReposted")}
										{notif.type === "reply" && t("notifReplied")}
										{notif.type !== "follow" && notif.type !== "like" && notif.type !== "comment" && notif.type !== "repost" && notif.type !== "reply" && `${notif.type} on your post.`}
									</p>
									{notif.target_id && notif.type !== "follow" && (
										<Link href={`/update/${notif.target_id}`} className="text-blue-500 dark:text-blue-400 text-xs mt-1 hover:underline block transition-colors">
											{t("viewPost")}
										</Link>
									)}
								</div>
								{!notif.is_read && (
									<div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 shrink-0 mt-2 transition-colors" />
								)}
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}

export default function NotificationsPage() {
	return <Suspense fallback={<div className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 transition-colors" />}><NotificationsContent /></Suspense>;
}
