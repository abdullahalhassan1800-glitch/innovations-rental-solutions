import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertSameOrigin, fromError, requireApiAdmin } from "@/lib/api";
import { testimonialSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const input = testimonialSchema.parse(await request.json());
    const testimonial = await db.testimonial.create({ data: input });
    return NextResponse.json({ testimonial, message: "Testimonial created" }, { status: 201 });
  } catch (error) {
    return fromError(error);
  }
}
