import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertSameOrigin, fromError, getClientIp } from "@/lib/api";
import { leadSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/auth";

const DUPLICATE_WINDOW_MS = 10 * 60_000;
const LEAD_LIMIT = Number(process.env.LEAD_RATE_LIMIT) > 0 ? Number(process.env.LEAD_RATE_LIMIT) : 6;

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const ip = getClientIp(request);
    const limit = rateLimit(`lead:${ip}`, LEAD_LIMIT, 10 * 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "We have received several requests from this connection. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }

    const input = leadSchema.parse(await request.json());

    if (input.website) {
      return NextResponse.json({ success: true, message: "Thank you — your request has been received." });
    }

    const user = await getCurrentUser();

    if (input.projectId) {
      const project = await db.project.findFirst({
        where: { id: input.projectId, published: true, archived: false },
        select: { id: true, name: true },
      });
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
      input.projectName = project.name;
    }

    const recent = await db.inquiry.findFirst({
      where: {
        phone: input.phone,
        inquiryType: input.inquiryType,
        projectId: input.projectId || null,
        createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
      },
      select: { id: true },
    });

    if (recent) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        message: "We already have your request. The team will be in touch shortly.",
      });
    }

    const inquiry = await db.inquiry.create({
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email,
        projectId: input.projectId || null,
        projectName: input.projectName || null,
        inquiryType: input.inquiryType,
        message: input.message || null,
        source: input.source || "website",
        status: "NEW",
        assignedToId: user?.role === "AGENT" ? user.id : null,
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({
      success: true,
      id: inquiry.id,
      message: "Thank you — your request has been received. Our team will reach out soon.",
    });
  } catch (error) {
    return fromError(error);
  }
}
