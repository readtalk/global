"use client";

import { useState, useEffect } from "react";

type PreviewData = {
	title?: string;
	description?: string;
	image?: { url: string };
	logo?: { url: string };
	url?: string;
	publisher?: string;
};

export default function Review({ url }: { url: string }) {
	const [data, setData] = useState<PreviewData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchPreview = async () => {
			const cacheKey = `preview_${url}`;
			const cachedData = localStorage.getItem(cacheKey);

			if (cachedData) {
				try {
					setData(JSON.parse(cachedData));
					setIsLoading(false);
					return;
				} catch {}
			}

			try {
				const token = localStorage.getItem("session");
				const res = await fetch(`/api/updates/review?url=${encodeURIComponent(url)}`, {
					headers: token ? { "Authorization": `Bearer ${token}` } : {},
				});
				const result = (await res.json()) as { success: boolean; data?: PreviewData };
				if (result.success && result.data) {
					setData(result.data);
					localStorage.setItem(cacheKey, JSON.stringify(result.data));
				}
			} catch (error) {
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		};

		if (url) fetchPreview();
	}, [url]);

	if (isLoading) return <div className="mt-3 w-full h-24 bg-gray-100 animate-pulse rounded-xl border border-gray-200" />;
	if (!data || !data.title) return null;

	return (
		<a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 block w-full rounded-xl border border-gray-200 overflow-hidden hover:bg-gray-50 transition">
			{data.image?.url && (
				<div className="w-full h-48 bg-gray-200 overflow-hidden">
					<img src={data.image.url} alt={data.title} className="w-full h-full object-cover" />
				</div>
			)}
			<div className="p-3">
				<p className="text-xs text-gray-500 uppercase tracking-wide truncate">{data.publisher || new URL(url).hostname}</p>
				<h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mt-1">{data.title}</h3>
				{data.description && <p className="text-xs text-gray-500 line-clamp-2 mt-1">{data.description}</p>}
			</div>
		</a>
	);
}
