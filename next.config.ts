import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseDomain = supabaseUrl ? new URL(supabaseUrl).hostname : "*.supabase.co";

const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https://${supabaseDomain}`,
  `font-src 'self'`,
  `connect-src 'self' https://${supabaseDomain} wss://${supabaseDomain} https://generativelanguage.googleapis.com https://www.google-analytics.com https://api.stripe.com`,
  `frame-src 'self' https://js.stripe.com`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
];

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspDirectives.join("; ") },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  serverExternalPackages: ["xlsx", "mammoth", "pdf-parse"],
  headers: async () => [
    {
      source: "/((?!widget/).*)",
      headers: securityHeaders,
    },
    {
      // Widget is embedded in iframes — allow embedding, relax frame-ancestors
      source: "/widget/:path*",
      headers: [
        ...securityHeaders.filter(
          (h) => h.key !== "X-Frame-Options" && h.key !== "Content-Security-Policy"
        ),
        {
          key: "Content-Security-Policy",
          value: cspDirectives
            .filter((d) => !d.startsWith("frame-ancestors"))
            .concat("frame-ancestors *")
            .join("; "),
        },
      ],
    },
  ],
};

export default nextConfig;
