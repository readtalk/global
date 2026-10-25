//
import { NextRequest, NextResponse } from "next/server";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const authHeader = request.headers.get("Authorization");

		if (!authHeader) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const res = await fetch(`https://auth.readtalk.workers.dev/updates/${id}/repost`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": authHeader,
			},
			body: JSON.stringify({}),
		});

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}
