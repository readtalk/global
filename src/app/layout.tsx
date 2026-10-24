import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PwaPopup from "./pwa-popup";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "ReadTalk",
	description: "ReadTalk Global App",
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		title: "ReadTalk",
		statusBarStyle: "default",
	},
};

export const viewport: Viewport = {
	themeColor: "#ffffff",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
				<PwaPopup />
				<script
					dangerouslySetInnerHTML={{
						__html: `
							if ("serviceWorker" in navigator) {
								window.addEventListener("load", function() {
									navigator.serviceWorker.register("/sw.js");
								});
							}
						`,
					}}
				/>
			</body>
		</html>
	);
}
