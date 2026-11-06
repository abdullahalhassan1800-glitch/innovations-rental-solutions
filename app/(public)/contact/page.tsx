import { Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth";
import { SITE } from "@/lib/constants";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Contact Innovations",
  description:
    "Contact the Innovations demonstration team about projects, site visits or the platform. Sample contact details for demonstration purposes.",
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
            <h1 className="display-lg mt-4 balance">Start a conversation<br />worth having.</h1>
            <p className="lede mt-4">
              Tell us what you are looking for and the team will come back with a considered shortlist.
              This is a demonstration platform, so all contact details and responses are illustrative.
            </p>
          </div>
        </div>
      </section>

      <section className="shell py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            <div className="rounded-[14px] border border-line bg-surface p-5">
              <p className="eyebrow-plain">Direct lines</p>
              <div className="mt-4 space-y-4 text-sm">
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-start gap-3 hover:text-forest">
                  <Phone className="mt-0.5 size-4 text-brass" />
                  <span><span className="block text-[0.65rem] uppercase tracking-[0.1em] text-ink-muted">Phone</span>{SITE.phone}</span>
                </a>
                <a href={`mailto:${SITE.email}`} className="flex items-start gap-3 hover:text-forest">
                  <Mail className="mt-0.5 size-4 text-brass" />
                  <span><span className="block text-[0.65rem] uppercase tracking-[0.1em] text-ink-muted">Email</span>{SITE.email}</span>
                </a>
                <a href={whatsappLink("Hi Innovations, I have a question about the sample platform.")} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-forest">
                  <MessageCircle className="mt-0.5 size-4 text-brass" />
                  <span><span className="block text-[0.65rem] uppercase tracking-[0.1em] text-ink-muted">WhatsApp</span>Start a chat</span>
                </a>
                <p className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 text-brass" />
                  <span><span className="block text-[0.65rem] uppercase tracking-[0.1em] text-ink-muted">Office</span>{SITE.address}</span>
                </p>
                <p className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 size-4 text-brass" />
                  <span><span className="block text-[0.65rem] uppercase tracking-[0.1em] text-ink-muted">Hours</span>{SITE.hours}</span>
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=77.333%2C28.535%2C77.373%2C28.565&layer=mapnik&marker=28.550%2C77.353"
                title="Innovations demonstration office location"
                loading="lazy"
                className="h-[240px] w-full border-0"
              />
              <div className="border-t border-line p-4">
                <p className="text-[0.72rem] text-ink-muted">Demonstration office pin. Not a real Innovations office.</p>
              </div>
            </div>

            <div className="rounded-[14px] border border-brass/30 bg-brass-pale/50 p-5">
              <p className="eyebrow-plain text-brass-soft">Prefer the assistant?</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Use the “Ask Innovations AI” button in the corner to search the database in English, Hindi or Hinglish — including voice input.
              </p>
              <Badge tone="brass" className="mt-3">Available on every page</Badge>
            </div>
          </div>

          <div>
            <LeadForm
              heading="Tell us what you're looking for."
              description="Share a brief, a preferred location or a project you have in mind. The form writes to the local sample database."
              defaultType="CONTACT"
              source="contact-page"
              defaults={{ name: user?.name, email: user?.email, phone: user?.phone ?? undefined }}
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-line bg-surface p-4">
              <p className="text-[0.78rem] text-ink-muted">Looking for something specific?</p>
              <div className="flex gap-2">
                <ButtonLink href="/projects" size="sm" variant="outline">Browse projects</ButtonLink>
                <ButtonLink href="/faq" size="sm" variant="ghost">FAQs</ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

