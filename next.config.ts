import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    transpilePackages: ["@wacht/jsx", "@wacht/nextjs", "@wacht/types"],
};

export default nextConfig;
