import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertSameOrigin, ApiError, fromError, requireApiAdmin } from "@/lib/api";
import { leadUpdateSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const admin = await requireApiAdmin();
    const { id } = await params;
    const input = leadUpdateSchema.parse(await request.json());

    const inquiry = await db.inquiry.findUnique({ where: { id }, select: { id: true } });
    if (!inquiry) throw new ApiError("Lead not found", 404);

    if (input.assignedToId) {
      const agent = await db.user.findFirst({
        where: { id: input.assignedToId, isActive: true, role: { in: ["ADMIN", "AGENT"] } },
        select: { id: true },
      });
      if (!agent) throw new ApiError("Choose an active agent or admin", 422);
    }

    const updated = await db.$transaction(async (tx) => {
      if (input.note) {
        await tx.leadNote.create({
          data: { inquiryId: id, authorId: admin.id, note: input.note },
        });
      }
      return tx.inquiry.update({
        where: { id },
        data: {
          ...(input.status ? { status: input.status } : {}),
          ...(input.assignedToId !== undefined ? { assignedToId: input.assignedToId || null } : {}),
        },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          notes: { orderBy: { createdAt: "desc" } },
        },
      });
    });

    return NextResponse.json({ lead: updated, message: "Lead updated" });
  } catch (error) {
    return fromError(error);
  }
}
