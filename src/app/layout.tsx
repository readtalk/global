import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PwaPopup from "./pwa-popup";
import { Suspense } from "react";
import Script from "next/script";

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

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<Script
					src="https://www.googletagmanager.com/gtag/js?id=G-WND3L6KZHO"
					strategy="afterInteractive"
				/>
				<Script id="google-analytics" strategy="afterInteractive">
					{`
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('js', new Date());
						gtag('config', 'G-WND3L6KZHO');
					`}
				</Script>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
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
