"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, PaperPlaneRight, Sparkle, Robot } from "@phosphor-icons/react/dist/ssr";

type Message = {
	id: string;
	role: "user" | "assistant";
	content: string;
	created_at: number;
};

const formatTime = (timestamp: number) =>
	new Date(timestamp * 1000).toLocaleTimeString("id-ID", {
		hour: "2-digit",
		minute: "2-digit",
	});

function AIChatContent() {
	const router = useRouter();
	const [messages, setMessages] = useState<Message[]>([]);
	const [content, setContent] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSending, setIsSending] = useState(false);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);

	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	// 1. Ambil currentUserId dari session (sama seperti contoh)
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

	// 2. Ambil riwayat pesan AI (jika ada endpoint-nya)
	useEffect(() => {
		const fetchMessages = async () => {
			const token = localStorage.getItem("session");
			if (!token) {
				setIsLoading(false);
				return;
			}
			try {
				const res = await fetch("/api/chats/ai/messages", {
					headers: { Authorization: `Bearer ${token}` },
				});
				const data = (await res.json()) as { success: boolean; messages: Message[] };
				if (data.success) {
					setMessages(data.messages);
					setTimeout(scrollToBottom, 100);
				}
			} catch (error) {
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchMessages();
	}, []);

	// 3. Kirim pesan ke AI
	const handleSend = async () => {
		if (!content.trim() || isSending) return;
		const token = localStorage.getItem("session");
		if (!token) return;

		const text = content;
		setContent("");
		setIsSending(true);

		// Optimistic UI: tampilkan pesan user dulu
		const tempId = `temp-${Date.now()}`;
		const userMsg: Message = {
			id: tempId,
			role: "user",
			content: text,
			created_at: Math.floor(Date.now() / 1000),
		};
		setMessages((prev) => [...prev, userMsg]);
		scrollToBottom();

		try {
			const res = await fetch("/api/chats/ai/messages", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ content: text }),
			});
			const data = (await res.json()) as {
				success: boolean;
				user_message?: Message;
				assistant_message?: Message;
				error?: string;
			};

			if (data.success && data.assistant_message) {
				setMessages((prev) => [
					...prev.filter((m) => m.id !== tempId),
					...(data.user_message ? [data.user_message] : []),
					data.assistant_message!,
				]);
			} else {
				// rollback jika gagal
				setMessages((prev) => prev.filter((m) => m.id !== tempId));
				setContent(text);
			}
		} catch (error) {
			console.error(error);
			setMessages((prev) => prev.filter((m) => m.id !== tempId));
			setContent(text);
		} finally {
			setIsSending(false);
			scrollToBottom();
		}
	};

	return (
		<div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden bg-white dark:bg-zinc-950 transition-colors">
			{/* Header */}
			<div className="flex-none bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-4 z-10 transition-colors">
				<button
					onClick={() => router.push("/")}
					className="text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 transition-colors"
				>
					<ArrowLeft size={24} />
				</button>
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
						<Robot size={18} weight="bold" />
					</div>
					<div>
						<h1 className="text-lg font-bold text-gray-900 dark:text-zinc-50 leading-tight">READTalk AI</h1>
						<p className="text-[11px] text-green-500 font-medium">Online</p>
					</div>
				</div>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{isLoading ? (
					<div className="flex justify-center items-center h-full">
						<p className="text-gray-500 dark:text-zinc-400">Loading messages...</p>
					</div>
				) : messages.length === 0 ? (
					<div className="flex flex-col justify-center items-center h-full gap-3 text-center">
						<Sparkle size={48} className="text-gray-300 dark:text-zinc-700" />
						<p className="text-gray-500 dark:text-zinc-400 text-sm">
							Mulai percakapan dengan AI.
						</p>
					</div>
				) : (
					messages.map((msg) => {
						const isMe = msg.role === "user";
						return (
							<div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
								<div
									className={`max-w-[75%] px-4 py-2 rounded-2xl flex flex-col gap-1 transition-colors ${
										isMe
											? "bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-br-sm"
											: "bg-gray-100 dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 rounded-bl-sm"
									}`}
								>
									<p className="text-[15px] whitespace-pre-wrap break-words">{msg.content}</p>
									<span className="text-[10px] text-gray-400 dark:text-zinc-500 self-end">
										{formatTime(msg.created_at)}
									</span>
								</div>
							</div>
						);
					})
				)}
				{isSending && (
					<div className="flex justify-start">
						<span className="text-xs text-gray-400 dark:text-zinc-500 animate-pulse">
							AI sedang mengetik...
						</span>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<div className="flex-none bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 p-3 flex gap-2 pb-safe pb-[max(12px,env(safe-area-inset-bottom))] transition-colors">
				<input
					type="text"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Tanya AI sesuatu..."
					className="flex-1 bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 placeholder-gray-500 dark:placeholder-zinc-400 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-zinc-400 transition-colors"
					onKeyDown={(e) => e.key === "Enter" && handleSend()}
				/>
				<button
					onClick={handleSend}
					disabled={isSending || !content.trim()}
					className="bg-black dark:bg-white text-white dark:text-black p-2.5 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center"
				>
					<PaperPlaneRight size={20} weight="fill" />
				</button>
			</div>
		</div>
	);
}

export default function AIChatPage() {
	return (
		<Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
			<AIChatContent />
		</Suspense>
	);
}
