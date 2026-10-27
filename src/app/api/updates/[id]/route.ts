import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const authHeader = request.headers.get("Authorization");

		const headers: Record<string, string> = {};
		if (authHeader) headers["Authorization"] = authHeader;

		// Nembak langsung ke backend utama (bukan /updates/:id karena endpoint itu belum ada di index.ts)
		const res = await fetch(`https://auth.readtalk.workers.dev/users/${id}`, { headers, cache: "no-store" });
		
		// TAPI KARENA INI ID POSTINGAN BUKAN USERNAME, KITA HARUS PAKAI CARA LAIN
		// (Lihat penjelasan di bawah)
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}
