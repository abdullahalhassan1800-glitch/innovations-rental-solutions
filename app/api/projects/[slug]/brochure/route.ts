import { db } from "@/lib/db";
import { createBrochurePdf } from "@/lib/pdf";
import { notFound } from "next/navigation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const project = await db.project.findFirst({
    where: { slug, published: true, archived: false },
    include: {
      developer: { select: { name: true } },
      location: { select: { name: true } },
      amenities: { include: { amenity: { select: { name: true } } } },
    },
  });
  if (!project) notFound();

  const pdf = createBrochurePdf(project);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Innovations-${project.slug}-demo-brochure.pdf"`,
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
