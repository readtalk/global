import { 
	FacebookLogo, 
	InstagramLogo, 
	XLogo, 
	TiktokLogo, 
	YoutubeLogo, 
	LinkedinLogo, 
	Globe 
} from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

type User = {
	id: string;
	email: string;
	username: string;
	yourname: string;
	date_of_birth: string;
	created_at: string;
	avatar: string | null;
	header: string | null;
	headline: string | null;
	about: string | null;
	socials: string | null;
	location: string | null;
};

async function getUserByUsername(username: string): Promise<User | null> {
	try {
		const res = await fetch(`https://auth.readtalk.workers.dev/users/${username}`, {
			cache: "no-store",
		});
		const data = (await res.json()) as { success: boolean; user: User };
		
		if (data.success && data.user) {
			return data.user;
		}
		return null;
	} catch (error) {
		console.error("Failed to fetch user:", error);
		return null;
	}
}

export default async function PublicProfile({
	params,
}: {
	params: Promise<{ username: string }>;
}) {
	const { username } = await params;
	const user = await getUserByUsername(username);

	if (!user) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center p-4">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-white">User Not Found</h1>
					<p className="text-gray-500 text-sm mt-2">@{username} does not exist.</p>
				</div>
			</div>
		);
	}

	let socials: Record<string, string> = {};
	if (user.socials && typeof user.socials === "string") {
		try {
			let parsed = JSON.parse(user.socials);
			if (typeof parsed === "string") {
				parsed = JSON.parse(parsed);
			}
			if (typeof parsed === "object" && parsed !== null) {
				socials = parsed;
			}
		} catch {
			socials = {};
		}
	}

	const socialList = Object.entries(socials).filter(([_, url]) => url && typeof url === "string");

	return (
		<div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
			<div className="w-full max-w-md flex flex-col items-center text-center">
				
				<div className="w-28 h-28 rounded-full overflow-hidden border-2 border-zinc-800 shadow-2xl mb-4">
					{user.avatar ? (
						<img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
					) : (
						<div className="w-full h-full bg-zinc-800 flex items-center justify-center text-3xl font-bold text-zinc-400">
							{user.username?.[0]?.toUpperCase() ?? "?"}
						</div>
					)}
				</div>

				<h1 className="text-2xl font-bold tracking-tight">{user.yourname || user.username}</h1>
				<p className="text-zinc-500 text-sm mt-1">@{user.username}</p>

				{user.headline && (
					<p className="mt-4 text-zinc-300 text-sm font-medium px-4">{user.headline}</p>
				)}
				{user.about && (
					<p className="mt-2 text-zinc-400 text-xs px-6 whitespace-pre-wrap">{user.about}</p>
				)}

				{user.location && (
					<div className="mt-4 flex items-center gap-1 text-zinc-500 text-xs">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
						<span>{user.location}</span>
					</div>
				)}

				<div className="w-full mt-8 space-y-3">
					{socialList.map(([key, url]) => {
						let Icon = Globe;
						let label = key.charAt(0).toUpperCase() + key.slice(1);
						let bgClass = "bg-zinc-900 hover:bg-zinc-800 border-zinc-800";
						
						switch (key.toLowerCase()) {
							case "facebook": Icon = FacebookLogo; bgClass = "bg-[#1877F2] hover:bg-[#166fe5] border-[#1877F2]"; break;
							case "instagram": Icon = InstagramLogo; bgClass = "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90 border-transparent"; break;
							case "x": Icon = XLogo; bgClass = "bg-black hover:bg-zinc-900 border-zinc-700"; break;
							case "tiktok": Icon = TiktokLogo; bgClass = "bg-black hover:bg-zinc-900 border-zinc-700"; break;
							case "youtube": Icon = YoutubeLogo; bgClass = "bg-[#FF0000] hover:bg-[#cc0000] border-[#FF0000]"; break;
							case "linkedin": Icon = LinkedinLogo; bgClass = "bg-[#0A66C2] hover:bg-[#0958a8] border-[#0A66C2]"; break;
							case "website": label = "Website"; bgClass = "bg-zinc-900 hover:bg-zinc-800 border-zinc-800"; break;
						}

						return (
							<a
								key={key}
								href={url}
								target="_blank"
								rel="noopener noreferrer"
								className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border text-sm font-semibold transition-all active:scale-[0.98] ${bgClass}`}
							>
								<Icon size={20} weight="fill" />
								<span>{label}</span>
							</a>
						);
					})}
				</div>

				<div className="mt-10 mb-4 text-zinc-600 text-[10px] uppercase tracking-widest">
					Powered by READTalk
				</div>

			</div>
		</div>
	);
}
