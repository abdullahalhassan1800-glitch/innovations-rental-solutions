import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertSameOrigin, fromError, requireApiAdmin } from "@/lib/api";
import { faqSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const input = faqSchema.parse(await request.json());
    const faq = await db.faq.create({ data: input });
    return NextResponse.json({ faq, message: "FAQ created" }, { status: 201 });
  } catch (error) {
    return fromError(error);
  }
}
