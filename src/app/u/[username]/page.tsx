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
			<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-800">User Not Found</h1>
					<p className="text-gray-500 text-sm mt-2">@{username} does not exist.</p>
				</div>
			</div>
		);
	}

	// Perbaikan parsing JSON
	let socials: Record<string, string> = {};
	if (user.socials && typeof user.socials === 'string') {
		try {
			const parsed = JSON.parse(user.socials);
			if (typeof parsed === 'object' && parsed !== null) {
				socials = parsed;
			}
		} catch {
			socials = {};
		}
	}

	return (
		<div className="min-h-screen bg-gray-100 flex items-start justify-center">
			<div className="max-w-2xl w-full bg-white shadow-md rounded-b-xl overflow-hidden">
				{/* Header / Banner */}
				<div className="h-40 w-full bg-gray-300 relative">
					{user.header && (
						<img src={user.header} alt="Header" className="w-full h-full object-cover" />
					)}
				</div>

				{/* Profile Info */}
				<div className="px-6 relative pb-6">
					{/* Avatar */}
					<div className="absolute -top-12 left-6 w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white overflow-hidden shadow-sm">
						{user.avatar ? (
							<img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
						) : (
							user.username?.[0]?.toUpperCase() ?? "?"
						)}
					</div>

					{/* Nama & Username (Dikasih padding top biar gak nabrak avatar) */}
					<div className="pt-14 pb-2">
						<h1 className="text-2xl font-bold text-gray-900">{user.yourname || user.username}</h1>
						<p className="text-gray-500 text-sm">@{user.username}</p>
					</div>

					{/* Headline & About */}
					{user.headline && (
						<p className="mt-2 text-gray-800 font-medium">{user.headline}</p>
					)}
					{user.about && (
						<p className="mt-2 text-gray-600 text-sm whitespace-pre-wrap">{user.about}</p>
					)}

					{/* Location & Join Date */}
					<div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
						{user.location && (
							<div className="flex items-center gap-1">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
								<span>{user.location}</span>
							</div>
						)}
						<div className="flex items-center gap-1">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
							<span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
						</div>
					</div>

					{/* Social Links */}
					{Object.keys(socials).length > 0 && (
						<div className="mt-4 flex flex-wrap gap-3">
							{Object.entries(socials).map(([key, url]) => {
								if (!url || typeof url !== 'string') return null;
								return (
									<a
										key={key}
										href={url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-xs font-semibold text-blue-600 hover:underline capitalize"
									>
										{key}
									</a>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
