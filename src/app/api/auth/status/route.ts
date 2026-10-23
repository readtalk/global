import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
	const cookieStore = await cookies();
	const session = cookieStore.get("session")?.value;

	if (!session) {
		return NextResponse.json({ loggedIn: false });
	}

	return NextResponse.json({ loggedIn: true });
}
