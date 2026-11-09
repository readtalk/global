import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

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

		if (!res.ok) {
			return NextResponse.json({ success: false, error: "Backend error" }, { status: res.status });
		}

		const data = await res.json();
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}
