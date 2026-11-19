import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

// Automatically heal any Google Drive for Desktop "(1)" duplicate filenames
try {
  const dirs = [
    ".",
    "lib",
    "stores",
    "components",
    "components/screens",
    "features/viewer",
    "features/study",
    "features/tree",
    "features/splash",
    "features/layout",
  ];
  for (const rel of dirs) {
    const dirPath = path.join(process.cwd(), rel);
    if (!fs.existsSync(dirPath)) continue;
    for (const entry of fs.readdirSync(dirPath)) {
      const m = entry.match(/^(.+?)\s+\(\d+\)(\.[^.]+)$/);
      if (!m) continue;
      const cleanName = `${m[1]}${m[2]}`;
      const dupFull = path.join(dirPath, entry);
      const cleanFull = path.join(dirPath, cleanName);
      if (!fs.existsSync(cleanFull)) {
        fs.copyFileSync(dupFull, cleanFull);
      }
    }
  }
} catch {}

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  allowedDevOrigins: ["192.168.1.12"],
  reactStrictMode: process.env.NODE_ENV === "development",
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "@phosphor-icons/react",
      "lucide-react",
      "framer-motion",
      "three",
      "@react-three/drei",
      "@react-three/fiber",
      "@supabase/supabase-js",
    ],
  },
  async headers() {
    return [
      {
        source: "/anatomy/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/models/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/atlas-thumbs/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/draco/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
