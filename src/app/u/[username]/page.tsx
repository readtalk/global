export const dynamic = "force-dynamic";

type User = {
	id: string;
	email: string;
	username: string;
	yourname: string;
	date_of_birth: string;
	created_at: string;
};

async function getUserByUsername(username: string): Promise<User | null> {
	try {
		const res = await fetch("https://auth.readtalk.workers.dev/users", {
			cache: "no-store",
		});
		const data = (await res.json()) as { success: boolean; users: User[] };
		
		if (data.success && data.users) {
			return data.users.find((u) => u.username === username) || null;
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

	return (
		<div className="min-h-screen bg-gray-100 flex items-start justify-center p-4">
			<div className="max-w-md w-full my-8 text-center">
				<div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto">
					{user.username[0]?.toUpperCase() ?? "?"}
				</div>
				<h1 className="text-2xl font-bold mt-4">@{user.username}</h1>
				<p className="text-gray-700 text-sm font-medium">{user.yourname}</p>
				<p className="text-gray-500 text-xs mt-1">
					Joined {new Date(user.created_at).toLocaleDateString()}
				</p>
			</div>
		</div>
	);
}
