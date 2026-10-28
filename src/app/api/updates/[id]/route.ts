import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const authHeader = request.headers.get("Authorization");

		const headers: Record<string, string> = {};
		if (authHeader) headers["Authorization"] = authHeader;

		const res = await fetch(`https://auth.readtalk.workers.dev/updates/${id}`, {
			headers,
			cache: "no-store",
		});

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}
