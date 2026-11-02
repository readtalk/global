import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const authHeader = request.headers.get("Authorization");

		const headers: Record<string, string> = {};
		if (authHeader) headers["Authorization"] = authHeader;

		const res = await fetch(`https://auth.readtalk.workers.dev/updates/preview?${searchParams.toString()}`, {
			headers,
			cache: "no-store",
		});

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}
