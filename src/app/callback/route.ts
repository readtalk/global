import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const code = searchParams.get("code");
	const state = searchParams.get("state");

	if (!code) {
		return NextResponse.redirect(new URL("/?error=no_code", request.url));
	}

	return NextResponse.redirect(new URL("/", request.url));
}
