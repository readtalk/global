import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
	const code = request.nextUrl.searchParams.get("code");

	if (!code) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	const cookieStore = await cookies();
	const verifier = cookieStore.get("code_verifier")?.value || "";

	try {
		const response = await fetch("https://auth.readtalk.workers.dev/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				grant_type: "authorization_code",
				code: code,
				redirect_uri: "https://global.readtalk.workers.dev/callback",
				client_id: "your-client-id",
				code_verifier: verifier,
			}),
		});

		const data = (await response.json()) as { access_token?: string };

		if (data.access_token) {
			// Lempar token ke URL sementara, biar Client Component yang simpen ke localStorage
			const url = new URL("/", request.url);
			url.searchParams.set("token", data.access_token);
			return NextResponse.redirect(url);
		}
	} catch (error) {
		console.error(error);
	}

	return NextResponse.redirect(new URL("/", request.url));
}
