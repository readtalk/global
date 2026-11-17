"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SaiHack() {
	const pathname = usePathname();

	useEffect(() => {
		const root = document.documentElement;
		const isDark = root.classList.contains("dark");
		const color = isDark ? "#09090b" : "#ffffff";

		root.style.backgroundColor = color;
		if (document.body) {
			document.body.style.backgroundColor = color;
		}
	}, [pathname]);

	return null;
}
