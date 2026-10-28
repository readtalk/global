import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const authHeader = request.headers.get("Authorization");

		if (!authHeader) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		const res = await fetch("https://auth.readtalk.workers.dev/notifications", {
			headers: { "Authorization": authHeader },
			cache: "no-store",
		});

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}
