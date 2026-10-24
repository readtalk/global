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

		const textUpdates = await resUpdates.text();
		const textUsers = await resUsers.text();

		let dataUpdates, dataUsers;
		try { dataUpdates = JSON.parse(textUpdates); } catch { return NextResponse.json({ success: false, error: `Updates JSON Parse Error: ${textUpdates}` }, { status: 500 }); }
		try { dataUsers = JSON.parse(textUsers); } catch { return NextResponse.json({ success: false, error: `Users JSON Parse Error: ${textUsers}` }, { status: 500 }); }

		if (dataUpdates.success && dataUsers.success) {
			const userMap = new Map(dataUsers.users.map((u: any) => [u.id, u]));
			const mergedUpdates = dataUpdates.updates.map((post: any) => ({
				...post,
				user: userMap.get(post.user_id) || null,
			}));
			return NextResponse.json({ success: true, updates: mergedUpdates });
		}

		return NextResponse.json({ success: false, error: "Failed to fetch data from backend" }, { status: 500 });
	} catch (error: unknown) {
		return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
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

		const text = await res.text();
		let data;
		try { data = JSON.parse(text); } catch { return NextResponse.json({ success: false, error: `Backend Parse Error: ${text}` }, { status: 500 }); }

		return NextResponse.json(data, { status: res.status });
	} catch (error: unknown) {
		return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
	}
}
