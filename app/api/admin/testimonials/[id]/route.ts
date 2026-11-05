import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertSameOrigin, ApiError, fromError, requireApiAdmin } from "@/lib/api";
import { testimonialSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const { id } = await params;
    const existing = await db.testimonial.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new ApiError("Testimonial not found", 404);
    const input = testimonialSchema.parse(await request.json());
    const testimonial = await db.testimonial.update({ where: { id }, data: input });
    return NextResponse.json({ testimonial, message: "Testimonial updated" });
  } catch (error) {
    return fromError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const { id } = await params;
    await db.testimonial.delete({ where: { id } });
    return NextResponse.json({ message: "Testimonial deleted" });
  } catch (error) {
    return fromError(error);
  }
}
