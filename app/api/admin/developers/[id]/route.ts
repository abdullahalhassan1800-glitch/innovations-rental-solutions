import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertSameOrigin, ApiError, fromError, requireApiAdmin } from "@/lib/api";
import { developerSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const { id } = await params;
    const existing = await db.developer.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new ApiError("Developer not found", 404);

    const input = developerSchema.parse(await request.json());
    const slug = slugify(input.slug || input.name);
    const conflict = await db.developer.findFirst({
      where: { OR: [{ name: input.name }, { slug }], NOT: { id } },
      select: { id: true },
    });
    if (conflict) throw new ApiError("A developer with this name or slug already exists", 409);

    const developer = await db.developer.update({
      where: { id },
      data: {
        name: input.name,
        slug,
        description: input.description || null,
        establishedYear: input.establishedYear ?? null,
        website: input.website || null,
        logoUrl: input.logoUrl || null,
        isDemo: input.isDemo,
      },
    });
    return NextResponse.json({ developer, message: "Developer updated" });
  } catch (error) {
    return fromError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const { id } = await params;
    const projectCount = await db.project.count({ where: { developerId: id } });
    if (projectCount > 0) {
      throw new ApiError("Move or delete this developer's projects before deleting the developer", 409);
    }
    await db.developer.delete({ where: { id } });
    return NextResponse.json({ message: "Developer deleted" });
  } catch (error) {
    return fromError(error);
  }
}
