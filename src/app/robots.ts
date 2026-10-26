import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/api/", "/settings/", "/update/"],
		},
		sitemap: "https://global.readtalk.workers.dev/sitemap.xml",
	};
}
