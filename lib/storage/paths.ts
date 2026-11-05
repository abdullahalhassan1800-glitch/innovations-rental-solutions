import path from "path";

/** Absolute directory used by the local storage adapter. */
export function localUploadDir() {
  const configured = process.env.UPLOAD_DIR;
  return configured ? path.resolve(configured) : path.join(process.cwd(), "storage", "uploads");
}
