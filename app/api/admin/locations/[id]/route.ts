import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertSameOrigin, ApiError, fromError, requireApiAdmin } from "@/lib/api";
import { locationSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const { id } = await params;
    const existing = await db.location.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new ApiError("Location not found", 404);

    const input = locationSchema.parse(await request.json());
    const slug = slugify(input.slug || input.name);
    const conflict = await db.location.findFirst({
      where: { OR: [{ name: input.name }, { slug }], NOT: { id } },
      select: { id: true },
    });
    if (conflict) throw new ApiError("A location with this name or slug already exists", 409);

    const location = await db.location.update({
      where: { id },
      data: {
        name: input.name,
        slug,
        city: input.city,
        state: input.state,
        description: input.description || null,
        imageUrl: input.imageUrl || null,
        highlights: JSON.stringify(input.highlights),
        sortOrder: input.sortOrder,
      },
    });
    return NextResponse.json({ location, message: "Location updated" });
  } catch (error) {
    return fromError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const { id } = await params;
    const projectCount = await db.project.count({ where: { locationId: id } });
    if (projectCount > 0) {
      throw new ApiError("Move or delete this location's projects before deleting the location", 409);
    }
    await db.location.delete({ where: { id } });
    return NextResponse.json({ message: "Location deleted" });
  } catch (error) {
    return fromError(error);
  }
}
