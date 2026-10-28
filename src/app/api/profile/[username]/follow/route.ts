import { NextRequest, NextResponse } from "next/server";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ username: string }> }
) {
	try {
		const { username } = await params;
		const authHeader = request.headers.get("Authorization");

		if (!authHeader) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const res = await fetch(`https://auth.readtalk.workers.dev/users/${username}/follow`, {
			method: "POST",
			headers: { "Authorization": authHeader },
		});

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}
