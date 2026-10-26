import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const authHeader = request.headers.get("Authorization");
		
		const headers: Record<string, string> = {};
		if (authHeader) headers["Authorization"] = authHeader;

		const [resUpdate, resUsers] = await Promise.all([
			fetch(`https://auth.readtalk.workers.dev/updates/${id}`, { headers, cache: "no-store" }),
			fetch("https://auth.readtalk.workers.dev/users", { cache: "no-store" }),
		]);

		const dataUpdate = (await resUpdate.json()) as { success: boolean; update: any };
		const dataUsers = (await resUsers.json()) as { success: boolean; users: any[] };

		if (dataUpdate.success && dataUsers.success) {
			const userMap = new Map(dataUsers.users.map((u: any) => [u.id, u]));
			const mergedUpdate = {
				...dataUpdate.update,
				user: userMap.get(dataUpdate.update.user_id) || null,
			};
			return NextResponse.json({ success: true, update: mergedUpdate });
		}

		return NextResponse.json({ success: false, error: "Failed to fetch update" }, { status: 500 });
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    // ... (biarin kode PUT yang lama, atau hapus kalau udah nggak dipake)
}
