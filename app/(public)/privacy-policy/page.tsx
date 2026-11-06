import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How the Innovations demonstration platform collects, uses and protects account and inquiry information. Sample data only.",
  alternates: { canonical: "/privacy-policy" },
};

const UPDATED = "31 October 2026";

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="border-b border-line bg-surface/60">
        <div className="shell py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.55fr] lg:items-end">
            <div>
              <p className="eyebrow">Legal</p>
              <h1 className="display-lg mt-4 balance">Privacy policy.</h1>
              <p className="lede mt-4 max-w-xl">
                A plain-language description of what this demonstration stores, why it stores it, and
                how you can remove it. Last updated {UPDATED}.
              </p>
            </div>
            <div className="rounded-[14px] border border-forest/20 bg-forest-soft/70 p-5">
              <p className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-night">
                <ShieldCheck className="size-4" /> The short version
              </p>
              <p className="mt-2 text-sm leading-relaxed text-night/75">
                This is a sample. Account details, saved projects, inquiries and site visits are stored in
                a local development database and are not shared with a real sales team.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-10 md:py-14">
        <div className="prose-legal mx-auto max-w-3xl">
          <div className="rounded-[14px] border border-brass/30 bg-brass-pale/50 p-5 text-[0.82rem] leading-relaxed text-ink-soft">
            <strong className="text-ink">Demonstration notice.</strong> {SITE.demoDisclaimer} Innovations
            is not a registered broker and does not sell property. Do not submit real confidential
            information.
          </div>

          <h2>1. Who we are</h2>
          <p>
            Innovations is a demonstration real-estate discovery platform built for Noida, Greater Noida,
            Noida Extension and Delhi NCR. References to “Innovations”, “we”, “us” or “our” mean this
            demonstration project. You can contact the maintainers at{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>

          <h2>2. Information we collect</h2>
          <p>When you use the sample, we may store the following categories of information:</p>
          <ul>
            <li>
              <strong>Account information:</strong> your name, email address, optional mobile number and
              a bcrypt hash of your password. We never store the password itself.
            </li>
            <li>
              <strong>Inquiry details:</strong> name, phone number, optional email, selected project,
              inquiry type, message and the page or assistant source that generated the request.
            </li>
            <li>
              <strong>Site-visit requests:</strong> name, phone number, optional email, preferred date and
              time, and any message you add.
            </li>
            <li>
              <strong>Usage information:</strong> saved projects, project view counters and basic
              technical data needed to rate-limit abusive requests.
            </li>
            <li>
              <strong>Assistant messages:</strong> the text you send to the assistant is processed to
              extract search criteria. Project facts in replies are read from our database.
            </li>
          </ul>

          <h2>3. How we use it</h2>
          <ul>
            <li>To create and secure your account and keep you signed in.</li>
            <li>To show your saved projects, inquiry history and site visits in your dashboard.</li>
            <li>To demonstrate how a sales team would receive and manage leads.</li>
            <li>To prevent spam, duplicate submissions and abusive traffic.</li>
            <li>To improve the clarity and behaviour of the demonstration.</li>
          </ul>
          <p>
            We do not sell personal information, run advertising profiles, or share your details with
            third-party brokers as part of this sample.
          </p>

          <h2>4. Cookies and sessions</h2>
          <p>
            Signing in sets a signed, HTTP-only session cookie. It is used only to identify your session
            and is not readable by client-side JavaScript. The cookie is set with <code>SameSite=Lax</code>{" "}
            and is marked <code>Secure</code> in production. Signing out clears it. We do not use
            advertising cookies.
          </p>

          <h2>5. Where data is stored</h2>
          <p>
            The sample uses a local SQLite database by default. If you deploy it, the database location is
            controlled by the <code>DATABASE_URL</code> environment variable. Uploaded images may be
            stored locally or in an S3-compatible bucket, depending on configuration. AI provider keys,
            when configured, remain server-side and are never sent to the browser.
          </p>

          <h2>6. AI assistant and voice</h2>
          <p>
            With the default configuration, the assistant runs using deterministic rules on our server and
            no external AI provider is contacted. If an OpenAI-compatible provider is configured, only the
            scrubbed message is sent for intent extraction; project names, prices and availability always
            come from our database. Voice input and spoken replies use your browser&apos;s Web Speech APIs.
            Depending on the browser, audio may be processed by the browser vendor under its own terms.
          </p>

          <h2>7. Retention</h2>
          <p>
            Demonstration data is retained until the database is reset. You can ask for account and inquiry
            data to be removed by contacting <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. Running{" "}
            <code>npm run db:reset</code> clears all local demonstration data.
          </p>

          <h2>8. Your choices</h2>
          <ul>
            <li>You can update your name and phone number from the dashboard profile page.</li>
            <li>You can change your password from the dashboard.</li>
            <li>You can remove saved projects at any time.</li>
            <li>You can request deletion of your account and associated sample data.</li>
          </ul>

          <h2>9. Security</h2>
          <p>
            Passwords are hashed with bcrypt, sessions use signed HTTP-only cookies, server-side role
            checks protect dashboard and admin routes, and all submitted data is validated. Uploads are
            restricted by type, size and file signature. No system is perfectly secure; please do not
            submit real confidential information to this demonstration.
          </p>

          <h2>10. Children</h2>
          <p>
            The platform is not directed at children under 18. Do not create an account or submit an
            inquiry on behalf of a child.
          </p>

          <h2>11. Changes</h2>
          <p>
            We may update this policy as the demonstration evolves. The “last updated” date at the top of
            this page will reflect any change.
          </p>

          <h2>12. Contact</h2>
          <p>
            Questions about privacy can be sent to <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or by
            using the <Link href="/contact">contact page</Link>. See also our{" "}
            <Link href="/terms">terms and conditions</Link>.
          </p>
        </div>
      </section>
    </>
  );
}

