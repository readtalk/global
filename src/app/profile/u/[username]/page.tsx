//
"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { timeAgo } from "@/lib/timer";
import { 
	FacebookLogo, InstagramLogo, XLogo, TiktokLogo, 
	YoutubeLogo, LinkedinLogo, Globe 
} from "@phosphor-icons/react/dist/ssr";
import ShareButton from "@/components/ShareButton";
import CopyUsername from "@/components/CopyUsername";
import LikeRepost from "@/components/LikeRepost";

type User = { 
	id: string; 
	username: string; 
	yourname: string; 
	avatar: string | null; 
	header: string | null; 
	headline: string | null; 
	about: string | null; 
	socials: string | null; 
	location: string | null; 
	created_at: string; 
	follow_status?: "none" | "following" | "followers" | "mutual";
};
type Update = { id: string; user_id: string; content: string; image_url: string | null; created_at: number; reposter_id?: string | null; type?: string; author_username?: string; author_yourname?: string; author_avatar?: string | null; like_count?: number; comment_count?: number; repost_count?: number; is_liked?: boolean; is_reposted?: boolean; };

function ProfileContent() {
	const params = useParams();
	const username = params.username as string;
	const [user, setUser] = useState<User | null>(null);
	const [updates, setUpdates] = useState<Update[]>([]);
	const [activeTab, setActiveTab] = useState<"all" | "post" | "repost">("all");
	const [isLoading, setIsLoading] = useState(true);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);

	const fetchData = async () => {
		try {
			const token = localStorage.getItem("session");
			const res = await fetch(`/api/profile/${username}`, { headers: token ? { "Authorization": `Bearer ${token}` } : {} });
			const data = (await res.json()) as { success: boolean; user: User; updates: Update[]; };
			if (data.success) { setUser(data.user); setUpdates(data.updates || []); }
		} catch (error) { console.error(error); } finally { setIsLoading(false); }
	};

	useEffect(() => {
		fetchData();
		const session = localStorage.getItem("session");
		if (session) {
			try {
				const payload = JSON.parse(atob(session.split(".")[1]));
				const id = payload.properties?.id || payload.sub;
				if (id) setCurrentUserId(id);
			} catch {}
		}
	}, [username]);

	const handleFollowToggle = async () => {
		const token = localStorage.getItem("session");
		if (!token) return alert("You must be logged in.");
		
		try {
			const res = await fetch(`/api/profile/${username}/follow`, {
				method: "POST",
				headers: { "Authorization": `Bearer ${token}` }
			});
			const data = (await res.json()) as { success: boolean };
			if (data.success) {
				fetchData();
			}
		} catch (error) {
			console.error(error);
		}
	};

	if (isLoading) return <div className="w-full h-full flex justify-center items-center"><p className="text-gray-500">Loading profile...</p></div>;
	if (!user) return <div className="w-full h-full flex justify-center items-center"><p className="text-gray-500">User not found.</p></div>;

	let socials: Record<string, string> = {};
	if (user.socials) { try { let parsed = JSON.parse(user.socials); if (typeof parsed === "string") parsed = JSON.parse(parsed); if (typeof parsed === "object" && parsed !== null) socials = parsed; } catch {} }

	const targetUserId = String(user.id).trim();
	const posts = updates.filter(u => String(u.user_id).trim() === targetUserId && !u.reposter_id);
	const reposts = updates.filter(u => String(u.reposter_id).trim() === targetUserId);
	const displayUpdates = activeTab === "all" ? updates : activeTab === "post" ? posts : reposts;

	return (
		<div className="flex-1 overflow-y-auto min-h-0 pb-16 md:pb-0">
			<div className="max-w-2xl mx-auto bg-white shadow-sm rounded-b-xl overflow-hidden my-4 md:my-8">
				<div className="h-40 w-full bg-gray-300 relative">{user.header && <img src={user.header} alt="Header" className="w-full h-full object-cover" />}</div>
				<div className="px-6 relative pb-6">
					<div className="absolute -top-12 left-6 z-10 w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white overflow-hidden shadow-sm">
						{user.avatar ? <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" /> : user.username?.[0]?.toUpperCase()}
					</div>
					<div className="pt-14 flex justify-between items-start">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">{user.yourname || user.username}</h1>
							<div className="flex items-center gap-1 mt-1"><p className="text-gray-500 text-sm">@{user.username}</p><CopyUsername username={user.username} /></div>
						</div>
						<div className="flex gap-2">
							{user.id !== currentUserId && (
								<>
									{user.follow_status === "none" && (
										<button onClick={handleFollowToggle} className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold">Follow</button>
									)}
									{user.follow_status === "following" && (
										<button onClick={handleFollowToggle} className="bg-gray-200 text-gray-800 px-4 py-1.5 rounded-full text-xs font-semibold">Following</button>
									)}
									{user.follow_status === "followers" && (
										<button onClick={handleFollowToggle} className="bg-gray-200 text-gray-800 px-4 py-1.5 rounded-full text-xs font-semibold">Follow Back</button>
									)}
									{user.follow_status === "mutual" && (
										<>
											<button onClick={handleFollowToggle} className="bg-gray-200 text-gray-800 px-4 py-1.5 rounded-full text-xs font-semibold">Following</button>
											<button className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold">Chat</button>
											<button className="bg-green-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold">Call</button>
										</>
									)}
								</>
							)}
							<Link href="/settings" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold transition">Settings</Link>
							<ShareButton username={user.username} />
						</div>
					</div>
					{user.headline && <p className="mt-2 text-gray-800 font-medium">{user.headline}</p>}
					{user.about && <p className="mt-2 text-gray-600 text-sm whitespace-pre-wrap">{user.about}</p>}
					<div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
						{user.location && <span className="flex items-center gap-1">📍 {user.location}</span>}
						<span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
					</div>
					{Object.keys(socials).length > 0 && (
						<div className="mt-5 flex flex-wrap gap-4">
							{Object.entries(socials).map(([key, url]) => {
								if (!url || typeof url !== "string") return null;
								let Icon = Globe; let colorClass = "text-gray-600";
								switch (key.toLowerCase()) {
									case "facebook": Icon = FacebookLogo; colorClass = "text-blue-600"; break;
									case "instagram": Icon = InstagramLogo; colorClass = "text-pink-600"; break;
									case "x": Icon = XLogo; colorClass = "text-black"; break;
									case "tiktok": Icon = TiktokLogo; colorClass = "text-black"; break;
									case "youtube": Icon = YoutubeLogo; colorClass = "text-red-600"; break;
									case "linkedin": Icon = LinkedinLogo; colorClass = "text-blue-700"; break;
								}
								return <a key={key} href={url} target="_blank" rel="noopener noreferrer" className={`${colorClass} hover:opacity-80 transition-opacity`} title={key}><Icon size={24} weight="fill" /></a>;
							})}
						</div>
					)}
				</div>
				<div className="flex border-t border-gray-200">
					<button onClick={() => setActiveTab("all")} className={`flex-1 py-3 text-sm font-semibold transition ${activeTab === "all" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:bg-gray-50"}`}>All</button>
					<button onClick={() => setActiveTab("post")} className={`flex-1 py-3 text-sm font-semibold transition ${activeTab === "post" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:bg-gray-50"}`}>Post</button>
					<button onClick={() => setActiveTab("repost")} className={`flex-1 py-3 text-sm font-semibold transition ${activeTab === "repost" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:bg-gray-50"}`}>Repost</button>
				</div>
				<div className="divide-y divide-gray-100">
					{displayUpdates.length === 0 ? <p className="text-center text-gray-500 text-sm py-10">Belum ada konten.</p> : displayUpdates.map(update => (
						<div key={`${update.id}-${update.reposter_id || 'original'}`} className="p-4">
							{update.reposter_id && (
								<div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
									<span>Reposted by @{user.username}</span>
								</div>
							)}
							<div className="flex items-center gap-3 mb-2">
								<Link href={`/profile/@${update.author_username || update.user_id}`} className="shrink-0"><div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs overflow-hidden">{update.author_avatar ? <img src={update.author_avatar} className="w-full h-full object-cover" /> : (update.author_username?.[0]?.toUpperCase() || "?")}</div></Link>
								<div>
									<div className="flex items-center gap-2">
										<Link href={`/profile/@${update.author_username || update.user_id}`} className="text-gray-900 font-semibold text-sm hover:underline">{update.author_yourname || update.author_username || "Unknown User"}</Link>
										{update.created_at && (<><span className="text-gray-400 text-xs">·</span><span className="text-gray-500 text-xs">{timeAgo(update.created_at)}</span></>)}
									</div>
									<p className="text-gray-500 text-xs">@{update.author_username || update.user_id.substring(0, 8)}</p>
								</div>
							</div>
							<Link href={`/update/${update.id}`} className="block"><p className="text-gray-800 text-sm">{update.content}</p>{update.image_url && <img src={update.image_url} alt="Post" className="mt-2 rounded-lg max-h-60 object-cover" />}</Link>
							<div className="mt-3 flex items-center gap-6 text-gray-500 text-sm">
								<Link href={`/update/${update.id}`} className="flex items-center gap-1 hover:text-blue-500 transition"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>{update.comment_count || 0}</Link>
								<LikeRepost
									id={update.id}
									like_count={update.like_count}
									repost_count={update.repost_count}
									is_liked={update.is_liked}
									is_reposted={update.is_reposted}
									onUpdate={fetchData}
								/>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default function ProfilePage() {
	return <Suspense fallback={<div className="p-4 text-center">Loading...</div>}><ProfileContent /></Suspense>;
}
