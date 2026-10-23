import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidSearchQuery, isValidSearchType } from "@/lib/validation";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { query, type, cursor } = body;

		if (!isValidSearchQuery(query)) {
			return NextResponse.json(
				{ error: "Validation failed", message: "Invalid search query" },
				{ status: 400 }
			);
		}

		if (!isValidSearchType(type)) {
			return NextResponse.json(
				{ error: "Validation failed", message: "Invalid search type" },
				{ status: 400 }
			);
		}

		const cookieStore = await cookies();
		const session = cookieStore.get("session")?.value;

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (session) {
			headers["Authorization"] = `Bearer ${session}`;
		}

		const searchUrl = new URL("https://auth.readtalk.workers.dev/chats/search");
		searchUrl.searchParams.set("q", query);
		searchUrl.searchParams.set("type", type);
		if (cursor) searchUrl.searchParams.set("cursor", cursor);

		const response = await fetch(searchUrl.toString(), {
			method: "GET",
			headers,
		});

		const data = await response.json();
		return NextResponse.json(data, { status: response.status });
	} catch (error: unknown) {
		console.error("Error searching:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
