#!/usr/bin/env node
/**
 * Mint a time-limited access link for the private preview.
 *
 *   node scripts/share-link.mjs                      # 15 minutes, production URL
 *   node scripts/share-link.mjs --minutes 45
 *   node scripts/share-link.mjs --hours 2 --base http://localhost:3000
 *   node scripts/share-link.mjs --days 3650 --label owner
 *
 * The signing secret is read from SHARE_SECRET, then AUTH_SECRET, from the
 * process environment or from .env in the project root.
 */
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

const VERSION = "v1";
const DEFAULT_BASE = "https://innovations-rental-solutions.vercel.app";

function readDotEnv() {
  try {
    const raw = readFileSync(path.join(process.cwd(), ".env"), "utf8");
    const values = {};
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
      if (match) values[match[1]] = match[2];
    }
    return values;
  } catch {
    return {};
  }
}

function parseArgs(argv) {
  const options = { minutes: 15, base: null, label: null, secret: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];
    switch (arg) {
      case "--minutes":
        options.minutes = Number(value);
        index += 1;
        break;
      case "--hours":
        options.minutes = Number(value) * 60;
        index += 1;
        break;
      case "--days":
        options.minutes = Number(value) * 24 * 60;
        index += 1;
        break;
      case "--base":
        options.base = value;
        index += 1;
        break;
      case "--label":
        options.label = value;
        index += 1;
        break;
      case "--secret":
        options.secret = value;
        index += 1;
        break;
      case "--help":
      case "-h":
        console.log(
          [
            "Usage: node scripts/share-link.mjs [options]",
            "",
            "  --minutes <n>   Link lifetime in minutes (default 15)",
            "  --hours <n>     Link lifetime in hours",
            "  --days <n>      Link lifetime in days",
            "  --base <url>    Site origin (default: production URL)",
            "  --label <text>  Note to print alongside the link",
            "  --secret <key>  Signing secret (default: SHARE_SECRET or AUTH_SECRET)",
          ].join("\n"),
        );
        process.exit(0);
        break;
      default:
        if (arg.startsWith("--")) {
          console.error(`Unknown option: ${arg}`);
          process.exit(1);
        }
    }
  }
  return options;
}

const options = parseArgs(process.argv.slice(2));
if (!Number.isFinite(options.minutes) || options.minutes <= 0) {
  console.error("Lifetime must be a positive number of minutes.");
  process.exit(1);
}

const env = readDotEnv();
const secret =
  options.secret || process.env.SHARE_SECRET || process.env.AUTH_SECRET || env.SHARE_SECRET || env.AUTH_SECRET;

if (!secret || secret.length < 16) {
  console.error("No signing secret found. Set AUTH_SECRET (or SHARE_SECRET) in .env.");
  process.exit(1);
}

const base = (options.base || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_BASE).replace(/\/+$/, "");
const expiresAt = Math.floor(Date.now() / 1000) + Math.round(options.minutes * 60);
const payload = `${VERSION}.${expiresAt}`;
const signature = createHmac("sha256", secret).update(payload).digest("base64url");
const token = `${payload}.${signature}`;
const link = `${base}/access?t=${token}`;

console.log();
console.log(options.label ? `Link (${options.label})` : "Link");
console.log(link);
console.log();
console.log(`Expires  ${new Date(expiresAt * 1000).toISOString()}  (in ${options.minutes} min)`);
console.log(`Base     ${base}`);
console.log();
