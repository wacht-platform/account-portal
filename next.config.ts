import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {};

export default nextConfig;

// Enable Cloudflare bindings + OpenNext behavior in `next dev`.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
