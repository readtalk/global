//
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
	try {
		const cookieStore = await cookies();
		const session = cookieStore.get("session")?.value;

		if (!session) {
			return NextResponse.json({ success: false, error: "Not logged in" }, { status: 401 });
		}

		
		const payloadBase64 = session.split(".")[1];
		const payload = JSON.parse(atob(payloadBase64));
		const userId = payload.properties?.id || payload.sub;

		if (!userId) {
			return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
		}

		
		const res = await fetch(`https://auth.readtalk.workers.dev/settings`, {
			headers: { "Authorization": `Bearer ${session}` },
		});
		const data = await res.json();

		if (data.success) {
			return NextResponse.json({ success: true, user: data.user });
		}

		return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
	} catch (error) {
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}
