/**
 * Time-limited access links.
 *
 * A token looks like `v1.<expiry-in-seconds>.<hmac>`. The HMAC covers the
 * version and the expiry, so a visitor cannot extend the window by editing the
 * URL. The same token doubles as the access cookie value, which lets the
 * middleware validate it on the edge without touching the database.
 *
 * The signing secret is SHARE_SECRET when present, otherwise AUTH_SECRET.
 * `btoa` and `crypto.subtle` are available in both the Edge and Node runtimes.
 */

export const ACCESS_COOKIE = "innovations_access";
export const ACCESS_QUERY_PARAM = "t";

const VERSION = "v1";

/** Browsers silently cap cookie lifetimes at 400 days; keep the cookie valid that long at most. */
export const MAX_COOKIE_AGE = 400 * 24 * 60 * 60;

export type AccessTokenState = {
  expiresAt: number;
  expired: boolean;
};

function getSecret(): string | null {
  const secret = process.env.SHARE_SECRET || process.env.AUTH_SECRET;
  return secret && secret.length >= 16 ? secret : null;
}

function encodeBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

async function sign(payload: string): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return encodeBase64Url(new Uint8Array(signature));
}

/** Mint a token that stays valid for `ttlSeconds`. Returns null when no secret is configured. */
export async function createAccessToken(ttlSeconds: number): Promise<string | null> {
  const ttl = Math.max(1, Math.floor(ttlSeconds));
  const expiresAt = Math.floor(Date.now() / 1000) + ttl;
  const payload = `${VERSION}.${expiresAt}`;
  const signature = await sign(payload);
  return signature ? `${payload}.${signature}` : null;
}

/** Validate a token's signature and report whether it has already expired. */
export async function verifyAccessToken(
  token: string | null | undefined,
): Promise<AccessTokenState | null> {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== VERSION) return null;

  const expiresAt = Number(parts[1]);
  if (!Number.isFinite(expiresAt) || expiresAt <= 0) return null;

  const expected = await sign(`${VERSION}.${expiresAt}`);
  if (!expected || !safeEqual(expected, parts[2])) return null;

  return { expiresAt, expired: expiresAt * 1000 <= Date.now() };
}
