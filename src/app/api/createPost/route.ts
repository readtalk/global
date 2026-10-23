import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validatePost } from "@/lib/validation";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { body: postBody, threadId, parentId, extendedData } = body;

		const cookieStore = await cookies();
		const session = cookieStore.get("session")?.value;

		if (!session) {
			return NextResponse.json(
				{ error: "Unauthorized", message: "You must be logged in to create a post" },
				{ status: 401 }
			);
		}

		if (!threadId || typeof threadId !== "string" || threadId.trim().length === 0) {
			return NextResponse.json(
				{ error: "Validation failed", message: "Valid Thread ID is required" },
				{ status: 400 }
			);
		}

		const validation = validatePost(postBody);
		if (!validation.isValid) {
			return NextResponse.json(
				{ error: "Validation failed", message: validation.errors.join(", ") },
				{ status: 400 }
			);
		}

		const response = await fetch(`https://auth.readtalk.workers.dev/chats/${threadId}/messages`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${session}`,
			},
			body: JSON.stringify({
				body: validation.sanitized.body,
				parentId,
				extendedData,
			}),
		});

		const data = await response.json();
		return NextResponse.json(data, { status: response.status });
	} catch (error: unknown) {
		console.error("Error creating post:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
