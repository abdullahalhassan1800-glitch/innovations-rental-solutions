import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertSameOrigin, ApiError, fromError, requireApiAdmin } from "@/lib/api";
import { developerSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const input = developerSchema.parse(await request.json());
    const slug = slugify(input.slug || input.name);
    const existing = await db.developer.findFirst({
      where: { OR: [{ name: input.name }, { slug }] },
      select: { id: true },
    });
    if (existing) throw new ApiError("A developer with this name or slug already exists", 409);

    const developer = await db.developer.create({
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
    return NextResponse.json({ developer, message: "Developer created" }, { status: 201 });
  } catch (error) {
    return fromError(error);
  }
}
