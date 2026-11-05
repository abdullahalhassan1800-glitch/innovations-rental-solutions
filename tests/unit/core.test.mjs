import test from "node:test";
import assert from "node:assert/strict";
import { lib } from "./_jiti.mjs";

const { rateLimit, rateLimitResponse } = await lib("rate-limit.ts");
const { parseProjectParams, pageNumber } = await lib("search-params.ts");

test("rateLimit allows requests up to the limit then blocks", () => {
  const key = `test-${Math.random()}`;
  assert.deepEqual(rateLimit(key, 2, 60_000), { ok: true, remaining: 1, retryAfter: 0 });
  assert.deepEqual(rateLimit(key, 2, 60_000), { ok: true, remaining: 0, retryAfter: 0 });

  const blocked = rateLimit(key, 2, 60_000);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.remaining, 0);
  assert.ok(blocked.retryAfter >= 1);
});

test("rateLimit reopens after the window expires", async () => {
  const key = `window-${Math.random()}`;
  assert.equal(rateLimit(key, 1, 25).ok, true);
  assert.equal(rateLimit(key, 1, 25).ok, false);
  await new Promise((resolve) => setTimeout(resolve, 40));
  assert.equal(rateLimit(key, 1, 25).ok, true);
});

test("rateLimitResponse returns a 429 payload", () => {
  assert.deepEqual(rateLimitResponse(12), {
    status: 429,
    body: { error: "Too many attempts. Please wait a moment and try again.", retryAfter: 12 },
  });
});

test("parseProjectParams reads budget ranges", () => {
  const filters = parseProjectParams({
    budget: "5000000-7500000",
    location: "noida",
    bhk: "3",
    amenities: ["Gymnasium", "Spa"],
    sort: "price-asc",
  });
  assert.equal(filters.minPrice, 5_000_000);
  assert.equal(filters.maxPrice, 7_500_000);
  assert.equal(filters.location, "noida");
  assert.equal(filters.bhk, "3");
  assert.deepEqual(filters.amenities, ["Gymnasium", "Spa"]);
  assert.equal(filters.sort, "price-asc");
});

test("parseProjectParams applies locked type and ignores invalid numbers", () => {
  const filters = parseProjectParams({ propertyType: "RESIDENTIAL", minPrice: "-4", maxPrice: "abc" }, "COMMERCIAL");
  assert.equal(filters.propertyType, "COMMERCIAL");
  assert.equal(filters.minPrice, undefined);
  assert.equal(filters.maxPrice, undefined);
});

test("parseProjectParams truncates long search text and normalises amenities", () => {
  const filters = parseProjectParams({ q: "x".repeat(500), amenities: "Gymnasium" });
  assert.equal(filters.q.length, 100);
  assert.deepEqual(filters.amenities, ["Gymnasium"]);
});

test("pageNumber clamps invalid and negative pages", () => {
  assert.equal(pageNumber({ page: "3" }), 3);
  assert.equal(pageNumber({ page: "0" }), 1);
  assert.equal(pageNumber({ page: "-2" }), 1);
  assert.equal(pageNumber({ page: "abc" }), 1);
  assert.equal(pageNumber({}), 1);
});
