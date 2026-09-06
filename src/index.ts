import { issuer } from "@openauthjs/openauth";
import { CloudflareStorage } from "@openauthjs/openauth/storage/cloudflare";
import { PasswordProvider } from "@openauthjs/openauth/provider/password";
import { PasswordUI } from "@openauthjs/openauth/ui/password";
import { createSubjects } from "@openauthjs/openauth/subject";
import { object, string } from "valibot";

interface Env {
	AUTH_KV: KVNamespace;
	AUTH_DB: D1Database;
}

const subjects = createSubjects({
	user: object({
		id: string(),
		email: string(),
	}),
});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === "/health") {
			return new Response(JSON.stringify({
				status: "ok",
				timestamp: new Date().toISOString(),
				services: {
					kv: !!env.AUTH_KV,
					d1: !!env.AUTH_DB
				}
			}), {
				headers: { "Content-Type": "application/json" }
			});
		}

		if (url.pathname === "/verify") {
			return handleVerify(request, env);
		}

		if (url.pathname === "/me") {
			return handleMe(request, env);
		}

		if (url.pathname === "/") {
			const redirectUrl = new URL(url);
			redirectUrl.pathname = "/authorize";
			redirectUrl.searchParams.set("redirect_uri", url.origin + "/callback");
			redirectUrl.searchParams.set("client_id", "readtalk");
			redirectUrl.searchParams.set("response_type", "code");
			return Response.redirect(redirectUrl.toString());
		}

		if (url.pathname === "/callback") {
			const code = url.searchParams.get("code");
			if (code) {
				try {
					const tokenResponse = await fetch("https://global.readtalk.workers.dev/token", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							client_id: "readtalk",
							code: code,
							grant_type: "authorization_code"
						})
					});
					const tokenData = await tokenResponse.json();
					if (tokenData.access_token) {
						const userResponse = await fetch("https://global.readtalk.workers.dev/me", {
							headers: { "Authorization": `Bearer ${tokenData.access_token}` }
						});
						const userData = await userResponse.json();
						if (userData.user) {
							const sessionId = crypto.randomUUID();
							await env.AUTH_KV.put(sessionId, JSON.stringify({
								userId: userData.user.id,
								email: userData.user.email
							}), { expirationTtl: 86400 });
							return new Response(renderDashboard(userData.user.email), {
								headers: {
									"Content-Type": "text/html",
									"Set-Cookie": `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax`
								}
							});
						}
					}
				} catch (error) {
					console.error("Token exchange error:", error);
				}
			}
			return Response.json({
				message: "OAuth flow complete!",
				params: Object.fromEntries(url.searchParams.entries()),
			});
		}

		if (url.pathname === "/dashboard") {
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
			return new Response(renderDashboard(session.email), {
				headers: { "Content-Type": "text/html" }
			});
		}

		if (url.pathname === "/logout" && request.method === "POST") {
			const cookie = request.headers.get("Cookie");
			const token = cookie?.split("session=")[1]?.split(";")[0];

			if (token) {
				await env.AUTH_KV.delete(token);
			}

			return Response.redirect("/");
		}

		return issuer({
			storage: CloudflareStorage({
				namespace: env.AUTH_KV,
			}),
			subjects,
			clients: {
				"readtalk": {
					redirect_uris: [
						"https://global.readtalk.workers.dev/callback",
						"http://localhost:5173/callback"
					]
				}
			},
			providers: {
				password: PasswordProvider(
					PasswordUI({
						sendCode: async (email, code) => {
							console.log(`📧 Verification code for ${email}: ${code}`);
						},
						copy: {
							title: "READTalk Authentication",
							button_text: "Continue",
							input_code: "Verification code",
							input_email: "Email address",
						},
					}),
				),
			},
			theme: {
				title: "Authentication",
				primary: "#000000",
				favicon: "https://raw.githubusercontent.com/readtalk/global/refs/heads/main/public/favicon.ico",
				logo: {
					dark: "https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/db1e5c92-d3a6-4ea9-3e72-155844211f00/public",
					light: "https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/fa5a3023-7da9-466b-98a7-4ce01ee6c700/public",
				},
			},
			success: async (ctx, value) => {
				const userId = await getOrCreateUser(env, value.email);
				return ctx.subject("user", {
					id: userId,
					email: value.email,
				});
			},
		}).fetch(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;

async function handleVerify(request: Request, env: Env): Promise<Response> {
	try {
		const authHeader = request.headers.get("Authorization");
		const token = authHeader?.split(" ")[1];

		if (!token) {
			return new Response(JSON.stringify({
				valid: false,
				error: "No token provided"
			}), {
				status: 401,
				headers: { "Content-Type": "application/json" }
			});
		}

		const sessionData = await env.AUTH_KV.get(token);

		if (!sessionData) {
			return new Response(JSON.stringify({
				valid: false,
				error: "Invalid or expired token"
			}), {
				status: 401,
				headers: { "Content-Type": "application/json" }
			});
		}

		let session;
		try {
			session = JSON.parse(sessionData);
		} catch {
			session = { userId: sessionData };
		}

		return new Response(JSON.stringify({
			valid: true,
			userId: session.userId || session.sub,
			email: session.email,
			token: token
		}), {
			headers: { "Content-Type": "application/json" }
		});

	} catch (error) {
		console.error("Verify error:", error);
		return new Response(JSON.stringify({
			valid: false,
			error: "Verification failed"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
}

async function handleMe(request: Request, env: Env): Promise<Response> {
	try {
		const authHeader = request.headers.get("Authorization");
		const token = authHeader?.split(" ")[1];

		if (!token) {
			return new Response(JSON.stringify({ error: "No token" }), {
				status: 401,
				headers: { "Content-Type": "application/json" }
			});
		}

		const sessionData = await env.AUTH_KV.get(token);
		if (!sessionData) {
			return new Response(JSON.stringify({ error: "Invalid token" }), {
				status: 401,
				headers: { "Content-Type": "application/json" }
			});
		}

		let session;
		try {
			session = JSON.parse(sessionData);
		} catch {
			session = { userId: sessionData };
		}

		const user = await env.AUTH_DB.prepare(
			"SELECT id, email, created_at FROM user WHERE id = ?"
		).bind(session.userId || session.sub).first();

		return new Response(JSON.stringify({ user }), {
			headers: { "Content-Type": "application/json" }
		});

	} catch (error) {
		console.error("Me error:", error);
		return new Response(JSON.stringify({ error: "Internal error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
}

async function getOrCreateUser(env: Env, email: string): Promise<string> {
	try {
		const existing = await env.AUTH_DB.prepare(
			"SELECT id FROM user WHERE email = ?"
		).bind(email).first<{ id: string }>();

		if (existing) {
			console.log(`✅ User exists: ${existing.id} (${email})`);
			return existing.id;
		}

		const result = await env.AUTH_DB.prepare(
			"INSERT INTO user (email) VALUES (?) RETURNING id"
		).bind(email).first<{ id: string }>();

		if (!result) {
			throw new Error("Failed to create user");
		}

		console.log(`🆕 New user created: ${result.id} (${email})`);
		return result.id;

	} catch (error) {
		console.error("Database error:", error);
		throw new Error(`Unable to process user: ${email}`);
	}
}

function renderDashboard(email: string) {
	return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Dashboard</title>
        <link rel="stylesheet" type="text/css" href="https://static.integrations.cloudflare.com/styles.css">
      </head>
      <body>
        <header>
          <h1>Welcome, ${email}!</h1>
        </header>
        <main>
          <p>You are logged in to READTalk Authentication.</p>
          <form action="/logout" method="POST">
            <button type="submit">Logout</button>
          </form>
        </main>
      </body>
    </html>
  `;
}
