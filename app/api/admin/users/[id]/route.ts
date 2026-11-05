import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertSameOrigin, ApiError, fromError, requireApiAdmin } from "@/lib/api";
import { hashPassword } from "@/lib/auth";
import { userAdminSchema, changePasswordAdminSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const current = await requireApiAdmin();
    const { id } = await params;
    const body = await request.json();

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) throw new ApiError("User not found", 404);

    if (body?.password) {
      const input = changePasswordAdminSchema.parse(body);
      await db.user.update({ where: { id }, data: { passwordHash: await hashPassword(input.password) } });
      return NextResponse.json({ message: "Password reset" });
    }

    const input = userAdminSchema.parse(body);
    if (id === current.id && input.isActive === false) {
      throw new ApiError("You cannot deactivate your own account", 422);
    }
    if (id === current.id && input.role && input.role !== "ADMIN") {
      throw new ApiError("You cannot remove your own admin role", 422);
    }

    if (existing.role === "ADMIN" && (input.role !== undefined && input.role !== "ADMIN" || input.isActive === false)) {
      const activeAdmins = await db.user.count({ where: { role: "ADMIN", isActive: true } });
      if (activeAdmins <= 1) throw new ApiError("At least one active admin is required", 422);
    }

    const user = await db.user.update({
      where: { id },
      data: {
        ...(input.role ? { role: input.role } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
    return NextResponse.json({ user, message: "User updated" });
  } catch (error) {
    return fromError(error);
  }
}
