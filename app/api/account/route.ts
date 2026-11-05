import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { assertSameOrigin, fromError, requireApiUser } from "@/lib/api";
import { passwordChangeSchema, profileSchema } from "@/lib/validation";

export async function GET() {
  try {
    const user = await requireApiUser();
    const full = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
    return NextResponse.json({ user: full });
  } catch (error) {
    return fromError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const session = await requireApiUser();
    const body = await request.json();

    if (body?.currentPassword || body?.newPassword) {
      const input = passwordChangeSchema.parse(body);
      const user = await db.user.findUnique({ where: { id: session.id } });
      if (!user || !(await verifyPassword(input.currentPassword, user.passwordHash))) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
      await db.user.update({
        where: { id: session.id },
        data: { passwordHash: await hashPassword(input.newPassword) },
      });
      return NextResponse.json({ success: true, message: "Password updated" });
    }

    const input = profileSchema.parse(body);
    const user = await db.user.update({
      where: { id: session.id },
      data: { name: input.name, phone: input.phone },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
    return NextResponse.json({ user, message: "Profile updated" });
  } catch (error) {
    return fromError(error);
  }
}
