import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

		if (dataUpdates.success && dataUsers.success) {
			const userMap = new Map(dataUsers.users.map((u: any) => [u.id, u]));
			const mergedUpdates = dataUpdates.updates.map((post: any) => ({
				...post,
				user: userMap.get(post.user_id) || null,
			}));
			return NextResponse.json({ success: true, updates: mergedUpdates });
		}

		return NextResponse.json({ success: false, error: "Failed to fetch data" }, { status: 500 });
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as { content: string };
		const authHeader = request.headers.get("Authorization");

		if (!authHeader) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const res = await fetch("https://auth.readtalk.workers.dev/updates", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": authHeader,
			},
			body: JSON.stringify({ content: body.content }),
		});

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}
