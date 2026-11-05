import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertSameOrigin, ApiError, fromError, requireApiAdmin } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2, "Amenity name is required").max(80),
  icon: z.string().trim().max(60).optional(),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const input = schema.parse(await request.json());
    const existing = await db.amenity.findUnique({ where: { name: input.name }, select: { id: true } });
    if (existing) throw new ApiError("That amenity already exists", 409);
    const amenity = await db.amenity.create({
      data: { name: input.name, icon: input.icon || null },
    });
    return NextResponse.json({ amenity, message: "Amenity created" }, { status: 201 });
  } catch (error) {
    return fromError(error);
  }
}
