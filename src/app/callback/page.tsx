"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const hasExchanged = useRef(false);

	useEffect(() => {
		if (hasExchanged.current) return;
		hasExchanged.current = true;

		const exchangeCode = async () => {
			const code = searchParams.get("code");

			if (!code) {
				router.push("/");
				return;
			}

			try {
				const verifier = localStorage.getItem("code_verifier") || "";
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

				const data = await response.json();

				if (data.access_token) {
					localStorage.setItem("session", data.access_token);
					localStorage.removeItem("code_verifier");
					router.push("/");
				} else {
					router.push("/");
				}
			} catch (error) {
				router.push("/");
			}
		};

		exchangeCode();
	}, [searchParams, router]);

	return <div className="p-4 text-center">Loading...</div>;
}

export default function Callback() {
	return (
		<Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
			<CallbackContent />
		</Suspense>
	);
}
