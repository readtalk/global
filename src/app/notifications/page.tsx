"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/timer";

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

export default function NotificationsPage() {
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
				});
				const data = (await res.json()) as { success: boolean; notifications: Notification[] };
				if (data.success) {
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

	if (isLoading) return <div className="p-8 text-center text-gray-500">Loading notifications...</div>;

	return (
		<div className="flex-1 overflow-y-auto min-h-0 pb-16 md:pb-0">
			<div className="max-w-2xl mx-auto bg-white min-h-full shadow-sm">
				<div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3">
					<h1 className="text-xl font-bold text-gray-900">Notifications</h1>
				</div>
				<div className="divide-y divide-gray-100">
					{notifications.length === 0 ? (
						<p className="text-center text-gray-500 text-sm py-10">Belum ada notifikasi.</p>
					) : (
						notifications.map((notif) => (
							<div key={notif.id} className={`p-4 flex gap-3 ${notif.is_read ? 'bg-white' : 'bg-blue-50/30'}`}>
								<Link href={`/profile/@${notif.actor_username || notif.actor_id}`} className="shrink-0">
									<div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden">
										{notif.actor_avatar ? (
											<img src={notif.actor_avatar} className="w-full h-full object-cover" alt={notif.actor_username} />
										) : (
											notif.actor_username?.[0]?.toUpperCase() || "?"
										)}
									</div>
								</Link>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<Link href={`/profile/@${notif.actor_username || notif.actor_id}`} className="text-gray-900 font-semibold text-sm hover:underline">
											{notif.actor_yourname || notif.actor_username || "Unknown"}
										</Link>
										<span className="text-gray-500 text-xs">{timeAgo(notif.created_at)}</span>
									</div>
									<p className="text-gray-600 text-sm mt-0.5">
										{notif.type === "follow" && "followed you."}
										{notif.type === "like" && "liked your post."}
										{notif.type === "comment" && "commented on your post."}
										{notif.type === "repost" && "reposted your post."}
									</p>
									{notif.target_id && notif.type !== "follow" && (
										<Link href={`/update/${notif.target_id}`} className="text-blue-500 text-xs mt-1 hover:underline block">
											View post
										</Link>
									)}
								</div>
								{!notif.is_read && (
									<div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
								)}
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
