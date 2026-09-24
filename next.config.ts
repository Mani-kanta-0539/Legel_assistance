import type { NextConfig } from "next";

/**
 * ClauseGuard Security Headers
 *
 * Comprehensive HTTP security headers following OWASP best practices.
 * Applied to all routes via Next.js headers() configuration.
 *
 * Key decisions:
 * - CSP: Removed 'unsafe-eval'. Next.js 16 + Turbopack does not require it in production.
 * - X-Frame-Options: Added DENY to prevent clickjacking (supplements CSP frame-ancestors).
 * - Permissions-Policy: Restricts dangerous browser APIs to minimize attack surface.
 */
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://vercel.live https://*.vercel.app https://*.vercel-insights.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://generativelanguage.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.googleapis.com https://*.firebaseapp.com https://*.vercel.app https://*.vercel-insights.com https://vercel.live wss://*.vercel.live wss://*.pusher.com",
      "frame-src 'self' https://vercel.live https://*.vercel.app",
      "frame-ancestors 'self' https://vercel.com https://*.vercel.app",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
