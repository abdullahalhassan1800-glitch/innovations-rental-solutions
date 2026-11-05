import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertSameOrigin, ApiError, fromError, requireApiAdmin } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2, "Amenity name is required").max(80),
  icon: z.string().trim().max(60).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const { id } = await params;
    const existing = await db.amenity.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new ApiError("Amenity not found", 404);
    const input = schema.parse(await request.json());
    const conflict = await db.amenity.findFirst({
      where: { name: input.name, NOT: { id } },
      select: { id: true },
    });
    if (conflict) throw new ApiError("That amenity already exists", 409);
    const amenity = await db.amenity.update({
      where: { id },
      data: { name: input.name, icon: input.icon || null },
    });
    return NextResponse.json({ amenity, message: "Amenity updated" });
  } catch (error) {
    return fromError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const { id } = await params;
    await db.amenity.delete({ where: { id } });
    return NextResponse.json({ message: "Amenity deleted" });
  } catch (error) {
    return fromError(error);
  }
}
