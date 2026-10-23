import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const code = searchParams.get("code");
	const state = searchParams.get("state");

	if (!code) {
		return NextResponse.redirect(new URL("/?error=missing_code", request.url));
	}

	try {
		const tokenResponse = await fetch("https://auth.readtalk.workers.dev/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				grant_type: "authorization_code",
				client_id: "your-client-id",
				code: code,
				redirect_uri: "https://global.readtalk.workers.dev/callback",
			}),
		});

		if (!tokenResponse.ok) {
			throw new Error("Failed to exchange token");
		}

		const data = await tokenResponse.json();
		const accessToken = data.access_token;

		const cookieStore = await cookies();
		cookieStore.set("access_token", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24 * 7,
		});

		return NextResponse.redirect(new URL("/", request.url));
	} catch (error) {
		return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
	}
}
