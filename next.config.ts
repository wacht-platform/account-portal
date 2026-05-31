import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    transpilePackages: ["@wacht/jsx", "@wacht/nextjs", "@wacht/types"],
};

export default nextConfig;

// Enable Cloudflare bindings + OpenNext behavior in `next dev`.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
