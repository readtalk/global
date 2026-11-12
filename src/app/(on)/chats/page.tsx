"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChatCircleDots, Plus, UsersThree } from "@phosphor-icons/react/dist/ssr";
import PanelOpen from "@/components/PanelOpen";
import { useWebSocket } from "../layout";

type Chat = {
	id: string;
	name: string;
	description: string | null;
	is_private: number;
	created_at: number;
	member_count: number;
	member_ids: string[];
};

type MutualUser = {
	id: string;
	username: string;
	yourname: string;
	avatar: string | null;
};

export default function ChatsPage() {
	const router = useRouter();
	const { onlineUsers } = useWebSocket();
	const [chats, setChats] = useState<Chat[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isPanelOpen, setIsPanelOpen] = useState(false);
	const [mutuals, setMutuals] = useState<MutualUser[]>([]);
	const [isFetchingMutuals, setIsFetchingMutuals] = useState(false);

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

	useEffect(() => {
		fetchChats();
	}, []);

	useEffect(() => {
		if (isPanelOpen) {
			const fetchMutuals = async () => {
				setIsFetchingMutuals(true);
				const token = localStorage.getItem("session");
				try {
					const res = await fetch("/api/users/mutual", {
						headers: { "Authorization": `Bearer ${token}` },
					});
					const data = (await res.json()) as { success: boolean; users: MutualUser[] };
					if (data.success) {
						setMutuals(data.users);
					}
				} catch (error) {
					console.error(error);
				} finally {
					setIsFetchingMutuals(false);
				}
			};
			fetchMutuals();
		}
	}, [isPanelOpen]);

	const handleStartChat = async (targetUser: MutualUser) => {
		const token = localStorage.getItem("session");
		if (!token) return alert("You must be logged in.");

		try {
			const res = await fetch("/api/chats", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify({
					name: targetUser.yourname,
					is_private: 1,
					member_ids: [targetUser.id],
				}),
			});
			const data = await res.json() as { success: boolean; chat_id?: string, error?: string };

			if (data.success && data.chat_id) {
				setIsPanelOpen(false);
				router.push(`/chats/${data.chat_id}`);
			} else {
				alert(data.error || "Gagal memulai chat");
			}
		} catch (error) {
			console.error(error);
			alert("Terjadi kesalahan saat memulai chat");
		}
	};

	const privateChats = chats.filter((c) => c.is_private);
	const groupChats = chats.filter((c) => !c.is_private);

	return (
		<div className="flex-1 overflow-y-auto min-h-0 pb-16 md:pb-0 bg-white">
			<div className="max-w-2xl mx-auto bg-white min-h-full shadow-sm">
				<div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-2.5 h-2.5 rounded-full bg-green-500" />
						<h1 className="text-xl font-bold text-gray-900">{onlineUsers.length} Online</h1>
					</div>
					<button 
						onClick={() => setIsPanelOpen(true)}
						className="p-2 hover:bg-gray-100 rounded-full transition"
					>
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

			<PanelOpen 
				isOpen={isPanelOpen} 
				onClose={() => setIsPanelOpen(false)} 
				title="New Chat"
			>
				<div className="p-4 space-y-2 border-b border-gray-100">
					<button className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
						<div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
							<UsersThree size={20} weight="bold" />
						</div>
						<div className="flex-1 text-left">
							<p className="text-gray-900 font-semibold">New Group</p>
							<p className="text-xs text-gray-500">Create a new group chat</p>
						</div>
					</button>
				</div>

				<div className="p-2">
					<div className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
						Followback on READTalk
					</div>
					{isFetchingMutuals ? (
						<p className="text-center text-gray-500 text-sm py-4">Memuat data...</p>
					) : mutuals.length === 0 ? (
						<p className="text-center text-gray-500 text-sm py-4">Belum ada mutual.</p>
					) : (
						mutuals.map((m) => (
							<button 
								key={m.id} 
								onClick={() => handleStartChat(m)}
								className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition text-left"
							>
								<div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0 overflow-hidden">
									{m.avatar ? <img src={m.avatar} alt={m.username} className="w-full h-full object-cover" /> : m.username?.[0]?.toUpperCase()}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-gray-900 font-semibold text-sm truncate">{m.yourname}</p>
									<p className="text-gray-500 text-xs truncate">@{m.username}</p>
								</div>
							</button>
						))
					)}
				</div>
			</PanelOpen>
		</div>
	);
}
