import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { SITE } from "@/lib/constants";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Innovations Rental Solutions — Resort, serviced & commercial addresses",
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  keywords: [
    "resort housing",
    "service apartments",
    "commercial property India",
    "Delhi NCR real estate",
    "managed rental assets",
    "Noida property",
    "NOIDA service apartments",
    "NOIDA resort housing",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE.url,
    siteName: SITE.name,
    title: "Innovations Rental Solutions — Addresses with ambition",
    description: SITE.description,
    images: [{ url: "/images/exterior-1.jpg", width: 1600, height: 1067, alt: "Innovations Rental Solutions demonstration property" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Innovations Rental Solutions — Addresses with ambition",
    description: SITE.description,
    images: ["/images/exterior-1.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "real estate",
};

export const viewport: Viewport = {
  themeColor: "#050810",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={poppins.variable}>
      <body className="min-h-screen bg-cream text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-paper focus:px-4 focus:py-2 focus:text-sm focus:text-night"
        >
          Skip to content
        </a>
        <ToastProvider>{children}</ToastProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE.name,
              url: SITE.url,
              email: SITE.email,
              telephone: SITE.phone,
              address: {
                "@type": "PostalAddress",
                streetAddress: SITE.addressStreet,
                addressLocality: SITE.addressLocality,
                addressRegion: SITE.addressRegion,
                postalCode: SITE.postalCode,
                addressCountry: "IN",
              },
              description: SITE.description,
            }),
          }}
        />
      </body>
    </html>
  );
}
