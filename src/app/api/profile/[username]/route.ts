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

		const res = await fetch(`https://auth.readtalk.workers.dev/users/${username}`, {
			headers,
			cache: "no-store",
		});
		
		const data = (await res.json()) as { 
			success: boolean; 
			user?: any; 
			updates?: any[]; 
		};

		if (!data.success || !data.user) {
			return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
		}

		const posts = (data.updates || []).map((post: any) => ({
			...post,
			user: data.user
		}));

		return NextResponse.json({
			success: true,
			user: data.user,
			posts: posts,
			reposts: []
		});
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}
