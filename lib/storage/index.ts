import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { localUploadDir } from "./paths";

export type StoredFile = { url: string; key: string };

export interface StorageAdapter {
  id: string;
  put(file: { buffer: Buffer; filename: string; contentType: string }): Promise<StoredFile>;
  delete(key: string): Promise<void>;
}

class LocalStorage implements StorageAdapter {
  id = "local";

  async put({ buffer, filename }: { buffer: Buffer; filename: string; contentType: string }) {
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
    const key = `${Date.now()}-${randomUUID().slice(0, 8)}-${safe}`;
    const dir = localUploadDir();
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, key), buffer);
    return { url: `/media/${key}`, key };
  }

  async delete(key: string) {
    const base = localUploadDir();
    const target = path.resolve(base, path.basename(key));
    if (!target.startsWith(base + path.sep)) throw new Error("Invalid upload path");
    try {
      await unlink(target);
    } catch {
      // Ignore missing files — deletion is idempotent.
    }
  }
}

class S3Storage implements StorageAdapter {
  id = "s3";
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    const bucket = process.env.S3_BUCKET;
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    if (!bucket || !accessKeyId || !secretAccessKey) {
      throw new Error("S3 storage requires S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY");
    }
    this.bucket = bucket;
    this.publicUrl = (process.env.S3_PUBLIC_URL || "").replace(/\/$/, "");
    this.client = new S3Client({
      region: process.env.S3_REGION || "auto",
      ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT } : {}),
      forcePathStyle: Boolean(process.env.S3_ENDPOINT),
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async put({ buffer, filename, contentType }: { buffer: Buffer; filename: string; contentType: string }) {
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
    const key = `uploads/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safe}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    const base = this.publicUrl || `${process.env.S3_ENDPOINT || ""}/${this.bucket}`;
    return { url: `${base.replace(/\/$/, "")}/${key}`, key };
  }

  async delete(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}

export function getStorage(): StorageAdapter {
  if ((process.env.STORAGE_DRIVER || "local").toLowerCase() === "s3") return new S3Storage();
  return new LocalStorage();
}
