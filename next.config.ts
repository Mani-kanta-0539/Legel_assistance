import type { NextConfig } from "next";

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
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.vercel.app https://*.vercel-insights.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com data:;
      img-src 'self' data: https: blob:;
      connect-src 'self' https://generativelanguage.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.googleapis.com https://*.firebaseapp.com https://*.vercel.app https://*.vercel-insights.com https://vercel.live wss://*.vercel.live wss://*.pusher.com;
      frame-src 'self' https://vercel.live https://*.vercel.app;
      frame-ancestors 'self' https://vercel.com https://*.vercel.app;
      base-uri 'self';
      form-action 'self';
    `.replace(/\s{2,}/g, " ").trim(),
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
