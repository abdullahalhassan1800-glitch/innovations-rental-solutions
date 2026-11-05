/**
 * End-to-end API smoke checks against a running Innovations server.
 *
 *   npm run start            # in another terminal
 *   node tests/e2e/api-smoke.mjs
 *
 * Uses the seeded demo accounts and demo database. The script creates and
 * removes a temporary project, user and upload; existing demo data is not
 * modified except for one saved-project toggle that is reverted.
 */
import assert from "node:assert/strict";

const BASE = (process.env.SMOKE_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const ORIGIN = BASE;
const ADMIN = { email: "admin@innovations.demo", password: "Admin@12345" };
const BUYER = { email: "demo@innovations.demo", password: "Demo@12345" };
const RUN = Date.now();

process.loadEnvFile(new URL("../../.env", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));

const { PrismaClient } = await import("@prisma/client");
const db = new PrismaClient();

let passed = 0;
const failures = [];

async function check(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ✔ ${name}`);
  } catch (error) {
    failures.push({ name, error });
    console.error(`  ✖ ${name}\n    ${error.message}`);
  }
}

function cookieFrom(response) {
  const setCookies = response.headers.getSetCookie?.() ?? [];
  const raw = setCookies.find((value) => value.startsWith("innovations_session="));
  return raw ? raw.split(";")[0] : null;
}

async function login(credentials) {
  const response = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) throw new Error(`login failed for ${credentials.email}: ${response.status}`);
  const cookie = cookieFrom(response);
  assert.ok(cookie, "login should set a session cookie");
  return { cookie, json: await response.json() };
}

async function json(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`expected JSON, received ${response.status}: ${text.slice(0, 160)}`);
  }
}

const publishedProject = await db.project.findFirst({
  where: { published: true, archived: false },
  include: { location: true, developer: true, images: { take: 1 } },
  orderBy: { createdAt: "asc" },
});
const secondProject = await db.project.findFirst({
  where: { published: true, archived: false, id: { not: publishedProject.id } },
  orderBy: { createdAt: "asc" },
});
assert.ok(publishedProject && secondProject, "seed data is required before running smoke checks");

const [developer, location] = await Promise.all([
  db.developer.findFirst(),
  db.location.findFirst(),
]);

console.log(`\nInnovations API smoke — ${BASE}\n`);

console.log("Public pages");
for (const path of [
  "/",
  "/projects",
  "/projects?location=noida&bhk=3&sort=price-asc",
  `/projects/${publishedProject.slug}`,
  "/residential",
  "/commercial",
  "/location/noida",
  "/location/greater-noida",
  "/location/noida-extension",
  "/compare",
  "/about",
  "/contact",
  "/faq",
  "/privacy-policy",
  "/terms",
  "/login",
  "/register",
  "/sitemap.xml",
  "/robots.txt",
]) {
  await check(`GET ${path}`, async () => {
    const response = await fetch(`${BASE}${path}`);
    assert.equal(response.status, 200, `expected 200, got ${response.status}`);
    const html = await response.text();
    if (!path.endsWith(".xml") && !path.endsWith(".txt")) {
      assert.ok(html.length > 500, "response should contain a page");
    }
  });
}

await check("unknown page returns the custom 404", async () => {
  const response = await fetch(`${BASE}/definitely-not-a-real-page`);
  assert.equal(response.status, 404);
  const html = await response.text();
  assert.match(html, /doesn.t exist|not found/i);
});

await check("security headers are present", async () => {
  const response = await fetch(`${BASE}/`);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.ok(response.headers.get("referrer-policy"));
  assert.equal(response.headers.get("x-powered-by"), null);
});

await check("sitemap lists the seeded project and locations", async () => {
  const response = await fetch(`${BASE}/sitemap.xml`);
  const xml = await response.text();
  assert.match(xml, new RegExp(`/projects/${publishedProject.slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  assert.match(xml, /\/location\/noida/);
  assert.doesNotMatch(xml, /\/admin/);
});

await check("robots.txt disallows private areas", async () => {
  const response = await fetch(`${BASE}/robots.txt`);
  const text = await response.text();
  assert.match(text, /Disallow: \/admin/);
  assert.match(text, /Disallow: \/dashboard/);
  assert.match(text, /Sitemap:/);
});

console.log("\nRoute protection");
await check("dashboard redirects anonymous visitors to login", async () => {
  const response = await fetch(`${BASE}/dashboard`, { redirect: "manual" });
  assert.equal(response.status, 307);
  assert.match(response.headers.get("location") ?? "", /\/login\?next=%2Fdashboard/);
});

await check("admin redirects anonymous visitors to login", async () => {
  const response = await fetch(`${BASE}/admin`, { redirect: "manual" });
  assert.equal(response.status, 307);
  assert.match(response.headers.get("location") ?? "", /\/login/);
});

console.log("\nAuthentication");
let buyerCookie = null;
let adminCookie = null;
let tempUserId = null;

await check("buyer can sign in and load the dashboard", async () => {
  const result = await login(BUYER);
  buyerCookie = result.cookie;
  assert.equal(result.json.user.role, "USER");
  const dashboard = await fetch(`${BASE}/dashboard`, { headers: { cookie: buyerCookie } });
  assert.equal(dashboard.status, 200);
  assert.match(await dashboard.text(), /dashboard/i);
});

await check("buyer cannot open the admin area", async () => {
  const response = await fetch(`${BASE}/admin`, {
    headers: { cookie: buyerCookie },
    redirect: "manual",
  });
  assert.equal(response.status, 307);
  assert.match(response.headers.get("location") ?? "", /\/dashboard\?error=forbidden/);
});

await check("wrong password is rejected", async () => {
  const response = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify({ email: BUYER.email, password: "wrong-password" }),
  });
  assert.equal(response.status, 401);
});

await check("registration creates a user and session, then cleans up", async () => {
  const email = `smoke-${RUN}@example.com`;
  const response = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify({
      name: "Smoke Test",
      email,
      phone: "9876543210",
      password: "SmokeTest123",
    }),
  });
  assert.equal(response.status, 201);
  const body = await json(response);
  tempUserId = body.user.id;
  const cookie = cookieFrom(response);
  assert.ok(cookie);
  const dashboard = await fetch(`${BASE}/dashboard`, { headers: { cookie } });
  assert.equal(dashboard.status, 200);
});

await check("admin can sign in and load the admin area", async () => {
  const result = await login(ADMIN);
  adminCookie = result.cookie;
  assert.equal(result.json.user.role, "ADMIN");
  for (const path of ["/admin", "/admin/projects", "/admin/leads", "/admin/site-visits", "/admin/users"]) {
    const response = await fetch(`${BASE}${path}`, { headers: { cookie: adminCookie } });
    assert.equal(response.status, 200, `${path} should load`);
  }
});

await check("administrator endpoints reject anonymous requests", async () => {
  const response = await fetch(`${BASE}/api/admin/projects`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify({}),
  });
  assert.equal(response.status, 401);
});

console.log("\nLeads and site visits");
const leadPhone = `98${String(RUN).slice(-8)}`;
let leadId = null;

await check("lead form stores a valid inquiry", async () => {
  const response = await fetch(`${BASE}/api/leads`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify({
      name: "Smoke Lead",
      phone: leadPhone,
      email: "smoke-lead@example.com",
      projectId: publishedProject.id,
      inquiryType: "CALLBACK",
      message: "Runtime smoke test inquiry.",
      consent: true,
    }),
  });
  assert.equal(response.status, 200);
  const body = await json(response);
  assert.equal(body.success, true);
  leadId = body.id;
});

await check("duplicate lead submissions are collapsed", async () => {
  const response = await fetch(`${BASE}/api/leads`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify({
      name: "Smoke Lead",
      phone: leadPhone,
      projectId: publishedProject.id,
      inquiryType: "CALLBACK",
      consent: true,
    }),
  });
  assert.equal(response.status, 200);
  const body = await json(response);
  assert.equal(body.duplicate, true);
});

await check("lead without consent is rejected", async () => {
  const response = await fetch(`${BASE}/api/leads`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify({ name: "No Consent", phone: "9876500000", consent: false }),
  });
  assert.equal(response.status, 422);
});

await check("invalid phone is rejected", async () => {
  const response = await fetch(`${BASE}/api/leads`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify({ name: "Bad Phone", phone: "12345", consent: true }),
  });
  assert.equal(response.status, 422);
});

await check("site visit creates a visit and an inquiry", async () => {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  const response = await fetch(`${BASE}/api/site-visits`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify({
      name: "Smoke Visitor",
      phone: leadPhone,
      projectId: publishedProject.id,
      preferredDate: date.toISOString().slice(0, 10),
      preferredTime: "11:00",
      message: "Runtime smoke test visit.",
      consent: true,
    }),
  });
  assert.equal(response.status, 200);
  const body = await json(response);
  assert.equal(body.success, true);
  const visit = await db.siteVisit.findUnique({ where: { id: body.id } });
  assert.ok(visit);
});

await check("site visit rejects a past date", async () => {
  const response = await fetch(`${BASE}/api/site-visits`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify({
      name: "Past Visitor",
      phone: "9876500001",
      projectId: publishedProject.id,
      preferredDate: "2020-01-01",
      preferredTime: "11:00",
      consent: true,
    }),
  });
  assert.equal(response.status, 422);
});

await check("admin can view the new lead without exposing it publicly", async () => {
  const page = await fetch(`${BASE}/admin/leads/${leadId}`, { headers: { cookie: adminCookie } });
  assert.equal(page.status, 200);
  const html = await page.text();
  assert.match(html, /Smoke Lead/);
  const anonymous = await fetch(`${BASE}/admin/leads/${leadId}`, { redirect: "manual" });
  assert.equal(anonymous.status, 307);
});

console.log("\nSaved projects");
await check("buyer can toggle a saved project", async () => {
  const first = await fetch(`${BASE}/api/saved/${publishedProject.id}`, {
    method: "POST",
    headers: { origin: ORIGIN, cookie: buyerCookie },
  });
  assert.equal(first.status, 200);
  const firstBody = await json(first);

  const second = await fetch(`${BASE}/api/saved/${publishedProject.id}`, {
    method: "POST",
    headers: { origin: ORIGIN, cookie: buyerCookie },
  });
  assert.equal(second.status, 200);
  const secondBody = await json(second);
  assert.notEqual(firstBody.saved, secondBody.saved);

  const saved = await fetch(`${BASE}/dashboard/saved`, { headers: { cookie: buyerCookie } });
  assert.equal(saved.status, 200);
});

await check("anonymous saved toggle is rejected", async () => {
  const response = await fetch(`${BASE}/api/saved/${publishedProject.id}`, {
    method: "POST",
    headers: { origin: ORIGIN },
  });
  assert.equal(response.status, 401);
});

console.log("\nAI assistant");
await check("English search returns database-grounded cards", async () => {
  const response = await fetch(`${BASE}/api/ai/chat`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify({ message: "Show me 3 BHK flats in Noida Extension under 1.5 Cr" }),
  });
  assert.equal(response.status, 200);
  const body = await json(response);
  assert.equal(body.language, "en");
  assert.ok(Array.isArray(body.projects));
  for (const card of body.projects) {
    const record = await db.project.findUnique({ where: { id: card.id } });
    assert.ok(record, `AI returned unknown project ${card.id}`);
    assert.equal(card.startingPrice, record.startingPrice);
  }
});

await check("Hindi requests are answered in Hindi", async () => {
  const response = await fetch(`${BASE}/api/ai/chat`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify({ message: "मुझे नोएडा में 2 बीएचके फ्लैट चाहिए" }),
  });
  assert.equal(response.status, 200);
  const body = await json(response);
  assert.equal(body.language, "hi");
  assert.ok(body.speech && /[\u0900-\u097F]/.test(body.speech), "expected a Devanagari speech script");
});

await check("spoken Hinglish budgets and cheapest sorting are applied", async () => {
  const response = await fetch(`${BASE}/api/ai/chat`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify({ message: "noida extension mein pachattar lakh tak sasta 2 bhk chahiye" }),
  });
  assert.equal(response.status, 200);
  const body = await json(response);
  assert.equal(body.language, "hinglish");
  assert.equal(body.intent.maxPrice, 7_500_000);
  assert.equal(body.intent.sort, "price-asc");
  const prices = body.projects.map((card) => card.startingPrice);
  assert.deepEqual(prices, [...prices].sort((a, b) => a - b), "projects should be cheapest first");
  assert.ok(body.speech && body.speech.includes("se shuru"), "expected a Hinglish speech script");
});

await check("comparison requests return a comparison table", async () => {
  const response = await fetch(`${BASE}/api/ai/chat`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify({ message: `Compare ${publishedProject.name} and ${secondProject.name}` }),
  });
  assert.equal(response.status, 200);
  const body = await json(response);
  assert.ok(body.comparison, "expected a comparison table");
  assert.ok(body.comparison.rows.length > 2);
});

await check("AI rate limiting and validation work", async () => {
  const empty = await fetch(`${BASE}/api/ai/chat`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify({ message: "" }),
  });
  assert.equal(empty.status, 422);
});

console.log("\nAdmin CRUD and uploads");
let createdProject = null;
let uploadedKey = null;

await check("admin can create, feature, archive and delete a project", async () => {
  const slug = `smoke-project-${RUN}`;
  const create = await fetch(`${BASE}/api/admin/projects`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN, cookie: adminCookie },
    body: JSON.stringify({
      name: `Smoke Project ${RUN}`,
      slug,
      developerId: developer.id,
      locationId: location.id,
      address: "Sector 132, Noida, Uttar Pradesh",
      propertyType: "RESIDENTIAL",
      category: "Apartment",
      startingPrice: 7500000,
      maxPrice: 9500000,
      bhkConfigs: ["2", "3"],
      status: "NEW_LAUNCH",
      description: "Temporary project created by the runtime smoke test. This record is removed at the end.",
      reraNumber: "SHOULD-NOT-BE-SAVED",
      reraVerified: false,
      published: true,
      isDemo: true,
    }),
  });
  assert.equal(create.status, 201);
  createdProject = (await json(create)).project;
  const storedProject = await db.project.findUnique({ where: { id: createdProject.id } });
  assert.ok(storedProject);
  assert.equal(storedProject.reraNumber, null, "unverified RERA numbers must be discarded");

  const publicPage = await fetch(`${BASE}/projects/${slug}`);
  assert.equal(publicPage.status, 200);

  const feature = await fetch(`${BASE}/api/admin/projects/${createdProject.id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", origin: ORIGIN, cookie: adminCookie },
    body: JSON.stringify({ action: "feature" }),
  });
  assert.equal(feature.status, 200);

  const archive = await fetch(`${BASE}/api/admin/projects/${createdProject.id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", origin: ORIGIN, cookie: adminCookie },
    body: JSON.stringify({ action: "archive" }),
  });
  assert.equal(archive.status, 200);
  const archivedPage = await fetch(`${BASE}/projects/${slug}`);
  const archivedHtml = await archivedPage.text();
  assert.equal(archivedHtml.includes(`Smoke Project ${RUN}`), false, "archived project must not be public");
  assert.match(archivedHtml, /doesn.t exist|page not found|404/i);

  const remove = await fetch(`${BASE}/api/admin/projects/${createdProject.id}?permanent=true`, {
    method: "DELETE",
    headers: { origin: ORIGIN, cookie: adminCookie },
  });
  assert.equal(remove.status, 200);
  assert.equal(await db.project.findUnique({ where: { id: createdProject.id } }), null);
});

await check("upload accepts a real PNG and rejects disguised files", async () => {
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  const form = new FormData();
  form.append("file", new Blob([png], { type: "image/png" }), "smoke.png");
  const response = await fetch(`${BASE}/api/admin/upload`, {
    method: "POST",
    headers: { origin: ORIGIN, cookie: adminCookie },
    body: form,
  });
  assert.equal(response.status, 201);
  const body = await json(response);
  uploadedKey = body.key;
  assert.match(body.url, /^\/media\//);
  const served = await fetch(`${BASE}${body.url}`);
  assert.equal(served.status, 200);

  const fake = new FormData();
  fake.append("file", new Blob([Buffer.from("<script>alert(1)</script>")], { type: "image/png" }), "fake.png");
  const rejected = await fetch(`${BASE}/api/admin/upload`, {
    method: "POST",
    headers: { origin: ORIGIN, cookie: adminCookie },
    body: fake,
  });
  assert.equal(rejected.status, 415);
});

await check("brochure endpoint returns a PDF", async () => {
  const response = await fetch(`${BASE}/api/projects/${publishedProject.slug}/brochure`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /application\/pdf/);
  assert.ok((await response.arrayBuffer()).byteLength > 500);
});

console.log("\nCleanup");
await check("temporary data is removed", async () => {
  if (uploadedKey) {
    const response = await fetch(`${BASE}/api/admin/upload?key=${encodeURIComponent(uploadedKey)}`, {
      method: "DELETE",
      headers: { origin: ORIGIN, cookie: adminCookie },
    });
    assert.equal(response.status, 200);
  }
  if (leadId) await db.inquiry.deleteMany({ where: { phone: leadPhone } });
  if (tempUserId) await db.user.delete({ where: { id: tempUserId } });
});

await db.$disconnect();

console.log(`\n${passed} checks passed, ${failures.length} failed.`);
if (failures.length) process.exitCode = 1;
