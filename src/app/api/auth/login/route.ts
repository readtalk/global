//
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET() {
	const array = new Uint32Array(56);
	crypto.getRandomValues(array);
	const verifier = Array.from(array, (dec) => ("0" + dec.toString(16)).substr(-2)).join("");

	const hash = crypto.createHash("sha256").update(verifier).digest();
	const challenge = hash.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

	const cookieStore = await cookies();
	cookieStore.set("code_verifier", verifier, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 10,
	});

	const authUrl = new URL("https://auth.readtalk.workers.dev/authorize");
	authUrl.searchParams.set("response_type", "code");
	authUrl.searchParams.set("client_id", "your-client-id");
	authUrl.searchParams.set("redirect_uri", "https://global.readtalk.workers.dev/callback");
	authUrl.searchParams.set("code_challenge", challenge);
	authUrl.searchParams.set("code_challenge_method", "S256");

	return NextResponse.redirect(authUrl.toString());
}
