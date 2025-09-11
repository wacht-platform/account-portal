import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@snipextt/wacht", "@snipextt/wacht-nextjs"],
};

export default nextConfig;
