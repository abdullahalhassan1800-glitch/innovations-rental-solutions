/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Ship the seeded SQLite snapshot with the serverless bundle; instrumentation
  // copies it to /tmp at runtime (see instrumentation.ts).
  outputFileTracingIncludes: {
    "/**": ["./prisma/sample.db"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async redirects() {
    // The listings index lives at /projects; keep common alternate URLs working.
    return [
      { source: "/properties", destination: "/projects", permanent: true },
      { source: "/properties/:slug", destination: "/projects/:slug", permanent: true },
      { source: "/property/:slug", destination: "/projects/:slug", permanent: true },
      { source: "/project", destination: "/projects", permanent: true },
      { source: "/project/:slug", destination: "/projects/:slug", permanent: true },
      { source: "/listings", destination: "/projects", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=()",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
