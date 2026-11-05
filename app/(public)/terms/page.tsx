import type { Metadata } from "next";
import Link from "next/link";
import { Scale } from "lucide-react";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description:
    "Terms for using the Innovations demonstration platform. Sample data only; not a brokerage, offer or booking service.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "31 October 2026";

export default function TermsPage() {
  return (
    <>
      <section className="border-b border-line bg-surface/60">
        <div className="shell py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.55fr] lg:items-end">
            <div>
              <p className="eyebrow">Legal</p>
              <h1 className="display-lg mt-4 balance">Terms &amp; conditions.</h1>
              <p className="lede mt-4 max-w-xl">
                The rules for using this demonstration. In short: explore freely, but treat every project,
                price and approval as sample data. Last updated {UPDATED}.
              </p>
            </div>
            <div className="rounded-[14px] border border-brass/30 bg-brass-pale/60 p-5">
              <p className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-brass-soft">
                <Scale className="size-4" /> Not an offer
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Nothing on this site is a property offer, booking, legal advice or verified approval. All
                project and developer names are fictional.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-10 md:py-14">
        <div className="prose-legal mx-auto max-w-3xl">
          <div className="rounded-[14px] border border-brass/30 bg-brass-pale/50 p-5 text-[0.82rem] leading-relaxed text-ink-soft">
            <strong className="text-ink">Demonstration notice.</strong> {SITE.demoDisclaimer}
          </div>

          <h2>1. Acceptance</h2>
          <p>
            By accessing or using Innovations, you agree to these terms. If you do not agree, please do not
            use the platform. These terms apply to all visitors, registered users and staff accounts.
          </p>

          <h2>2. What this platform is</h2>
          <p>
            Innovations is a software demonstration that shows how a modern real-estate discovery product
            could work. It is not a real estate brokerage, agent, marketplace or advisory service. It does
            not solicit bookings, collect payments, or connect you to real inventory. Projects, developers,
            prices, configurations, possession dates, amenities and locations are sample data created for
            illustration.
          </p>

          <h2>3. No verified listings</h2>
          <p>
            We do not present any approval, RERA registration or developer claim as verified unless a
            project record explicitly marks it verified. In this demo, no RERA number is presented as real.
            Always verify registration, title, approvals and delivery claims independently with the
            relevant authority and a qualified professional.
          </p>

          <h2>4. Prices and availability</h2>
          <p>
            Prices shown are illustrative and are not quotations or offers. Availability, floor plans,
            taxes, charges, payment plans and possession timelines are sample data. In a live deployment
            they would remain subject to developer terms and change without notice.
          </p>

          <h2>5. Accounts</h2>
          <ul>
            <li>Provide accurate information and keep your password confidential.</li>
            <li>You are responsible for activity under your account.</li>
            <li>Do not create accounts to spam, scrape or abuse the platform.</li>
            <li>We may suspend accounts that violate these terms or attempt to compromise the service.</li>
          </ul>

          <h2>6. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Submit false, misleading or unlawful inquiries or site-visit requests.</li>
            <li>Attempt to access another person&apos;s account, admin area or private lead data.</li>
            <li>Probe, scan, overload or circumvent rate limits and security controls.</li>
            <li>Upload malware or files that are not permitted images.</li>
            <li>Scrape the site at scale or resell its content without permission.</li>
          </ul>

          <h2>7. AI assistant</h2>
          <p>
            The assistant is a search and explanation aid. It can make mistakes, and its replies are not
            professional advice. It is designed to use only database facts for projects and prices, but you
            should still confirm every detail independently. Voice features depend on browser support and
            may not be available everywhere; text input is always the fallback.
          </p>

          <h2>8. Intellectual property</h2>
          <p>
            The Innovations name, interface, code and written content are part of this demonstration
            project. Photography is sourced from Unsplash for demonstration purposes and remains subject to
            its original licence. You may not represent the demo as a live brokerage or reuse its sample
            data as real listings.
          </p>

          <h2>9. Third-party services</h2>
          <p>
            The demo may link to WhatsApp, maps, Unsplash, an optional AI provider and other third-party
            services. Those services have their own terms and privacy policies. We are not responsible for
            their content or availability.
          </p>

          <h2>10. Disclaimers</h2>
          <p>
            The platform is provided “as is” and “as available”, without warranties of any kind, express or
            implied, including fitness for a particular purpose, accuracy or non-infringement. Your use of
            the demo is at your own risk.
          </p>

          <h2>11. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, Innovations and its maintainers are not liable for any
            indirect, incidental, special or consequential loss arising from your use of the platform,
            including decisions made on the basis of sample data.
          </p>

          <h2>12. Changes and termination</h2>
          <p>
            We may modify, suspend or discontinue any part of the demonstration at any time. We may update
            these terms; continued use after an update means you accept the revised terms.
          </p>

          <h2>13. Governing law</h2>
          <p>
            These terms are governed by the laws of India. Any dispute is subject to the exclusive
            jurisdiction of the courts at Gautam Buddh Nagar, Uttar Pradesh, without prejudice to any
            mandatory consumer protection rights.
          </p>

          <h2>14. Contact</h2>
          <p>
            Questions about these terms can be sent to <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or
            via the <Link href="/contact">contact page</Link>. See also our{" "}
            <Link href="/privacy-policy">privacy policy</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
