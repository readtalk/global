"use client";

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PwaPopup from "./pwa-popup";
import { Suspense, useEffect, useRef, createContext, useContext, useState } from "react";
import Script from "next/script";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "READTalk",
	description: "READTalk Global App",
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		title: "READTalk",
		statusBarStyle: "default",
	},
};

export const viewport: Viewport = {
	themeColor: "#ffffff",
};

type WebSocketContextType = {
	onlineUsers: string[];
};

const WebSocketContext = createContext<WebSocketContextType>({ onlineUsers: [] });

export const useWebSocket = () => useContext(WebSocketContext);

function WebSocketProvider({ children }: { children: React.ReactNode }) {
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

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<Script id="google-tag-manager" strategy="afterInteractive">
					{`
						(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
						new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
						j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
						'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
						})(window,document,'script','dataLayer','GTM-NZBG294V');
					`}
				</Script>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
				<noscript>
					<iframe
						src="https://www.googletagmanager.com/ns.html?id=GTM-NZBG294V"
						height="0"
						width="0"
						style={{ display: "none", visibility: "hidden" }}
					></iframe>
				</noscript>

				<WebSocketProvider>
					<div className="flex h-[100dvh] w-full overflow-hidden">
						<Sidebar />
						<main className="flex-1 min-w-0 min-h-0 overflow-hidden flex flex-col bg-white">
							{children}
						</main>
					</div>
				</WebSocketProvider>

				<Suspense fallback={null}>
					<PwaPopup />
				</Suspense>
				<script
					dangerouslySetInnerHTML={{
						__html: `
							if ("serviceWorker" in navigator) {
								navigator.serviceWorker.register("/sw.js").then(function(reg) {
									console.log("SW Registered", reg.scope);
								}).catch(function(err) {
									console.log("SW Error", err);
								});
							}
						`,
					}}
				/>
			</body>
		</html>
	);
}
