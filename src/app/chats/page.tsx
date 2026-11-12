"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChatCircleDots, Plus } from "@phosphor-icons/react/dist/ssr";

type Chat = {
	id: string;
	name: string;
	description: string | null;
	is_private: number;
	created_at: number;
	member_count: number;
	member_ids: string[];
};

export default function ChatsPage() {
	const [chats, setChats] = useState<Chat[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchChats = async () => {
			const token = localStorage.getItem("session");
			if (!token) {
				setIsLoading(false);
				return;
			}

			try {
				const res = await fetch("/api/chats", {
					headers: { "Authorization": `Bearer ${token}` },
				});
				const data = (await res.json()) as { success: boolean; chats: Chat[] };
				if (data.success) {
					setChats(data.chats);
				}
			} catch (error) {
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchChats();
	}, []);

	const privateChats = chats.filter((c) => c.is_private);
	const groupChats = chats.filter((c) => !c.is_private);

	return (
		<div className="flex-1 overflow-y-auto min-h-0 pb-16 md:pb-0 bg-white">
			<div className="max-w-2xl mx-auto bg-white min-h-full shadow-sm">
				<div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
					<h1 className="text-xl font-bold text-gray-900">READTalk</h1>
					<button className="p-2 hover:bg-gray-100 rounded-full transition">
						<Plus size={20} weight="bold" className="text-gray-600" />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto">
					{isLoading ? (
						<div className="p-8 text-center text-gray-500">Loading chats...</div>
					) : chats.length === 0 ? (
						<div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
							<ChatCircleDots size={48} className="text-gray-300" />
							<p>Belum ada obrolan.</p>
						</div>
					) : (
						<>
							{privateChats.length > 0 && (
								<div>
									<div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
										Private
									</div>
									{privateChats.map((chat) => (
										<Link
											key={chat.id}
											href={`/chats/${chat.id}`}
											className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-0"
										>
											<div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0 overflow-hidden">
												{chat.name.substring(0, 2).toUpperCase()}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-gray-900 font-semibold truncate">{chat.name}</p>
												<p className="text-gray-500 text-sm truncate">{chat.description || "Private chat"}</p>
											</div>
										</Link>
									))}
								</div>
							)}

							{groupChats.length > 0 && (
								<div>
									<div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
										Groups
									</div>
									{groupChats.map((chat) => (
										<Link
											key={chat.id}
											href={`/chats/${chat.id}`}
											className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-0"
										>
											<div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0 overflow-hidden">
												{chat.name.substring(0, 2).toUpperCase()}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-gray-900 font-semibold truncate">{chat.name}</p>
												<p className="text-gray-500 text-sm truncate">{chat.description || `${chat.member_count} members`}</p>
											</div>
										</Link>
									))}
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
