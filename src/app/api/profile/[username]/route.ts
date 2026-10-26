import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ username: string }> }
) {
	try {
		const { username } = await params;

		if (!username) {
			return NextResponse.json({ success: false, error: "Username required" }, { status: 400 });
		}

		const [resUser, resUpdates] = await Promise.all([
			fetch(`https://auth.readtalk.workers.dev/users/${username}`, { cache: "no-store" }),
			fetch("https://auth.readtalk.workers.dev/updates", { cache: "no-store" }),
		]);

		const dataUser = (await resUser.json()) as { success: boolean; user?: any };
		const dataUpdates = (await resUpdates.json()) as { success: boolean; updates?: any[] };

		if (!dataUser.success || !dataUser.user) {
			return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
		}

		const targetUserId = String(dataUser.user.id).trim();
		const allUpdates = dataUpdates.updates || [];
		
		const posts = allUpdates
			.filter((post: any) => String(post.user_id).trim() === targetUserId)
			.map((post: any) => ({
				...post,
				user: dataUser.user
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
