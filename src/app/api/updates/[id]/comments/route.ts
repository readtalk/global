import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const authHeader = request.headers.get("Authorization");
		
		const headers: Record<string, string> = {};
		if (authHeader) headers["Authorization"] = authHeader;

		const [resComments, resUsers] = await Promise.all([
			fetch(`https://auth.readtalk.workers.dev/updates/${id}/comments`, { headers, cache: "no-store" }),
			fetch("https://auth.readtalk.workers.dev/users", { cache: "no-store" }),
		]);

		const dataComments = (await resComments.json()) as { success: boolean; comments: any[] };
		const dataUsers = (await resUsers.json()) as { success: boolean; users: any[] };

		if (dataComments.success && dataUsers.success) {
			const userMap = new Map(dataUsers.users.map((u: any) => [u.id, u]));
			const mergedComments = dataComments.comments.map((comment: any) => ({
				...comment,
				user: userMap.get(comment.user_id) || null,
			}));
			return NextResponse.json({ success: true, comments: mergedComments });
		}

		return NextResponse.json({ success: false, error: "Failed to fetch data" }, { status: 500 });
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const body = await request.json();
		const authHeader = request.headers.get("Authorization");

		if (!authHeader) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const res = await fetch(`https://auth.readtalk.workers.dev/updates/${id}/comments`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": authHeader,
			},
			body: JSON.stringify(body),
		});

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}
