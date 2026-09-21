import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // L'espace créateur a déménagé sous /app : on garde les anciens liens et
  // signets fonctionnels, et /app seul mène à l'accueil du dashboard.
  async redirects() {
    return [
      { source: "/dashboard", destination: "/app/dashboard", permanent: true },
      { source: "/dashboard/:path*", destination: "/app/:path*", permanent: true },
      { source: "/app", destination: "/app/dashboard", permanent: false },
    ];
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
      ],
    }];
  },
};

export default nextConfig;
