import type { Metadata } from "next";
import { db } from "@/lib/db";
import { FaqManager } from "@/components/admin/faq-manager";

export const metadata: Metadata = { title: "FAQs" };

export default async function AdminFaqsPage() {
  const faqs = await db.faq.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <>
      <div className="mb-5">
        <p className="eyebrow">Content</p>
        <h1 className="mt-3 font-display text-3xl">FAQs.</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Answers shown on the public FAQ page and alongside project details. Keep every answer factual and
          free of invented approvals or legal promises.
        </p>
      </div>
      <FaqManager faqs={faqs} />
    </>
  );
}
