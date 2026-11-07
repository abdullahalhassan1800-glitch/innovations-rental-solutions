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
    // The listings index lives at /properties; keep common alternate URLs working.
    return [
      { source: "/properties", destination: "/properties", permanent: true },
      { source: "/properties/:slug", destination: "/properties/:slug", permanent: true },
      { source: "/project", destination: "/properties", permanent: true },
      { source: "/project/:slug", destination: "/properties/:slug", permanent: true },
      { source: "/listings", destination: "/properties", permanent: true },
      { source: "/projects", destination: "/properties", permanent: true },
      { source: "/projects/:slug", destination: "/properties/:slug", permanent: true },
      { source: "/property/:slug", destination: "/properties/:slug", permanent: true },
      { source: "/residential", destination: "/properties", permanent: true },
      { source: "/commercial", destination: "/properties", permanent: true },
      { source: "/resort-housing", destination: "/properties", permanent: true },
      { source: "/service-apartments", destination: "/properties", permanent: true },
      { source: "/rentofree", destination: "/properties", permanent: true },
      { source: "/why-rentofree", destination: "/why-housirentz", permanent: true },
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
