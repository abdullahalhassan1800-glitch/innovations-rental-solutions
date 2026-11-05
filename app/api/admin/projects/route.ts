import { NextResponse } from "next/server";
import { assertSameOrigin, ApiError, fromError, requireApiAdmin } from "@/lib/api";
import { projectSchema } from "@/lib/validation";
import { createProject } from "@/lib/admin-projects";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const input = projectSchema.parse(await request.json());
    try {
      const project = await createProject(input);
      return NextResponse.json({ project, message: "Project created" }, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.message.includes("slug")) {
        throw new ApiError(error.message, 409, "SLUG_TAKEN");
      }
      throw error;
    }
  } catch (error) {
    return fromError(error);
  }
}
