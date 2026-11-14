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
      { protocol: "https", hostname: "img.etimg.com" },
      { protocol: "https", hostname: "www.desaihomes.com" },
      { protocol: "https", hostname: "omconstructions.org" },
      { protocol: "https", hostname: "www.tathastu.co" },
      { protocol: "https", hostname: "www.tarc.in" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async redirects() {
    // The listings index lives at /properties; project detail pages live at
    // /projects/[slug]. Alternate URLs must not shadow those real routes.
    return [
      { source: "/project", destination: "/properties", permanent: true },
      { source: "/project/:slug", destination: "/projects/:slug", permanent: true },
      { source: "/listings", destination: "/properties", permanent: true },
      { source: "/projects", destination: "/properties", permanent: true },
      { source: "/property/:slug", destination: "/projects/:slug", permanent: true },
      { source: "/rentofree", destination: "/properties", permanent: true },
      { source: "/why-rentofree", destination: "/why-housirentz", permanent: true },
      { source: "/how-it-works", destination: "/properties", permanent: true },
      { source: "/faq", destination: "/blog", permanent: true },
      { source: "/why-housirentz", destination: "/about", permanent: true },
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
