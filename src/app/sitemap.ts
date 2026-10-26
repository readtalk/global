import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	try {
		const res = await fetch("https://auth.readtalk.workers.dev/users", {
			cache: "no-store",
		});
		const data = (await res.json()) as { success: boolean; users: any[] };

		const userUrls = (data.users || []).map((user: any) => ({
			url: `https://global.readtalk.workers.dev/@${user.username}`,
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.8,
		}));

		return [
			{
				url: "https://global.readtalk.workers.dev",
				lastModified: new Date(),
				changeFrequency: "daily" as const,
				priority: 1,
			},
			...userUrls,
		];
	} catch (error) {
		console.error("Failed to generate sitemap:", error);
		return [
			{
				url: "https://global.readtalk.workers.dev",
				lastModified: new Date(),
			},
		];
	}
}
