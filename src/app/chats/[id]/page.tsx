"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, PaperPlaneRight } from "@phosphor-icons/react/dist/ssr";
import { useWebSocket } from "../../WebSocketProvider";

type Message = {
	id: string;
	chat_id: string;
	user_id: string;
	content: string;
	assets: string;
	created_at: number;
};

function ChatRoomContent() {
	const params = useParams();
	const router = useRouter();
	const id = params.id as string;
	const { onlineUsers } = useWebSocket();

	const [messages, setMessages] = useState<Message[]>([]);
	const [content, setContent] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSending, setIsSending] = useState(false);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);

	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		const session = localStorage.getItem("session");
		if (session) {
			try {
				const payload = JSON.parse(atob(session.split(".")[1]));
				const uid = payload.properties?.id || payload.sub;
				if (uid) setCurrentUserId(uid);
			} catch {}
		}
	}, []);

	useEffect(() => {
		const fetchMessages = async () => {
			const token = localStorage.getItem("session");
			if (!token) return;

			try {
				const res = await fetch(`/api/chats/${id}/messages`, {
					headers: { "Authorization": `Bearer ${token}` },
				});
				const data = (await res.json()) as { success: boolean; messages: Message[] };
				if (data.success) {
					setMessages(data.messages.reverse());
					setTimeout(scrollToBottom, 100);
				}
			} catch (error) {
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchMessages();
	}, [id]);

	const handleSend = async () => {
		if (!content.trim()) return;
		const token = localStorage.getItem("session");
		if (!token) return;

		const text = content;
		setContent("");
		setIsSending(true);

		const tempMessage: Message = {
			id: crypto.randomUUID(),
			chat_id: id,
			user_id: currentUserId || "",
			content: text,
			assets: "[]",
			created_at: Math.floor(Date.now() / 1000)
		};

		setMessages((prev) => [...prev, tempMessage]);
		setTimeout(scrollToBottom, 50);

		try {
			const res = await fetch(`/api/chats/${id}/messages`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify({ content: text, assets: [] }),
			});
			const data = await res.json() as { success: boolean; message?: Message };

			if (data.success && data.message) {
				setMessages((prev) => prev.map(m => m.id === tempMessage.id ? data.message! : m));
			}
		} catch (error) {
			console.error(error);
			setMessages((prev) => prev.filter(m => m.id !== tempMessage.id));
			setContent(text);
		} finally {
			setIsSending(false);
		}
	};

	return (
		<div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden bg-white">
			<div className="flex-none bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 z-10">
				<button onClick={() => router.push("/")} className="text-gray-600 hover:text-gray-900">
					<ArrowLeft size={24} />
				</button>
				<h1 className="text-lg font-bold text-gray-900">Chat Room</h1>
			</div>

			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{isLoading ? (
					<div className="flex justify-center items-center h-full">
						<p className="text-gray-500">Loading messages...</p>
					</div>
				) : messages.length === 0 ? (
					<div className="flex justify-center items-center h-full">
						<p className="text-gray-500 text-sm">Belum ada pesan. Mulai obrolan!</p>
					</div>
				) : (
					messages.map((msg) => {
						const isMe = msg.user_id === currentUserId;
						return (
							<div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
								<div className={`max-w-[75%] px-4 py-2 rounded-2xl ${isMe ? "bg-gray-200 text-gray-900 rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
									<p className="text-[15px] whitespace-pre-wrap break-words">{msg.content}</p>
								</div>
							</div>
						);
					})
				)}
				<div ref={messagesEndRef} />
			</div>

			<div className="flex-none bg-white border-t border-gray-200 p-3 flex gap-2 pb-safe pb-[max(12px,env(safe-area-inset-bottom))]">
				<input
					type="text"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Type a message..."
					className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
					onKeyDown={(e) => e.key === "Enter" && handleSend()}
				/>
				<button
					onClick={handleSend}
					disabled={isSending || !content.trim()}
					className="bg-black text-white p-2.5 rounded-full hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center"
				>
					<PaperPlaneRight size={20} weight="fill" />
				</button>
			</div>
		</div>
	);
}

export default function ChatRoom() {
	return <Suspense fallback={<div className="p-4 text-center">Loading...</div>}><ChatRoomContent /></Suspense>;
}
