"use client";

import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import Search from "@/components/Search";
import Updatelist, { UpdatelistItem } from "@/components/Updatelist";

type CurrentUser = { username: string; yourname: string; avatar: string | null; };

function ForumContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const fileInputRef = useRef<HTMLInputElement>(null);
	
	const [content, setContent] = useState("");
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [updates, setUpdates] = useState<UpdatelistItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isPosting, setIsPosting] = useState(false);
	const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
	const [uploadingFile, setUploadingFile] = useState<string | null>(null);

	useEffect(() => {
		const token = searchParams.get("token");
		if (token) {
			localStorage.setItem("session", token);
			router.replace("/");
		}
	}, [searchParams, router]);

	const fetchData = useCallback(async (showLoading = true) => {
		if (showLoading) setIsLoading(true);
		try {
			const token = localStorage.getItem("session");
			const res = await fetch("/api/updates", {
				headers: token ? { "Authorization": `Bearer ${token}` } : {},
			});
			const data = (await res.json()) as { success: boolean; updates: UpdatelistItem[] };
			if (data.success) setUpdates(data.updates);
		} catch (error) {
			console.error(error);
		} finally {
			if (showLoading) setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
		const session = localStorage.getItem("session");
		if (session) {
			fetch("https://auth.readtalk.workers.dev/settings", { headers: { "Authorization": `Bearer ${session}` } })
			.then(res => res.json() as Promise<{ success: boolean; user?: CurrentUser }>)
			.then(data => { if (data.success && data.user) setCurrentUser(data.user); })
			.catch(() => {});
		}
	}, [fetchData]);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploadingFile(file.name);
		try {
			const folder = file.type.startsWith("video/") ? "video" : "image";
			const newBlob = await upload(`${folder}/${file.name}`, file, {
				access: 'public',
				handleUploadUrl: 'https://upload-readtalk.vercel.app/api/upload',
			});
			setImageUrl(newBlob.url);
		} catch (error) {
			alert("Upload failed.");
		} finally {
			setUploadingFile(null);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const handlePost = async () => {
		if (!content.trim() && !imageUrl) return;
		const token = localStorage.getItem("session");
		if (!token) return alert("You must be logged in.");

		const tempUser = currentUser ? { username: currentUser.username, yourname: currentUser.yourname } : { username: "You", yourname: "You" };
		
		const newPost: UpdatelistItem = {
			id: crypto.randomUUID(), user_id: "temp", content: content, image_url: imageUrl,
			created_at: Math.floor(Date.now() / 1000), like_count: 0, comment_count: 0, repost_count: 0,
			is_liked: false, is_reposted: false, user: tempUser,
		};

		setUpdates((prev) => [newPost, ...prev]);
		setContent("");
		setImageUrl(null);
		setIsPosting(true);

		try {
			await fetch("/api/updates", {
				method: "POST",
				headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
				body: JSON.stringify({ content: content, image_url: imageUrl }),
			});
			
			await fetchData(false);
		} catch (error) { console.error(error); } finally { setIsPosting(false); }
	};

	return (
		<div className="flex-1 overflow-y-auto min-h-0 pb-16 md:pb-0">
			<div className="max-w-2xl mx-auto bg-white min-h-full shadow-sm">
				<div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3">
					<h1 className="text-xl font-bold text-gray-900">Update</h1>
				</div>
				<div className="p-4 border-b border-gray-200"><Search /></div>
				<div className="p-4 border-b border-gray-200 bg-white">
					<div className="flex gap-3">
						<div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
							{currentUser?.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : (currentUser?.username?.[0]?.toUpperCase() || "U")}
						</div>
						<div className="flex-1">
							<textarea className="w-full bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none resize-none text-lg" placeholder="What's happening?" rows={3} value={content} onChange={(e) => setContent(e.target.value)} disabled={isPosting} />
							{imageUrl && (
								<div className="relative mt-2 rounded-xl overflow-hidden border border-gray-200">
									<img src={imageUrl} className="w-full h-auto max-h-64 object-cover" />
									<button onClick={() => setImageUrl(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
								</div>
							)}
							<div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
								<div className="flex items-center gap-2 text-blue-500">
									<input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
									<button onClick={() => fileInputRef.current?.click()} disabled={!!uploadingFile} className="p-2 hover:bg-blue-50 rounded-full transition disabled:opacity-50">
										{uploadingFile ? <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>}
									</button>
								</div>
								<button onClick={handlePost} disabled={isPosting || (!content.trim() && !imageUrl) || !!uploadingFile} className="bg-blue-600 text-white px-5 py-1.5 rounded-full font-bold text-sm hover:bg-blue-700 transition disabled:opacity-50">
									{isPosting ? "Posting..." : "Post"}
								</button>
							</div>
						</div>
					</div>
				</div>
				<div className="bg-white">
					{isLoading ? <div className="p-8 text-center text-gray-500">Loading updates...</div> : updates.length > 0 ? <Updatelist data={updates} onUpdate={() => fetchData(false)} /> : <div className="p-8 text-center text-gray-500">No updates yet. Be the first to post!</div>}
				</div>
			</div>
		</div>
	);
}

export default function ForumPage() {
	return <Suspense fallback={<div className="p-4 text-center">Loading...</div>}><ForumContent /></Suspense>;
}
