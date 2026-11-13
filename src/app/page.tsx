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
		
		const timeout = setTimeout(() => {
			router.replace("/chats");
		}, 1000);

		return () => clearTimeout(timeout);
	}, [searchParams, router]);

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
			<svg className="animate-spin h-10 w-10 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
				<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
		</div>
	);
}

export default function RootPage() {
	return <Suspense fallback={<div className="fixed inset-0 bg-white z-[9999]" />}><RootRedirect /></Suspense>;
}
