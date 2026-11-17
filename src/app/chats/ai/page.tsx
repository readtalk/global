"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, PaperPlaneRight } from "@phosphor-icons/react/dist/ssr";

type ChatMessage = {
	role: "user" | "assistant";
	content: string;
	created_at: number;
};

function consumeSseEvents(buffer: string): { events: string[]; buffer: string } {
	let normalized = buffer.replace(/\r/g, "");
	const events: string[] = [];
	let eventEndIndex: number;
	while ((eventEndIndex = normalized.indexOf("\n\n")) !== -1) {
		const rawEvent = normalized.slice(0, eventEndIndex);
		normalized = normalized.slice(eventEndIndex + 2);

		const lines = rawEvent.split("\n");
		const dataLines: string[] = [];
		for (const line of lines) {
			if (line.startsWith("data:")) {
				dataLines.push(line.slice("data:".length).trimStart());
			}
		}
		if (dataLines.length === 0) continue;
		events.push(dataLines.join("\n"));
	}
	return { events, buffer: normalized };
}

function extractContent(data: string): string {
	try {
		const jsonData = JSON.parse(data);
		if (typeof jsonData.response === "string" && jsonData.response.length > 0) {
			return jsonData.response;
		}
		if (jsonData.choices?.[0]?.delta?.content) {
			return jsonData.choices[0].delta.content;
		}
	} catch (e) {
		console.error("SSE parse error:", e, data);
	}
	return "";
}

const isSameDay = (a: number, b: number) => {
	const da = new Date(a * 1000);
	const db = new Date(b * 1000);
	return da.getFullYear() === db.getFullYear()
		&& da.getMonth() === db.getMonth()
		&& da.getDate() === db.getDate();
};

const formatDay = (timestamp: number) => {
	const d = new Date(timestamp * 1000);
	const today = new Date();
	const yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);

	if (d.toDateString() === today.toDateString()) return 'Today';
	if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

	return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatTime = (timestamp: number) => {
	return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});
};

function AIChatContent() {
	const router = useRouter();
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [content, setContent] = useState("");
	const [isSending, setIsSending] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const handleSend = async () => {
		if (!content.trim() || isSending) return;

		const text = content;
		const token = localStorage.getItem("session") || "";
		const now = Math.floor(Date.now() / 1000);

		const history = [...messages, { role: "user" as const, content: text, created_at: now }];
		const aiIndex = history.length;

		setMessages([...history, { role: "assistant", content: "", created_at: now }]);
		setContent("");
		setIsSending(true);

		const audio = new Audio('/sound/all-eyes-on-me.mp3');
		audio.play().catch(() => {});

		setTimeout(scrollToBottom, 50);

		try {
			const res = await fetch("/api/ai/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({
					messages: history.map(({ role, content }) => ({ role, content })),
				}),
			});

			if (!res.ok || !res.body) throw new Error("Failed to get response");

			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";
			let responseText = "";
			let sawDone = false;

			const flush = () => {
				const snapshot = responseText;
				setMessages((prev) => {
					const next = [...prev];
					next[aiIndex] = { ...next[aiIndex], content: snapshot };
					return next;
				});
				scrollToBottom();
			};

			while (true) {
				const { done, value } = await reader.read();

				if (done) {
					const parsed = consumeSseEvents(buffer + "\n\n");
					for (const data of parsed.events) {
						if (data === "[DONE]") break;
						const chunk = extractContent(data);
						if (chunk) {
							responseText += chunk;
							flush();
						}
					}
					break;
				}

				buffer += decoder.decode(value, { stream: true });
				const parsed = consumeSseEvents(buffer);
				buffer = parsed.buffer;

				for (const data of parsed.events) {
					if (data === "[DONE]") {
						sawDone = true;
						buffer = "";
						break;
					}
					const chunk = extractContent(data);
					if (chunk) {
						responseText += chunk;
						flush();
					}
				}
				if (sawDone) break;
			}
		} catch (error) {
			console.error(error);
			setMessages((prev) => {
				const next = [...prev];
				if (next[aiIndex] && !next[aiIndex].content) {
					next[aiIndex] = { ...next[aiIndex], content: "Sorry, I couldn't reach the AI." };
				}
				return next;
			});
		} finally {
			setIsSending(false);
			scrollToBottom();
		}
	};

	return (
		<div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden bg-white dark:bg-zinc-950 transition-colors">
			<div className="flex-none bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-4 z-10 transition-colors">
				<button onClick={() => router.push("/")} className="text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 transition-colors">
					<ArrowLeft size={24} />
				</button>
				<h1 className="text-lg font-bold text-gray-900 dark:text-zinc-50">Mode AI</h1>
			</div>

			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{messages.length === 0 ? (
					<div className="flex justify-center items-center h-full">
						<p className="text-gray-500 dark:text-zinc-400 text-sm">Start with Anna Laura AI</p>
					</div>
				) : (
					messages.map((msg, index) => {
						const isMe = msg.role === "user";
						const isTyping = !isMe && !msg.content && isSending && index === messages.length - 1;
						const prev = messages[index - 1];
						const isNewDay = !prev || !isSameDay(prev.created_at, msg.created_at);

						return (
							<div key={index}>
								{isNewDay && (
									<div className="flex justify-center my-4">
										<span className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 transition-colors">
											{formatDay(msg.created_at)}
										</span>
									</div>
								)}
								<div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
									<div className={`max-w-[75%] px-4 py-2 rounded-2xl flex flex-col gap-1 transition-colors ${isMe ? "bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-br-sm" : "bg-gray-100 dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 rounded-bl-sm"}`}>
										{isTyping ? (
											<span className="text-xs text-gray-400 dark:text-zinc-500 animate-pulse py-0.5">Typing...</span>
										) : (
											<p className="text-[15px] whitespace-pre-wrap break-words">{msg.content}</p>
										)}
										{!isTyping && (
											<div className={`flex items-center justify-end gap-1 ${isMe ? "text-gray-500 dark:text-zinc-400" : "text-gray-400 dark:text-zinc-500"}`}>
												<span className="text-[10px]">{formatTime(msg.created_at)}</span>
											</div>
										)}
									</div>
								</div>
							</div>
						);
					})
				)}
				<div ref={messagesEndRef} />
			</div>

			<div className="flex-none bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 p-3 flex gap-2 pb-safe pb-[max(12px,env(safe-area-inset-bottom))] transition-colors">
				<input
					type="text"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Type a message..."
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
