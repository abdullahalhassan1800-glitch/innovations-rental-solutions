import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { SITE } from "@/lib/constants";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Contact Housirentz | Rental Investment Advisor",
  description:
    "Contact the Housirentz team about rental investment properties, site visits or consultation. Verified contact details for Housirentz Innovations Pvt. Ltd.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const user = await getCurrentUser();

  return (
    <>
      <section className="border-b border-line bg-surface/60">
        <div className="shell py-12 md:py-16">
          <div className="max-w-2xl">
            <p className="eyebrow">Contact</p>
            <h1 className="display-lg mt-4 balance">Get In Touch</h1>
            <p className="lede mt-4">
              Have a question or ready to invest? We&rsquo;d love to hear from you. Send a message and our advisor will get
              back to you shortly.
            </p>
          </div>
        </div>
      </section>

      <section className="shell py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            <LeadForm
              heading="Send a Message"
              description="Fill in the form and our advisor will get back to you shortly."
              defaultType="CONTACT"
              source="contact-page"
              defaults={{ name: user?.name, email: user?.email, phone: user?.phone ?? undefined }}
            />
          </div>

          <div className="space-y-6">
            <div className="rounded-[14px] border border-line bg-surface p-5">
              <p className="eyebrow-plain">Contact Details</p>
              <div className="mt-4 space-y-4 text-sm">
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-start gap-3 hover:text-forest">
                  <Phone className="mt-0.5 size-4 text-brass" />
                  <span>
                    <span className="block text-[0.65rem] uppercase tracking-[0.1em] text-ink-muted">Phone</span>
                    {SITE.phone}
                  </span>
                </a>
                <a href={`mailto:${SITE.email}`} className="flex items-start gap-3 hover:text-forest">
                  <Mail className="mt-0.5 size-4 text-brass" />
                  <span>
                    <span className="block text-[0.65rem] uppercase tracking-[0.1em] text-ink-muted">Email</span>
                    {SITE.email}
                  </span>
                </a>
                <a href={whatsappLink("Hi Housirentz, I have a question about rental investment.")} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-forest">
                  <MessageCircle className="mt-0.5 size-4 text-brass" />
                  <span>
                    <span className="block text-[0.65rem] uppercase tracking-[0.1em] text-ink-muted">WhatsApp</span>
                    Start a chat
                  </span>
                </a>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(SITE.address)}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-forest">
                  <MapPin className="mt-0.5 size-4 text-brass" />
                  <span>
                    <span className="block text-[0.65rem] uppercase tracking-[0.1em] text-ink-muted">Office Address</span>
                    {SITE.address}
                  </span>
                </a>
              </div>
              <p className="mt-2 text-xs text-ink-muted">{SITE.hours} · Sunday Closed</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-night text-paper py-20 md:py-28">
        <div className="shell grid gap-14 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="eyebrow text-brass-soft">Our Office Location</p>
            <h2 className="display-md mt-4 text-paper">Find Us</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-paper/60">
              Visit us at Dwarka, South West Delhi.
            </p>
            <div className="mt-6 rounded-[14px] border border-line bg-surface p-6">
              <p className="text-sm text-paper/70">{SITE.address}</p>
            </div>
          </div>
          <div className="rounded-[14px] border border-line bg-surface p-6 shadow-card">
            <p className="eyebrow-plain">Quick Links</p>
            <ul className="mt-4 space-y-3 text-sm text-paper/70">
              <li><Link href="/properties" className="hover:text-brass transition">Properties</Link></li>
              <li><Link href="/blog" className="hover:text-brass transition">Blog</Link></li>
              <li><Link href="/faq" className="hover:text-brass transition">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-brass transition">Contact</Link></li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
