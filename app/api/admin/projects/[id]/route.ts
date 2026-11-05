import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertSameOrigin, ApiError, fromError, requireApiAdmin } from "@/lib/api";
import { projectSchema } from "@/lib/validation";
import { updateProject } from "@/lib/admin-projects";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const { id } = await params;
    const body = await request.json();

    if (typeof body?.action === "string") {
      const existing = await db.project.findUnique({ where: { id }, select: { id: true } });
      if (!existing) throw new ApiError("Project not found", 404);

      const data =
        body.action === "archive"
          ? { archived: true, published: false }
          : body.action === "restore"
            ? { archived: false }
            : body.action === "publish"
              ? { published: true, archived: false }
              : body.action === "unpublish"
                ? { published: false }
                : body.action === "feature"
                  ? { featured: true }
                  : body.action === "unfeature"
                    ? { featured: false }
                    : null;

      if (!data) throw new ApiError("Unknown action", 422);
      const project = await db.project.update({ where: { id }, data, select: { id: true } });
      return NextResponse.json({ project, message: "Project updated" });
    }

    const input = projectSchema.parse(body);
    try {
      const project = await updateProject(id, input);
      return NextResponse.json({ project, message: "Project updated" });
    } catch (error) {
      if (error instanceof Error && error.message.includes("slug")) {
        throw new ApiError(error.message, 409, "SLUG_TAKEN");
      }
      if (error instanceof Error && error.message === "Project not found") {
        throw new ApiError(error.message, 404);
      }
      throw error;
    }
  } catch (error) {
    return fromError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const { id } = await params;
    const permanent = new URL(request.url).searchParams.get("permanent") === "true";

    const existing = await db.project.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new ApiError("Project not found", 404);

    if (permanent) {
      await db.project.delete({ where: { id } });
      return NextResponse.json({ message: "Project permanently deleted" });
    }

    await db.project.update({ where: { id }, data: { archived: true, published: false } });
    return NextResponse.json({ message: "Project archived" });
  } catch (error) {
    return fromError(error);
  }
}
