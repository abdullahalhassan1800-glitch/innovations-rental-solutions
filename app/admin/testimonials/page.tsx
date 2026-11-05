import type { Metadata } from "next";
import { db } from "@/lib/db";
import { TestimonialManager } from "@/components/admin/testimonial-manager";

export const metadata: Metadata = { title: "Testimonials" };

export default async function AdminTestimonialsPage() {
  const testimonials = await db.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <div className="mb-5">
        <p className="eyebrow">Content</p>
        <h1 className="mt-3 font-display text-3xl">Testimonials.</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Curate the sample social proof shown on the homepage. All current testimonials are fictional
          demonstration copy.
        </p>
      </div>
      <TestimonialManager testimonials={testimonials} />
    </>
  );
}
