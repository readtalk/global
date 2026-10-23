import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateThread } from "@/lib/validation";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { title, slug, postBody, locked, pinned, tags, poll, extendedData } = body;
		
		const cookieStore = await cookies();
		const session = cookieStore.get("session")?.value;

		if (!session) {
			return NextResponse.json(
				{ error: "Unauthorized", message: "You must be logged in to create a thread" },
				{ status: 401 }
			);
		}

		const validation = validateThread(title, postBody || body.body);
		if (!validation.isValid) {
			return NextResponse.json(
				{ error: "Validation failed", message: validation.errors.join(", ") },
				{ status: 400 }
			);
		}

		const response = await fetch("https://auth.readtalk.workers.dev/chats/threads", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${session}`,
			},
			body: JSON.stringify({
				title: validation.sanitized.title,
				slug,
				body: validation.sanitized.body,
				locked,
				pinned,
				tags,
				poll,
				extendedData,
			}),
		});

		const data = await response.json();
		return NextResponse.json(data, { status: response.status });
	} catch (error: unknown) {
		console.error("Error creating thread:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
