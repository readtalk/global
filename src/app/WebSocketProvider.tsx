"use client";

import { useEffect, useRef, createContext, useContext, useState } from "react";

type Message = {
	id: string;
	chat_id: string;
	user_id: string;
	content: string;
	assets: string;
	created_at: number;
};

type WebSocketContextType = {
	onlineUsers: string[];
	isWsReady: boolean;
	lastMessage: { chatId: string; message: Message } | null;
};

const WebSocketContext = createContext<WebSocketContextType>({ onlineUsers: [], isWsReady: false, lastMessage: null });

export const useWebSocket = () => useContext(WebSocketContext);

export default function WebSocketProvider({ children }: { children: React.ReactNode }) {
	const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
	const [isWsReady, setIsWsReady] = useState(false);
	const [lastMessage, setLastMessage] = useState<{ chatId: string; message: Message } | null>(null);
	const wsRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		let isMounted = true;

		const connect = () => {
			const session = localStorage.getItem("session");
			if (!session) return;

			if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

			let currentUserId = "";
			try {
				const payload = JSON.parse(atob(session.split(".")[1]));
				currentUserId = payload.properties?.id || payload.sub;
			} catch {}

			setIsWsReady(false);

			const fetchOnlineUsers = async () => {
				try {
					const res = await fetch("https://auth.readtalk.workers.dev/users/online");
					const data = (await res.json()) as { success: boolean; onlineUsers: string[] };
					if (data.success && isMounted) {
						setOnlineUsers(prev => {
							const merged = new Set([...prev, ...data.onlineUsers, currentUserId]);
							return Array.from(merged).filter(Boolean);
						});
					}
				} catch (error) {
					console.error(error);
				}
			};

			const wsUrl = `wss://auth.readtalk.workers.dev/ws?token=${session}`;
			const ws = new WebSocket(wsUrl);
			wsRef.current = ws;

			ws.onopen = async () => {
				if (!isMounted) return;
				setOnlineUsers((prev) => {
					if (!prev.includes(currentUserId)) {
						return [...prev, currentUserId];
					}
					return prev;
				});
				await fetchOnlineUsers();
				if (isMounted) setIsWsReady(true);
			};

			ws.onmessage = (event) => {
				if (!isMounted) return;
				try {
					const data = JSON.parse(event.data);
					if (data.type === "USER_CONNECTED") {
						setOnlineUsers((prev) => {
							if (!prev.includes(data.userId)) return [...prev, data.userId];
							return prev;
						});
					} else if (data.type === "USER_DISCONNECTED") {
						setOnlineUsers((prev) => prev.filter(id => id !== data.userId));
					} else if (data.type === "NEW_MESSAGE") {
						setLastMessage({ chatId: data.chatId, message: data.message });
						
						const audio = new Audio('/notification/all-eyes-on-me-465.mp3');
						audio.play().catch(() => {});
						
						if (navigator.vibrate) {
							navigator.vibrate([200, 100, 200]);
						}
					}
				} catch (err) {
					console.error("WS Error:", err);
				}
			};
		};

		connect();

		const handleSessionChanged = () => {
			connect();
		};

		window.addEventListener("session-changed", handleSessionChanged);

		return () => {
			isMounted = false;
			window.removeEventListener("session-changed", handleSessionChanged);
			if (wsRef.current) {
				wsRef.current.close();
				wsRef.current = null;
			}
		};
	}, []);

	return (
		<WebSocketContext.Provider value={{ onlineUsers, isWsReady, lastMessage }}>
			{children}
		</WebSocketContext.Provider>
	);
}
