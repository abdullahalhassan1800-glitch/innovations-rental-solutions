import { readFile, stat } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { localUploadDir } from "@/lib/storage/paths";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

/**
 * Serves locally stored uploads. Next.js only serves files that existed in
 * /public at build time, so runtime uploads live outside /public and are
 * streamed through this route instead.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  if (!segments?.length || segments.length > 2) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (segments.some((segment) => !segment || segment.includes("..") || segment.includes("\\") || segment.includes("/"))) {
    return new NextResponse("Not found", { status: 404 });
  }

  const base = localUploadDir();
  const target = path.resolve(base, ...segments);
  if (target !== base && !target.startsWith(base + path.sep)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const extension = path.extname(target).toLowerCase();
  const contentType = CONTENT_TYPES[extension];
  if (!contentType) return new NextResponse("Not found", { status: 404 });

  try {
    const info = await stat(target);
    if (!info.isFile()) return new NextResponse("Not found", { status: 404 });
    const buffer = await readFile(target);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
