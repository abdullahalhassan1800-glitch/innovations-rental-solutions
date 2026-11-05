import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertSameOrigin, ApiError, fromError, requireApiAdmin } from "@/lib/api";
import { locationSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const input = locationSchema.parse(await request.json());
    const slug = slugify(input.slug || input.name);
    const existing = await db.location.findFirst({
      where: { OR: [{ name: input.name }, { slug }] },
      select: { id: true },
    });
    if (existing) throw new ApiError("A location with this name or slug already exists", 409);

    const location = await db.location.create({
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
    return NextResponse.json({ location, message: "Location created" }, { status: 201 });
  } catch (error) {
    return fromError(error);
  }
}
