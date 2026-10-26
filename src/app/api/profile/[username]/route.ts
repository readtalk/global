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

		const [resUser, resUsers] = await Promise.all([
			fetch(`https://auth.readtalk.workers.dev/users/${username}`, { headers, cache: "no-store" }),
			fetch(`https://auth.readtalk.workers.dev/users`, { headers, cache: "no-store" }),
		]);

		const dataUser = (await resUser.json()) as { success: boolean; user?: any; updates?: any[] };
		const dataUsers = (await resUsers.json()) as { success: boolean; users?: any[] };

		if (!dataUser.success || !dataUser.user) {
			return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
		}

		const targetUserId = String(dataUser.user.id).trim();
		const allUpdates = dataUser.updates || [];
		const allUsers = dataUsers.users || [];

		const userMap = new Map(allUsers.map((u: any) => [String(u.id), u]));

		const posts = allUpdates
			.filter((u: any) => String(u.user_id).trim() === targetUserId && !u.reposter_id)
			.map((post: any) => ({ 
				...post, 
				user: dataUser.user 
			}));

		const reposts = allUpdates
			.filter((u: any) => String(u.reposter_id).trim() === targetUserId)
			.map((post: any) => ({ 
				...post, 
				user: userMap.get(String(post.user_id)) || null
			}));

		return NextResponse.json({
			success: true,
			user: dataUser.user,
			posts: posts,
			reposts: reposts
		});
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}
