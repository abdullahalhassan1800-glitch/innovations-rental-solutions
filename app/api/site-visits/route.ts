import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertSameOrigin, fromError, getClientIp } from "@/lib/api";
import { siteVisitSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/auth";

const VISIT_LIMIT = Number(process.env.SITE_VISIT_RATE_LIMIT) > 0 ? Number(process.env.SITE_VISIT_RATE_LIMIT) : 5;

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const ip = getClientIp(request);
    const limit = rateLimit(`visit:${ip}`, VISIT_LIMIT, 15 * 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many site-visit requests from this connection. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }

    const input = siteVisitSchema.parse(await request.json());
    if (input.website) {
      return NextResponse.json({ success: true, message: "Thank you — your request has been received." });
    }

    const project = await db.project.findFirst({
      where: { id: input.projectId, published: true, archived: false },
      select: { id: true, name: true },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const user = await getCurrentUser();

    const recent = await db.siteVisit.findFirst({
      where: {
        phone: input.phone,
        projectId: input.projectId,
        createdAt: { gte: new Date(Date.now() - 60 * 60_000) },
      },
      select: { id: true },
    });
    if (recent) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        message: "Your site-visit request is already with the team. We will confirm shortly.",
      });
    }

    const preferredDate = new Date(`${input.preferredDate}T00:00:00.000Z`);

    const visit = await db.$transaction(async (tx) => {
      const created = await tx.siteVisit.create({
        data: {
          projectId: project.id,
          userId: user?.id ?? null,
          name: input.name,
          phone: input.phone,
          email: input.email,
          preferredDate,
          preferredTime: input.preferredTime,
          message: input.message || null,
          status: "PENDING",
        },
        select: { id: true },
      });

      await tx.inquiry.create({
        data: {
          name: input.name,
          phone: input.phone,
          email: input.email,
          projectId: project.id,
          projectName: project.name,
          inquiryType: "SITE_VISIT",
          message:
            input.message ||
            `Site visit requested for ${input.preferredDate} (${input.preferredTime}).`,
          source: "site-visit-form",
          status: "NEW",
        },
      });

      return created;
    });

    return NextResponse.json({
      success: true,
      id: visit.id,
      message: "Site visit requested. The team will confirm your slot shortly.",
    });
  } catch (error) {
    return fromError(error);
  }
}
