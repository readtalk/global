import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const body = await request.json();
		const authHeader = request.headers.get("Authorization");
		if (!authHeader) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

		const token = authHeader.replace("Bearer ", "");
		const payload = JSON.parse(atob(token.split(".")[1]));
		const userId = payload.properties?.id || payload.sub;

		const res = await fetch(`https://auth.readtalk.workers.dev/updates/${id}`, {
			method: "PUT",
			headers: { 
				"Content-Type": "application/json", 
				"Authorization": authHeader,
				"X-User-Id": userId 
			},
			body: JSON.stringify(body),
		});
		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const authHeader = request.headers.get("Authorization");
		if (!authHeader) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

		const token = authHeader.replace("Bearer ", "");
		const payload = JSON.parse(atob(token.split(".")[1]));
		const userId = payload.properties?.id || payload.sub;

		const res = await fetch(`https://auth.readtalk.workers.dev/updates/${id}`, {
			method: "DELETE",
			headers: { 
				"Authorization": authHeader,
				"X-User-Id": userId
			},
		});
		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}
