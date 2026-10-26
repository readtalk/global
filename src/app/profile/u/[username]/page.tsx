"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { 
	FacebookLogo, InstagramLogo, XLogo, TiktokLogo, 
	YoutubeLogo, LinkedinLogo, Globe 
} from "@phosphor-icons/react/dist/ssr";
import ShareButton from "@/components/ShareButton";
import CopyUsername from "@/components/CopyUsername";

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
};

type Post = {
	id: string;
	user_id: string;
	content: string;
	image_url: string | null;
	created_at: number;
	reposter_id?: string | null;
	user?: User;
};

function ProfileContent() {
	const params = useParams();
	const username = params.username as string;

	const [user, setUser] = useState<User | null>(null);
	const [updates, setUpdates] = useState<Post[]>([]);
	const [activeTab, setActiveTab] = useState<"all" | "post" | "repost">("all");
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				const token = localStorage.getItem("session");
				const res = await fetch(`/api/profile/${username}`, {
					headers: token ? { "Authorization": `Bearer ${token}` } : {},
				});
				const data = (await res.json()) as { 
					success: boolean; 
					user: User; 
					updates: Post[]; 
				};
				if (data.success) {
					setUser(data.user);
					setUpdates(data.updates || []);
				}
			} catch (error) {
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		}
		fetchData();
	}, [username]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen bg-gray-50">
				<Sidebar />
				<div className="flex-1 flex justify-center items-center pb-20">
					<p className="text-gray-500">Loading profile...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex min-h-screen bg-gray-50">
				<Sidebar />
				<div className="flex-1 flex justify-center items-center pb-20">
					<p className="text-gray-500">User not found.</p>
				</div>
			</div>
		);
	}

	let socials: Record<string, string> = {};
	if (user.socials) {
		try {
			let parsed = JSON.parse(user.socials);
			if (typeof parsed === "string") parsed = JSON.parse(parsed);
			if (typeof parsed === "object" && parsed !== null) socials = parsed;
		} catch {}
	}

	const targetUserId = String(user.id).trim();
	
	const posts = updates.filter(u => String(u.user_id).trim() === targetUserId && !u.reposter_id);
	const reposts = updates.filter(u => String(u.reposter_id).trim() === targetUserId);
	
	const displayPosts = activeTab === "post" ? posts : activeTab === "all" ? updates : reposts;

	return (
		<div className="flex min-h-screen bg-gray-50">
			<Sidebar />
			<div className="flex-1 w-full pb-20 md:pb-0" id="main-content" role="main">
				<div className="max-w-2xl mx-auto bg-white shadow-sm rounded-b-xl overflow-hidden my-4 md:my-8">
					<div className="h-40 w-full bg-gray-300 relative">
						{user.header && <img src={user.header} alt="Header" className="w-full h-full object-cover" />}
					</div>

					<div className="px-6 relative pb-6">
						<div className="absolute -top-12 left-6 z-10 w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white overflow-hidden shadow-sm">
							{user.avatar ? <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" /> : user.username?.[0]?.toUpperCase()}
						</div>

						<div className="pt-14 flex justify-between items-start">
							<div>
								<h1 className="text-2xl font-bold text-gray-900">{user.yourname || user.username}</h1>
								<div className="flex items-center gap-1 mt-1">
									<p className="text-gray-500 text-sm">@{user.username}</p>
									<CopyUsername username={user.username} />
								</div>
							</div>
							<div className="flex gap-2">
								<Link href="/settings" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold transition">
									Settings
								</Link>
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
									let Icon = Globe;
									let colorClass = "text-gray-600";
									switch (key.toLowerCase()) {
										case "facebook": Icon = FacebookLogo; colorClass = "text-blue-600"; break;
										case "instagram": Icon = InstagramLogo; colorClass = "text-pink-600"; break;
										case "x": Icon = XLogo; colorClass = "text-black"; break;
										case "tiktok": Icon = TiktokLogo; colorClass = "text-black"; break;
										case "youtube": Icon = YoutubeLogo; colorClass = "text-red-600"; break;
										case "linkedin": Icon = LinkedinLogo; colorClass = "text-blue-700"; break;
									}
									return (
										<a key={key} href={url} target="_blank" rel="noopener noreferrer" className={`${colorClass} hover:opacity-80 transition-opacity`} title={key}>
											<Icon size={24} weight="fill" />
										</a>
									);
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
						{displayPosts.length === 0 ? (
							<p className="text-center text-gray-500 text-sm py-10">Belum ada konten.</p>
						) : (
							displayPosts.map(post => (
								<div key={`${post.id}-${post.reposter_id || 'original'}`} className="p-4">
									{post.reposter_id && (
										<div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
											<span>Reposted by @{user.username}</span>
										</div>
									)}
									<div className="flex items-center gap-3 mb-2">
										<Link href={`/profile/@${post.user_id}`} className="shrink-0">
											<div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs overflow-hidden">
												{post.user?.username?.[0]?.toUpperCase() || "?"}
											</div>
										</Link>
										<div>
											<Link href={`/profile/@${post.user_id}`} className="text-gray-900 font-semibold text-sm hover:underline">{post.user?.yourname || post.user_id}</Link>
											<p className="text-gray-500 text-xs">@{post.user?.username || post.user_id.substring(0, 8)}</p>
										</div>
									</div>
									<Link href={`/update/${post.id}`} className="block">
										<p className="text-gray-800 text-sm">{post.content}</p>
										{post.image_url && <img src={post.image_url} alt="Post" className="mt-2 rounded-lg max-h-60 object-cover" />}
									</Link>
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default function ProfilePage() {
	return (
		<Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
			<ProfileContent />
		</Suspense>
	);
}
