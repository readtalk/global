import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const query = request.nextUrl.searchParams.get("q")?.toLowerCase() || "";
	const type = request.nextUrl.searchParams.get("type") || "threads";

	try {
		const authHeader = request.headers.get("Authorization");
		const headers: Record<string, string> = {};
		if (authHeader) headers["Authorization"] = authHeader;

		const [resUpdates, resUsers] = await Promise.all([
			fetch("https://auth.readtalk.workers.dev/updates", { headers, cache: "no-store" }),
			fetch("https://auth.readtalk.workers.dev/users", { cache: "no-store" }),
		]);

		const dataUpdates = (await resUpdates.json()) as { success: boolean; updates: any[] };
		const dataUsers = (await resUsers.json()) as { success: boolean; users: any[] };

		if (!dataUpdates.success || !dataUsers.success) {
			return NextResponse.json({ success: false, error: "Failed to fetch data" }, { status: 500 });
		}

		const userMap = new Map(dataUsers.users.map((u: any) => [u.id, u]));
		let results: any[] = [];

		if (type === "threads") {
			results = dataUpdates.updates
				.map((post: any) => ({
					...post,
					user: userMap.get(post.user_id) || null,
				}))
				.filter((post: any) => {
					const contentMatch = post.content?.toLowerCase().includes(query);
					const userMatch = post.user?.username?.toLowerCase().includes(query) || post.user?.yourname?.toLowerCase().includes(query);
					return contentMatch || userMatch;
				});
		} else if (type === "posts") {
			results = dataUsers.users
				.filter((u: any) => {
					return u.username?.toLowerCase().includes(query) || u.yourname?.toLowerCase().includes(query);
				});
		}

		return NextResponse.json({ success: true, results });
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}
