//
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

		const resUser = await fetch(`https://auth.readtalk.workers.dev/users/${username}`, {
			headers,
			cache: "no-store",
		});
		const dataUser = (await resUser.json()) as { success: boolean; user?: any };

		if (!dataUser.success || !dataUser.user) {
			return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
		}

		const userId = dataUser.user.id;

		const resUpdates = await fetch(`https://auth.readtalk.workers.dev/updates?userId=${userId}`, {
			headers,
			cache: "no-store",
		});
		const dataUpdates = (await resUpdates.json()) as { success: boolean; updates?: any[] };

		const posts = (dataUpdates.updates || []).map((post: any) => ({
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
