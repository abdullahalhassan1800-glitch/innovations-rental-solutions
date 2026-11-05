import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertSameOrigin, ApiError, fromError, requireApiAdmin } from "@/lib/api";
import { faqSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const { id } = await params;
    const existing = await db.faq.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new ApiError("FAQ not found", 404);
    const input = faqSchema.parse(await request.json());
    const faq = await db.faq.update({ where: { id }, data: input });
    return NextResponse.json({ faq, message: "FAQ updated" });
  } catch (error) {
    return fromError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const { id } = await params;
    await db.faq.delete({ where: { id } });
    return NextResponse.json({ message: "FAQ deleted" });
  } catch (error) {
    return fromError(error);
  }
}
