import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertSameOrigin, ApiError, fromError, requireApiAdmin } from "@/lib/api";
import { visitUpdateSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const { id } = await params;
    const input = visitUpdateSchema.parse(await request.json());
    const existing = await db.siteVisit.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new ApiError("Site visit not found", 404);
    const visit = await db.siteVisit.update({
      where: { id },
      data: { status: input.status },
      select: { id: true, status: true },
    });
    return NextResponse.json({ visit, message: "Site visit updated" });
  } catch (error) {
    return fromError(error);
  }
}
