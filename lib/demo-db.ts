import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Vercel's deployment filesystem is read-only, but `/tmp` is writable. The
 * repository ships a seeded SQLite snapshot for the public demo, so copy it to
 * `/tmp` once per serverless instance before Prisma opens the database.
 *
 * PostgreSQL deployments are unaffected: this only runs on Vercel when the
 * configured database is a local SQLite file.
 */
export function prepareDemoDatabase() {
  if (!process.env.VERCEL) return;

  const configured = process.env.DATABASE_URL ?? "";
  if (configured && !configured.startsWith("file:")) return;

  const target = "/tmp/innovations-demo.db";
  const source = join(process.cwd(), "prisma", "demo.db");

  try {
    if (!existsSync(target) && existsSync(source)) {
      copyFileSync(source, target);
    }
    if (existsSync(target)) {
      process.env.DATABASE_URL = `file:${target}`;
    }
  } catch (error) {
    console.error("Unable to prepare the writable demo database", error);
  }
}
