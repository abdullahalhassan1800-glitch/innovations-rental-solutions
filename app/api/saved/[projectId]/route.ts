import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertSameOrigin, fromError, requireApiUser } from "@/lib/api";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    assertSameOrigin(request);
    const user = await requireApiUser();
    const { projectId } = await params;

    const project = await db.project.findFirst({
      where: { id: projectId, published: true, archived: false },
      select: { id: true },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const existing = await db.savedProject.findUnique({
      where: { userId_projectId: { userId: user.id, projectId } },
    });

    if (existing) {
      await db.savedProject.delete({ where: { id: existing.id } });
      return NextResponse.json({ saved: false });
    }

    await db.savedProject.create({ data: { userId: user.id, projectId } });
    return NextResponse.json({ saved: true });
  } catch (error) {
    return fromError(error);
  }
}
