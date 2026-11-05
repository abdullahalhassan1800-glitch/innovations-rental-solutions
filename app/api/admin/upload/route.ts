import { NextResponse } from "next/server";
import { assertSameOrigin, ApiError, fromError, requireApiAdmin } from "@/lib/api";
import { getStorage } from "@/lib/storage";
import { rateLimit } from "@/lib/rate-limit";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function hasValidSignature(buffer: Buffer, mime: string) {
  if (mime === "image/jpeg") return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mime === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mime === "image/webp") return buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
  if (mime === "image/avif") return buffer.subarray(4, 12).toString().includes("ftypavif");
  return false;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const ip = request.headers.get("x-forwarded-for") || "admin";
    if (!rateLimit(`upload:${ip}`, 40, 60_000).ok) {
      throw new ApiError("Too many uploads. Please wait a moment.", 429);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) throw new ApiError("Choose an image to upload", 422);
    if (file.size === 0) throw new ApiError("The selected file is empty", 422);
    if (file.size > MAX_BYTES) throw new ApiError("Images must be 5 MB or smaller", 413);
    if (!ALLOWED.has(file.type)) throw new ApiError("Use a JPG, PNG, WebP or AVIF image", 415);

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!hasValidSignature(buffer, file.type)) {
      throw new ApiError("The file does not look like a valid image", 415);
    }

    const result = await getStorage().put({
      buffer,
      filename: file.name || "upload",
      contentType: file.type,
    });

    return NextResponse.json({ ...result, size: file.size, type: file.type }, { status: 201 });
  } catch (error) {
    return fromError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    await requireApiAdmin();
    const key = new URL(request.url).searchParams.get("key");
    if (!key) throw new ApiError("Missing file key", 422);
    if (key.includes("..") || key.startsWith("/") || key.includes("\\")) {
      throw new ApiError("Invalid file key", 422);
    }
    await getStorage().delete(key);
    return NextResponse.json({ success: true });
  } catch (error) {
    return fromError(error);
  }
}
