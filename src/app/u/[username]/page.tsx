export const dynamic = "force-dynamic";

export default async function PublicProfile({
	params,
}: {
	params: Promise<{ username: string }>;
}) {
	const { username } = await params;

	return (
		<div className="min-h-screen bg-gray-100 flex items-start justify-center p-4">
			<div className="max-w-md w-full my-8 text-center">
				<div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto">
					{username[0]?.toUpperCase() ?? "?"}
				</div>
				<h1 className="text-2xl font-bold mt-4">@{username}</h1>
				<p className="text-gray-500 text-sm">
					Profil publik (data dari D1 menyusul)
				</p>
			</div>
		</div>
	);
}
