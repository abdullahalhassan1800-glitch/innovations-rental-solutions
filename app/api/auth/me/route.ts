import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { fromError } from "@/lib/api";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user });
  } catch (error) {
    return fromError(error);
  }
}
