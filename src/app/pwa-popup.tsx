"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type UserProfile = {
	username: string | null;
	yourname: string | null;
	date_of_birth: string | null;
	avatar: string | null;
	header: string | null;
	headline: string | null;
	about: string | null;
	socials: string | null;
	location: string | null;
};

export default function PwaPopup() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [isStandalone, setIsStandalone] = useState<boolean | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
	const [isVisible, setIsVisible] = useState(false);
	
	const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(false);
	
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [isProfileLoading, setIsProfileLoading] = useState(false);
	
	const [formUsername, setFormUsername] = useState("");
	const [formYourname, setFormYourname] = useState("");
	const [formDob, setFormDob] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (pathname.startsWith("/@") || pathname.startsWith("/u/") || pathname === "/callback") {
			setIsVisible(false);
			return;
		}

		const checkStandalone =
			window.matchMedia("(display-mode: standalone)").matches ||
			(window.navigator as unknown as { standalone?: boolean }).standalone === true;

		setIsStandalone(checkStandalone);
		
		const hasTokenInUrl = searchParams.get("token");
		const session = localStorage.getItem("session");
		
		if (hasTokenInUrl || session) {
			setIsLoggedIn(true);
			setIsVisible(true);
			return; 
		}

		setIsLoggedIn(false);
		setIsVisible(true);

		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e);
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
	}, [pathname, searchParams]);

	useEffect(() => {
		if (isLoggedIn) {
			const session = localStorage.getItem("session");
			if (session) {
				setIsProfileLoading(true);
				fetch("https://auth.readtalk.workers.dev/settings", {
					headers: { "Authorization": `Bearer ${session}` }
				})
				.then(res => res.json() as Promise<{ success: boolean; user?: UserProfile }>)
				.then(data => {
					if (data.success && data.user) {
						setProfile(data.user);
						setFormUsername(data.user.username || "");
						setFormYourname(data.user.yourname || "");
						setFormDob(data.user.date_of_birth || "");
					}
				})
				.catch(() => {})
				.finally(() => setIsProfileLoading(false));
			}
		}
	}, [isLoggedIn]);

	const handleInstallClick = async () => {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === "accepted") {
			setDeferredPrompt(null);
		}
	};

	const handleLoginClick = () => {
		setIsLoading(true);
		setTimeout(() => {
			window.location.href = "/api/auth/login";
		}, 800);
	};

	const handleSaveProfile = async () => {
		if (!formUsername.trim() || !formYourname.trim() || !formDob) return;
		const session = localStorage.getItem("session");
		if (!session) return;

		setIsSaving(true);
		try {
			const res = await fetch("https://auth.readtalk.workers.dev/settings", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${session}`
				},
				body: JSON.stringify({
					username: formUsername,
					yourname: formYourname,
					date_of_birth: formDob,
					avatar: profile?.avatar || null,
					header: profile?.header || null,
					headline: profile?.headline || null,
					about: profile?.about || null,
					socials: profile?.socials || null,
					location: profile?.location || null,
				}),
			});
			
			if (res.ok) {
				window.location.reload();
			} else {
				alert("Failed to save profile.");
			}
		} catch (error) {
			console.error(error);
			alert("Error saving profile.");
		} finally {
			setIsSaving(false);
		}
	};

	if (!isVisible || isStandalone === null || isLoggedIn === null) return null;

	if (isLoading) {
		return (
			<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
				<svg className="animate-spin h-10 w-10 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
					<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
			</div>
		);
	}

	if (isLoggedIn) {
		if (isProfileLoading) {
			return (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
					<svg className="animate-spin h-10 w-10 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
				</div>
			);
		}

		if (profile && (!profile.username || !profile.yourname || !profile.date_of_birth)) {
			return (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
					<div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-zinc-900">
						<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
							Complete Your Profile
						</h2>
						<p className="text-xs text-gray-500 mb-6">
							Please fill in your details to continue.
						</p>

						<div className="flex flex-col gap-4 text-left">
							<div>
								<label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Username</label>
								<input
									type="text"
									value={formUsername}
									onChange={(e) => setFormUsername(e.target.value)}
									placeholder="e.g. johndoe"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-gray-900"
								/>
							</div>
							<div>
								<label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
								<input
									type="text"
									value={formYourname}
									onChange={(e) => setFormYourname(e.target.value)}
									placeholder="e.g. John Doe"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-gray-900"
								/>
							</div>
							<div>
								<label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
								<input
									type="date"
									value={formDob}
									onChange={(e) => setFormDob(e.target.value)}
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-gray-900"
								/>
							</div>
						</div>

						<button
							onClick={handleSaveProfile}
							disabled={isSaving || !formUsername.trim() || !formYourname.trim() || !formDob}
							className="mt-6 w-full rounded-xl bg-black px-4 py-3 text-lg font-bold text-white transition hover:bg-gray-800 disabled:opacity-50"
						>
							{isSaving ? "Saving..." : "Continue"}
						</button>
					</div>
				</div>
			);
		}

		return null;
	}

	if (!isStandalone) {
		return (
			<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
				<div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-zinc-900">
					<button
						onClick={handleInstallClick}
						disabled={!deferredPrompt}
						className="w-full rounded-xl bg-black px-4 py-3 text-lg font-bold tracking-wider text-white transition hover:bg-gray-800 disabled:opacity-50"
					>
						INSTALL
					</button>

					<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
						Progressive Web App
					</p>

					<div className="mt-6 flex items-center justify-center gap-6 text-gray-700 dark:text-gray-300">
						<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
							<path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0004.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1367 1.0493L4.841 5.3978a.416.416 0 00-.5677-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3435-4.1021-2.6891-7.5743-6.1185-9.4396"/>
						</svg>
						
						<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
							<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
						</svg>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-zinc-900">
				<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
					Welcome to READTalk
				</h2>

				<button
					onClick={handleLoginClick}
					disabled={isLoading}
					className="w-full flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-lg font-bold text-white transition hover:bg-gray-800 disabled:opacity-70"
				>
					Agree and continue
				</button>

				<p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
					By continuing, you agree to our{" "}
					<a href="https://readtalk.pages.dev/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-800 dark:hover:text-gray-200">
						Terms & Conditions
					</a>
				</p>
			</div>
		</div>
	);
}
