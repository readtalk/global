import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
	async rewrites() {
		return [
			{
				source: "/@:username",
				destination: "/u/:username",
			},
			{
				source: "/profile/@:username",
				destination: "/profile/u/:username",
			},
		];
	},
};

export default nextConfig;

initOpenNextCloudflareForDev();
