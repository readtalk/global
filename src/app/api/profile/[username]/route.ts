import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ username: string }> }
) {
	try {
		const { username } = await params;
		const authHeader = request.headers.get("Authorization");
		
		const headers: Record<string, string> = {};
		if (authHeader) headers["Authorization"] = authHeader;

		const [resUser, resUpdates, resUsers] = await Promise.all([
			fetch(`https://auth.readtalk.workers.dev/users/${username}`, { cache: "no-store" }),
			fetch("https://auth.readtalk.workers.dev/updates", { headers, cache: "no-store" }),
			fetch("https://auth.readtalk.workers.dev/users", { cache: "no-store" }),
		]);

		const dataUser = (await resUser.json()) as { success: boolean; user?: any };
		const dataUpdates = (await resUpdates.json()) as { success: boolean; updates?: any[] };
		const dataUsers = (await resUsers.json()) as { success: boolean; users?: any[] };

		if (!dataUser.success || !dataUser.user) {
			return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
		}

		const targetUserId = String(dataUser.user.id).trim();
		const userMap = new Map((dataUsers.users || []).map((u: any) => [String(u.id), u]));
		const allUpdates = dataUpdates.updates || [];
		
		const posts = allUpdates
			.filter((post: any) => String(post.user_id).trim() === targetUserId)
			.map((post: any) => ({
				...post,
				user: userMap.get(String(post.user_id)) || null
			}));

		return NextResponse.json({
			success: true,
			user: dataUser.user,
			posts: posts,
			reposts: []
		});
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}
