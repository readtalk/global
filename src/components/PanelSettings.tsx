"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Camera, UploadSimple } from "@phosphor-icons/react/dist/ssr";
import PanelUpload from "./PanelUpload";

type PanelSettingsProps = {
	type: "account" | "privacy" | "appearance" | "language" | "notifications" | null;
	onClose: () => void;
};

type UserProfile = {
	username: string | null;
	email: string | null;
	yourname: string | null;
	date_of_birth: string | null;
	avatar: string | null;
	header: string | null;
	headline: string | null;
	about: string | null;
	socials: string | null;
	location: string | null;
	created_at: string | null;
	username_updated_at: number | null;
};

export default function PanelSettings({ type, onClose }: PanelSettingsProps) {
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const [formUsername, setFormUsername] = useState("");
	const [formYourname, setFormYourname] = useState("");
	const [formDob, setFormDob] = useState("");
	const [formHeadline, setFormHeadline] = useState("");
	const [formAbout, setFormAbout] = useState("");
	const [formLocation, setFormLocation] = useState("");
	
	const [socialFacebook, setSocialFacebook] = useState("");
	const [socialInstagram, setSocialInstagram] = useState("");
	const [socialX, setSocialX] = useState("");
	const [socialTiktok, setSocialTiktok] = useState("");
	const [socialYoutube, setSocialYoutube] = useState("");
	const [socialLinkedin, setSocialLinkedin] = useState("");

	const [fileToCrop, setFileToCrop] = useState<File | null>(null);
	const [uploadType, setUploadType] = useState<"avatar" | "header" | null>(null);
	const [uploadingFile, setUploadingFile] = useState(false);

	useEffect(() => {
		if (type === "account") {
			const session = localStorage.getItem("session");
			if (session) {
				setIsLoading(true);
				fetch("https://auth.readtalk.workers.dev/settings", {
					headers: { "Authorization": `Bearer ${session}` }
				})
				.then(res => res.json() as Promise<{ success: boolean; user?: UserProfile }>)
				.then(data => {
					if (data.success && data.user) {
						const u = data.user;
						setProfile(u);
						setFormUsername(u.username || "");
						setFormYourname(u.yourname || "");
						setFormDob(u.date_of_birth || "");
						setFormHeadline(u.headline || "");
						setFormAbout(u.about || "");
						setFormLocation(u.location || "");
						
						if (u.socials) {
							try {
								let parsed = JSON.parse(u.socials);
								if (typeof parsed === "string") parsed = JSON.parse(parsed);
								if (typeof parsed === "object" && parsed !== null) {
									setSocialFacebook(parsed.facebook || "");
									setSocialInstagram(parsed.instagram || "");
									setSocialX(parsed.x || "");
									setSocialTiktok(parsed.tiktok || "");
									setSocialYoutube(parsed.youtube || "");
									setSocialLinkedin(parsed.linkedin || "");
								}
							} catch {}
						}
					}
				})
				.catch(() => {})
				.finally(() => setIsLoading(false));
			}
		}
	}, [type]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, uploadTarget: "avatar" | "header") => {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploadType(uploadTarget);
		setFileToCrop(file);
		e.target.value = "";
	};

	const handleCropSave = async (croppedFile: File) => {
		setUploadingFile(true);
		const session = localStorage.getItem("session");
		if (!session) return;

		try {
			const { upload } = await import("@vercel/blob/client");
			const folder = uploadType === "avatar" ? "avatars" : "headers";
			const newBlob = await upload(`${folder}/${croppedFile.name}`, croppedFile, {
				access: 'public',
				handleUploadUrl: 'https://upload-readtalk.vercel.app/api/upload',
			});
			
			setProfile(prev => prev ? { ...prev, [uploadType === "avatar" ? "avatar" : "header"]: newBlob.url } : null);
			setFileToCrop(null);
		} catch (error) {
			alert("Upload failed.");
		} finally {
			setUploadingFile(false);
		}
	};

	const handleSave = async () => {
		if (!formUsername.trim() || !formYourname.trim() || !formDob) return;
		const session = localStorage.getItem("session");
		if (!session) return;

		setIsSaving(true);
		
		const socialsObj = {
			facebook: socialFacebook.trim(),
			instagram: socialInstagram.trim(),
			x: socialX.trim(),
			tiktok: socialTiktok.trim(),
			youtube: socialYoutube.trim(),
			linkedin: socialLinkedin.trim(),
		};
		
		const socialsString = JSON.stringify(socialsObj);
		
		let newUsernameUpdatedAt = profile?.username_updated_at || null;
		if (formUsername !== profile?.username) {
			newUsernameUpdatedAt = Math.floor(Date.now() / 1000);
		}

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
					headline: formHeadline || null,
					about: formAbout || null,
					socials: socialsString,
					location: formLocation || null,
					username_updated_at: newUsernameUpdatedAt,
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

	const getTitle = () => {
		switch (type) {
			case "account": return "Account";
			case "privacy": return "Privacy";
			case "appearance": return "Appearance";
			case "language": return "Language";
			case "notifications": return "Notifications";
			default: return "Settings";
		}
	};

	if (!type) return null;

	const getDaysRemaining = () => {
		if (!profile?.username_updated_at && !profile?.created_at) return 0;
		const baseTime = profile.username_updated_at 
			? profile.username_updated_at * 1000 
			: new Date(profile.created_at!).getTime();
		const diffDays = (Date.now() - baseTime) / (1000 * 60 * 60 * 24);
		return Math.max(0, 60 - diffDays);
	};

	const daysRemaining = getDaysRemaining();
	const canEditUsername = daysRemaining <= 0;

	return (
		<>
			<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity" onClick={onClose} />
			
			<div className="fixed top-0 right-0 h-full w-full md:w-[60vw] bg-white dark:bg-zinc-950 z-50 transform transition-transform duration-300 ease-in-out flex flex-col md:shadow-none shadow-2xl border-l border-gray-200 dark:border-zinc-800">
				<div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-zinc-800">
					<button onClick={onClose} className="md:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
						<ArrowLeft size={20} weight="bold" className="text-gray-600 dark:text-zinc-400" />
					</button>
					<h2 className="text-lg font-bold text-gray-900 dark:text-zinc-50">{getTitle()}</h2>
				</div>
				
				<div className="flex-1 overflow-y-auto p-4">
					{isLoading ? (
						<div className="flex justify-center mt-10">
							<svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
						</div>
					) : (
						<div className="flex flex-col gap-6 max-w-lg mx-auto pb-10">
							{type === "account" && (
								<>
									<div className="flex flex-col gap-4">
										<div className="relative w-full h-32 rounded-xl bg-gray-200 dark:bg-zinc-800 overflow-hidden group">
											{profile?.header ? (
												<img src={profile.header} className="w-full h-full object-cover" />
											) : (
												<div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-zinc-600">No Header</div>
											)}
											<label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
												<UploadSimple size={24} className="text-white" />
												<input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "header")} />
											</label>
										</div>
										
										<div className="flex items-center gap-4 -mt-12 ml-4 z-10">
											<div className="w-20 h-20 rounded-full border-4 border-white dark:border-zinc-950 bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-2xl font-bold overflow-hidden relative group">
												{profile?.avatar ? (
													<img src={profile.avatar} className="w-full h-full object-cover" />
												) : (
													formUsername?.[0]?.toUpperCase()
												)}
												<label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
													<Camera size={20} className="text-white" />
													<input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "avatar")} />
												</label>
											</div>
										</div>
									</div>

									<div className="flex flex-col gap-4 mt-2">
										<div>
											<label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Email</label>
											<input type="email" value={profile?.email || ""} disabled className="w-full mt-1 bg-gray-100 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-500 dark:text-zinc-500 cursor-not-allowed transition-all" />
										</div>
										<div>
											<label className="text-sm font-medium text-gray-700 dark:text-zinc-300 flex justify-between">
												<span>Username</span>
												{!canEditUsername && (
													<span className="text-xs text-red-500 font-normal">
														Can be changed in {Math.ceil(daysRemaining)} days
													</span>
												)}
											</label>
											<input 
												type="text" 
												value={formUsername} 
												onChange={e => setFormUsername(e.target.value)} 
												disabled={!canEditUsername}
												className={`w-full mt-1 border rounded-lg px-3 py-2 transition-all ${canEditUsername ? 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-600' : 'bg-gray-100 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-500 cursor-not-allowed'}`} 
											/>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Your Name</label>
											<input type="text" value={formYourname} onChange={e => setFormYourname(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all" />
										</div>
										<div>
											<label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Date of Birth</label>
											<input type="date" value={formDob} onChange={e => setFormDob(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all" />
										</div>
										<div>
											<label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Headline</label>
											<input type="text" value={formHeadline} onChange={e => setFormHeadline(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all" />
										</div>
										<div>
											<label className="text-sm font-medium text-gray-700 dark:text-zinc-300">About</label>
											<textarea value={formAbout} onChange={e => setFormAbout(e.target.value)} rows={3} className="w-full mt-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all" />
										</div>
										<div>
											<label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Location</label>
											<input type="text" value={formLocation} onChange={e => setFormLocation(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all" />
										</div>
									</div>

									<div className="flex flex-col gap-4 mt-2">
										<h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Social Links</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Facebook Username</label>
												<input type="text" value={socialFacebook} onChange={e => setSocialFacebook(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all text-sm" placeholder="username" />
											</div>
											<div>
												<label className="text-xs font-medium text-gray-700 dark:text-zinc-300">Instagram Username</label>
												<input type="text" value={socialInstagram} onChange={e => setSocialInstagram(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all text-sm" placeholder="username" />
											</div>
											<div>
												<label className="text-xs font-medium text-gray-700 dark:text-zinc-300">X (Twitter) Username</label>
												<input type="text" value={socialX} onChange={e => setSocialX(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all text-sm" placeholder="username" />
											</div>
											<div>
												<label className="text-xs font-medium text-gray-700 dark:text-zinc-300">TikTok Username</label>
												<input type="text" value={socialTiktok} onChange={e => setSocialTiktok(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all text-sm" placeholder="username" />
											</div>
											<div>
												<label className="text-xs font-medium text-gray-700 dark:text-zinc-300">YouTube Username</label>
												<input type="text" value={socialYoutube} onChange={e => setSocialYoutube(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all text-sm" placeholder="username" />
											</div>
											<div>
												<label className="text-xs font-medium text-gray-700 dark:text-zinc-300">LinkedIn Username</label>
												<input type="text" value={socialLinkedin} onChange={e => setSocialLinkedin(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-600 transition-all text-sm" placeholder="username" />
											</div>
										</div>
									</div>

									<button onClick={handleSave} disabled={isSaving || uploadingFile || !canEditUsername} className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-full font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors w-full mt-4 disabled:opacity-50">
										{isSaving ? "Saving..." : "Save Changes"}
									</button>
								</>
							)}
							
							{type === "privacy" && <p className="text-center text-gray-500 dark:text-zinc-400 mt-10">Privacy settings coming soon.</p>}
							{type === "appearance" && <p className="text-center text-gray-500 dark:text-zinc-400 mt-10">Appearance settings coming soon.</p>}
							{type === "language" && <p className="text-center text-gray-500 dark:text-zinc-400 mt-10">Language settings coming soon.</p>}
							{type === "notifications" && <p className="text-center text-gray-500 dark:text-zinc-400 mt-10">Notification settings coming soon.</p>}
						</div>
					)}
				</div>
			</div>

			<PanelUpload 
				file={fileToCrop} 
				onClose={() => setFileToCrop(null)} 
				onSave={handleCropSave} 
			/>
		</>
	);
}
