import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ username: string }> }
) {
	try {
		const { username } = await params;

		if (!username || username === "undefined") {
			return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 });
		}

		const [resUser, resUpdates, resUsers] = await Promise.all([
			fetch(`https://auth.readtalk.workers.dev/users/${username}`, { cache: "no-store" }),
			fetch("https://auth.readtalk.workers.dev/updates", { cache: "no-store" }),
			fetch("https://auth.readtalk.workers.dev/users", { cache: "no-store" }),
		]);

		const dataUser = (await resUser.json()) as { success: boolean; user?: any };
		const dataUpdates = (await resUpdates.json()) as { success: boolean; updates?: any[] };
		const dataUsers = (await resUsers.json()) as { success: boolean; users?: any[] };

		if (dataUser.success && dataUser.user) {
			const userId = dataUser.user.id;
			const userMap = new Map((dataUsers.users || []).map((u: any) => [u.id, u]));

			const posts = (dataUpdates.updates || [])
				.filter((post) => post.user_id === userId)
				.map((post) => ({ ...post, user: userMap.get(post.user_id) || null, is_repost: false }));

			return NextResponse.json({
				success: true,
				user: dataUser.user,
				posts,
				reposts: []
			});
		}

		return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
	} catch (error) {
		return NextResponse.json({ success: false, error: `Internal server error: ${error instanceof Error ? error.message : "Unknown"}` }, { status: 500 });
	}
}
