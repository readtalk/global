import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PwaPopup from "./pwa-popup";
import { Suspense } from "react";
import Script from "next/script";
import Sidebar from "@/components/Sidebar";
import WebSocketProvider from "./WebSocketProvider";
import { LanguageProvider } from "@/context/LanguageContext";

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
	description: "READTalk Messenger",
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		title: "READTalk",
		statusBarStyle: "black-translucent",
	},
};

export const viewport: Viewport = {
	viewportFit: "cover",
	themeColor: "#09090b",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta name="theme-color" content="#09090b" id="theme-color-meta" />
				<Script id="theme-init" strategy="beforeInteractive">
					{`
						(function() {
							try {
								var theme = localStorage.getItem('theme');
								var font = localStorage.getItem('fontSize');
								var meta = document.getElementById('theme-color-meta');
								
								if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
									document.documentElement.classList.add('dark');
									document.documentElement.style.backgroundColor = '#09090b';
									document.body.style.backgroundColor = '#09090b';
									if (meta) meta.setAttribute('content', '#09090b');
								} else {
									document.documentElement.classList.remove('dark');
									document.documentElement.style.backgroundColor = '#ffffff';
									document.body.style.backgroundColor = '#ffffff';
									if (meta) meta.setAttribute('content', '#ffffff');
								}

								if (font === 'small') document.documentElement.classList.add('text-small');
								else if (font === 'large') document.documentElement.classList.add('text-large');
								else document.documentElement.classList.add('text-medium');
							} catch (e) {}
						})();
					`}
				</Script>
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
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-50`}>
				<noscript>
					<iframe
						src="https://www.googletagmanager.com/ns.html?id=GTM-NZBG294V"
						height="0"
						width="0"
						style={{ display: "none", visibility: "hidden" }}
					></iframe>
				</noscript>

				<LanguageProvider>
					<WebSocketProvider>
						<div className="flex h-[100dvh] w-full overflow-hidden bg-white dark:bg-zinc-950">
							<Sidebar />
							<main className="flex-1 min-w-0 min-h-0 overflow-hidden flex bg-white dark:bg-zinc-950 transition-colors">
								<div className="w-full md:w-[35vw] md:min-w-[35vw] md:max-w-[35vw] md:border-r border-gray-200 dark:border-zinc-800 h-full flex flex-col bg-white dark:bg-zinc-950">
									{children}
								</div>
								<div id="desktop-popup-panel" className="hidden md:flex flex-1 h-full bg-white dark:bg-zinc-950 border-l border-gray-200 dark:border-zinc-800 transition-colors" />
							</main>
						</div>
					</WebSocketProvider>
				</LanguageProvider>

				<Suspense fallback={<div className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 transition-colors" />}>
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
