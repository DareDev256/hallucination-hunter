import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking — only allow same-origin framing
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Stop MIME-type sniffing (prevents script injection via content-type confusion)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Minimal referrer — don't leak full URLs to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable unnecessary browser APIs (camera, mic, geolocation, etc.)
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // CSP: allow self + inline styles (Tailwind/Framer Motion need them) + block everything else
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
