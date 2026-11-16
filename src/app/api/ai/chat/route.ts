import { NextRequest, NextResponse } from "next/server";

const WORKER = "https://auth.readtalk.workers.dev";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const authHeader = request.headers.get("Authorization");

		const res = await fetch(`${WORKER}/ai/chat`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(authHeader ? { Authorization: authHeader } : {}),
			},
			body: JSON.stringify(body),
		});

		// Teruskan stream apa adanya, JANGAN await res.json()
		return new NextResponse(res.body, {
			status: res.status,
			headers: {
				"Content-Type": res.headers.get("Content-Type") ?? "text/event-stream; charset=utf-8",
				"Cache-Control": "no-cache, no-transform",
				Connection: "keep-alive",
			},
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}
