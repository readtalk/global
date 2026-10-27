//
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PwaPopup from "./pwa-popup";
import { Suspense } from "react";
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
				
				<div className="flex h-screen overflow-hidden">
					<Sidebar />
					<main className="flex-1 h-full overflow-hidden pb-16 md:pb-0">
						{children}
					</main>
				</div>

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
