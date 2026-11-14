"use client";

import { useEffect, useRef, createContext, useContext, useState } from "react";

type WebSocketContextType = {
	onlineUsers: string[];
};

const WebSocketContext = createContext<WebSocketContextType>({ onlineUsers: [] });

export const useWebSocket = () => useContext(WebSocketContext);

export default function WebSocketProvider({ children }: { children: React.ReactNode }) {
	const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
	const wsRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		const session = localStorage.getItem("session");
		if (!session) return;

		let currentUserId = "";
		try {
			const payload = JSON.parse(atob(session.split(".")[1]));
			currentUserId = payload.properties?.id || payload.sub;
		} catch {}

		const fetchOnlineUsers = async () => {
			try {
				const res = await fetch("https://auth.readtalk.workers.dev/users/online");
				const data = (await res.json()) as { success: boolean; onlineUsers: string[] };
				if (data.success) setOnlineUsers(data.onlineUsers);
			} catch (error) {
				console.error(error);
			}
		};

		fetchOnlineUsers();

		const wsUrl = `wss://auth.readtalk.workers.dev/ws?token=${session}`;
		const ws = new WebSocket(wsUrl);
		wsRef.current = ws;

		ws.onopen = () => {
			setOnlineUsers((prev) => {
				if (!prev.includes(currentUserId)) {
					return [...prev, currentUserId];
				}
				return prev;
			});
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.type === "USER_CONNECTED") {
					setOnlineUsers((prev) => {
						if (!prev.includes(data.userId)) return [...prev, data.userId];
						return prev;
					});
				} else if (data.type === "USER_DISCONNECTED") {
					setOnlineUsers((prev) => prev.filter(id => id !== data.userId));
				}
			} catch (err) {
				console.error("WS Error:", err);
			}
		};

		return () => {
			if (wsRef.current) {
				wsRef.current.close();
				wsRef.current = null;
			}
		};
	}, []);

	return (
		<WebSocketContext.Provider value={{ onlineUsers }}>
			{children}
		</WebSocketContext.Provider>
	);
}
