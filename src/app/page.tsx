"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function RootRedirect() {
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const token = searchParams.get("token");
		if (token) {
			localStorage.setItem("session", token);
			window.dispatchEvent(new Event("session-changed"));
		}
		router.replace("/chats");
	}, [searchParams, router]);

	return null;
}

export default function RootPage() {
	return <Suspense fallback={null}><RootRedirect /></Suspense>;
}
