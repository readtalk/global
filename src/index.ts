// src/index.ts
import { issuer } from "@openauthjs/openauth";
import {
	CloudflareStorage,
	type CloudflareStorageOptions,
} from "@openauthjs/openauth/storage/cloudflare";
import { PasswordProvider } from "@openauthjs/openauth/provider/password";
import { PasswordUI } from "@openauthjs/openauth/ui/password";
import { createSubjects } from "@openauthjs/openauth/subject";
import { object, string } from "valibot";
import { ProfileHTML } from "./profile";

const subjects = createSubjects({
	user: object({
		id: string(),
	}),
});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/") {
			url.searchParams.set("redirect_uri", url.origin + "/profile");
			url.searchParams.set("client_id", "readtalk");
			url.searchParams.set("response_type", "code");
			url.pathname = "/authorize";
			return Response.redirect(url.toString());
		}

		if (url.pathname === "/profile") {
			const cookie = request.headers.get("Cookie");
			const token = cookie?.split("session=")[1]?.split(";")[0];

			if (!token) {
				return Response.redirect("/authorize");
			}

			const sessionData = await env.AUTH_KV.get(token);
			if (!sessionData) {
				return Response.redirect("/authorize");
			}

			const session = JSON.parse(sessionData);
			return new Response(ProfileHTML(session.email, session.userId), {
				headers: { "Content-Type": "text/html" }
			});
		}

		if (url.pathname === "/logout" && request.method === "POST") {
			const cookie = request.headers.get("Cookie");
			const token = cookie?.split("session=")[1]?.split(";")[0];

			if (token) {
				await env.AUTH_KV.delete(token);
			}

			const redirectUrl = new URL(url);
			redirectUrl.pathname = "/";
			return Response.redirect(redirectUrl.toString());
		}

		return issuer({
			storage: CloudflareStorage({
				namespace: env.AUTH_KV as CloudflareStorageOptions["namespace"],
			}),
			subjects,
			providers: {
				password: PasswordProvider(
					PasswordUI({
						sendCode: async (email, code) => {
							console.log(`Sending code ${code} to ${email}`);
						},
						copy: {
							title: "READTalk Auth",
							button_text: "Continue",
							input_code: "Verification code",
							input_email: "Email address",
						},
					}),
				),
			},
			theme: {
				title: "READTalk Auth",
				primary: "#000000",
				favicon: "https://raw.githubusercontent.com/readtalk/global/refs/heads/main/public/favicon.ico",
				logo: {
					dark: "https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/db1e5c92-d3a6-4ea9-3e72-155844211f00/public",
					light: "https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/fa5a3023-7da9-466b-98a7-4ce01ee6c700/public",
				},
			},
			success: async (ctx, value) => {
				const userId = await getOrCreateUser(env, value.email);
				const sessionId = crypto.randomUUID();
				await env.AUTH_KV.put(sessionId, JSON.stringify({
					userId: userId,
					email: value.email
				}), { expirationTtl: 86400 });

				const url = new URL(ctx.url);
				url.pathname = "/profile";
				return Response.redirect(url.toString(), 302);
			},
		}).fetch(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;

async function getOrCreateUser(env: Env, email: string): Promise<string> {
	const result = await env.AUTH_DB.prepare(
		`
		INSERT INTO user (email)
		VALUES (?)
		ON CONFLICT (email) DO UPDATE SET email = email
		RETURNING id;
		`,
	)
		.bind(email)
		.first<{ id: string }>();
	if (!result) {
		throw new Error(`Unable to process user: ${email}`);
	}
	console.log(`Found or created user ${result.id} with email ${email}`);
	return result.id;
}
