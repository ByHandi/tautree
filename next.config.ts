import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle in `.next/standalone` so the Docker
  // runtime image only needs that output (no full `node_modules`).
  output: "standalone",
};

export default nextConfig;
