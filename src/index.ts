import { issuer } from "@openauthjs/openauth";
import {
	CloudflareStorage,
	type CloudflareStorageOptions,
} from "@openauthjs/openauth/storage/cloudflare";
import { PasswordProvider } from "@openauthjs/openauth/provider/password";
import { PasswordUI } from "@openauthjs/openauth/ui/password";
import { createSubjects } from "@openauthjs/openauth/subject";
import { object, string } from "valibot";

const subjects = createSubjects({
	user: object({
		id: string(),
	}),
});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		// ===== ROOT: redirect ke authorize =====
		if (url.pathname === "/") {
			url.searchParams.set("redirect_uri", url.origin + "/callback");
			url.searchParams.set("client_id", "your-client-id");
			url.searchParams.set("response_type", "code");
			url.pathname = "/authorize";
			return Response.redirect(url.toString());
		}

		// ===== CALLBACK: tukar code dengan token dari OpenAuth =====
		if (url.pathname === "/callback") {
			const code = url.searchParams.get("code");
			if (!code) {
				return new Response("Missing code", { status: 400 });
			}

			try {
				// Tukar code dengan token menggunakan OpenAuth
				const tokenResponse = await fetch(url.origin + "/api/token", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						code,
						client_id: "your-client-id",
						redirect_uri: url.origin + "/callback",
					}),
				});

				if (!tokenResponse.ok) {
					throw new Error("Failed to exchange code");
				}

				const { access_token } = await tokenResponse.json();
				return Response.redirect(url.origin + "/?token=" + access_token);
			} catch (err) {
				return new Response("Token exchange failed", { status: 500 });
			}
		}

		// ===== API /me: verifikasi token dan return user =====
		if (url.pathname === "/api/me") {
			const authHeader = request.headers.get("Authorization");
			const token = authHeader?.split(" ")[1];

			if (!token) {
				return new Response(JSON.stringify({ error: "Unauthorized" }), {
					status: 401,
					headers: { "Content-Type": "application/json" },
				});
			}

			try {
				// Verifikasi token menggunakan OpenAuth
				const verifyResponse = await fetch(url.origin + "/api/verify", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ token }),
				});

				if (!verifyResponse.ok) {
					throw new Error("Invalid token");
				}

				const payload = await verifyResponse.json();
				return Response.json({ user: payload });
			} catch (err) {
				return new Response(JSON.stringify({ error: "Invalid token" }), {
					status: 401,
					headers: { "Content-Type": "application/json" },
				});
			}
		}

		// ===== OPENAUTH ISSUER =====
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
							input_code: "Code (check Worker logs)",
						},
					}),
				),
			},
			theme: {
				title: "myAuth",
				primary: "#FFFFFF",
				favicon: "https://workers.cloudflare.com//favicon.ico",
				logo: {
					dark: "https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/db1e5c92-d3a6-4ea9-3e72-155844211f00/public",
					light:
						"https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/fa5a3023-7da9-466b-98a7-4ce01ee6c700/public",
				},
			},
			success: async (ctx, value) => {
				return ctx.subject("user", {
					id: await getOrCreateUser(env, value.email),
				});
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
		`
	)
		.bind(email)
		.first<{ id: string }>();
	if (!result) {
		throw new Error(`Unable to process user: ${email}`);
	}
	console.log(`Found or created user ${result.id} with email ${email}`);
	return result.id;
}
