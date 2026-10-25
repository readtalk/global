import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; commentId: string }> }) {
	try {
		const { id, commentId } = await params;
		const body = await request.json();
		const authHeader = request.headers.get("Authorization");
		if (!authHeader) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

		const res = await fetch(`https://auth.readtalk.workers.dev/updates/${id}/comments/${commentId}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json", "Authorization": authHeader },
			body: JSON.stringify(body),
		});
		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; commentId: string }> }) {
	try {
		const { id, commentId } = await params;
		const authHeader = request.headers.get("Authorization");
		if (!authHeader) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

		const res = await fetch(`https://auth.readtalk.workers.dev/updates/${id}/comments/${commentId}`, {
			method: "DELETE",
			headers: { "Authorization": authHeader },
		});
		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}
