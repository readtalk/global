"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

type PanelSettingsProps = {
	type: "account" | "privacy" | "appearance" | "language" | "notifications" | null;
	onClose: () => void;
};

export default function PanelSettings({ type, onClose }: PanelSettingsProps) {
	const [user, setUser] = useState<{ username: string; yourname: string; avatar: string | null } | null>(null);

	useEffect(() => {
		if (type === "account") {
			const session = localStorage.getItem("session");
			if (session) {
				try {
					const payload = JSON.parse(atob(session.split(".")[1]));
					const email = payload.properties?.email;
					if (email) setUser({ username: email.split("@")[0], yourname: email.split("@")[0], avatar: null });
				} catch {}
			}
		}
	}, [type]);

	const getTitle = () => {
		switch (type) {
			case "account": return "Account";
			case "privacy": return "Privacy";
			case "appearance": return "Appearance";
			case "language": return "Language";
			case "notifications": return "Notifications";
			default: return "Settings";
		}
	};

	if (!type) return null;

	return (
		<>
			{/* Backdrop untuk mobile */}
			<div 
				className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity" 
				onClick={onClose} 
			/>
			
			{/* Overlay Panel */}
			<div className="fixed top-0 right-0 h-full w-full md:w-[60vw] bg-white dark:bg-zinc-950 z-50 transform transition-transform duration-300 ease-in-out flex flex-col md:shadow-none shadow-2xl border-l border-gray-200 dark:border-zinc-800">
				<div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-zinc-800">
					<button
						onClick={onClose}
						className="md:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
					>
						<ArrowLeft size={20} weight="bold" className="text-gray-600 dark:text-zinc-400" />
					</button>
					<h2 className="text-lg font-bold text-gray-900 dark:text-zinc-50">{getTitle()}</h2>
				</div>
				
				<div className="flex-1 overflow-y-auto p-4">
					{type === "account" && (
						<div className="flex flex-col gap-6 max-w-lg mx-auto">
							<div className="flex items-center gap-4">
								<div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-zinc-400 text-2xl font-bold overflow-hidden transition-colors">
									{user?.avatar ? <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" /> : user?.username?.[0]?.toUpperCase()}
								</div>
								<div className="flex flex-col gap-2">
									<button className="bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
										Change Avatar
									</button>
									<button className="bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
										Change Header
									</button>
								</div>
							</div>
							<div className="flex flex-col gap-4">
								<div>
									<label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Name</label>
									<input type="text" defaultValue={user?.yourname} className="w-full mt-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all" />
								</div>
								<div>
									<label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Email</label>
									<input type="email" placeholder="email@example.com" className="w-full mt-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all" />
								</div>
								<div>
									<label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Date of Birth</label>
									<input type="date" className="w-full mt-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all" />
								</div>
							</div>
							<button className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-full font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors w-full mt-2">
								Save Changes
							</button>
						</div>
					)}

					{type === "privacy" && <p className="text-center text-gray-500 dark:text-zinc-400 mt-10">Privacy settings coming soon.</p>}
					{type === "appearance" && <p className="text-center text-gray-500 dark:text-zinc-400 mt-10">Appearance settings coming soon.</p>}
					{type === "language" && <p className="text-center text-gray-500 dark:text-zinc-400 mt-10">Language settings coming soon.</p>}
					{type === "notifications" && <p className="text-center text-gray-500 dark:text-zinc-400 mt-10">Notification settings coming soon.</p>}
				</div>
			</div>
		</>
	);
}
