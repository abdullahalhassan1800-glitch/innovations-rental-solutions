import test from "node:test";
import assert from "node:assert/strict";
import { lib } from "./_jiti.mjs";

const {
  normalisePhone,
  phoneSchema,
  leadSchema,
  registerSchema,
  siteVisitSchema,
  projectSchema,
  faqSchema,
  testimonialSchema,
  visitUpdateSchema,
} = await lib("validation.ts");

test("normalisePhone strips country code, leading zero and separators", () => {
  assert.equal(normalisePhone("+91 98765 43210"), "9876543210");
  assert.equal(normalisePhone("098765-43210"), "9876543210");
  assert.equal(normalisePhone("98765 43210"), "9876543210");
});

test("phoneSchema accepts Indian mobiles and rejects invalid numbers", () => {
  assert.equal(phoneSchema.parse("+91 98765 43210"), "9876543210");
  assert.equal(phoneSchema.safeParse("12345").success, false);
  assert.equal(phoneSchema.safeParse("5876543210").success, false);
  assert.equal(phoneSchema.safeParse("98765432101").success, false);
});

test("leadSchema requires consent and strips optional blank email", () => {
  const valid = leadSchema.safeParse({
    name: "Demo Buyer",
    phone: "9876543210",
    email: "",
    inquiryType: "CALLBACK",
    consent: true,
  });
  assert.equal(valid.success, true);
  assert.equal(valid.data.email, undefined);
  assert.equal(valid.data.phone, "9876543210");

  const noConsent = leadSchema.safeParse({ name: "Demo Buyer", phone: "9876543210" });
  assert.equal(noConsent.success, false);
});

test("leadSchema blocks honeypot submissions and bad email addresses", () => {
  const bot = leadSchema.safeParse({
    name: "Spam Bot",
    phone: "9876543210",
    website: "https://spam.example",
    consent: true,
  });
  assert.equal(bot.success, false);

  const badEmail = leadSchema.safeParse({
    name: "Demo Buyer",
    phone: "9876543210",
    email: "not-an-email",
    consent: true,
  });
  assert.equal(badEmail.success, false);
});

test("registerSchema enforces password strength and normalises email", () => {
  const ok = registerSchema.safeParse({
    name: "Demo User",
    email: "  DEMO@Example.com ",
    phone: "+91 98765 43210",
    password: "Demo12345",
  });
  assert.equal(ok.success, true);
  assert.equal(ok.data.email, "demo@example.com");

  assert.equal(
    registerSchema.safeParse({ name: "Demo", email: "a@b.com", password: "onlyletters" }).success,
    false,
  );
  assert.equal(
    registerSchema.safeParse({ name: "Demo", email: "a@b.com", password: "12345678" }).success,
    false,
  );
});

test("siteVisitSchema rejects past dates and accepts today", () => {
  // Compare in local time: the schema treats "today" as a local calendar day,
  // while toISOString() would shift to UTC and fail around midnight IST.
  const iso = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const today = new Date();

  const base = {
    name: "Demo Visitor",
    phone: "9876543210",
    projectId: "project_1",
    preferredTime: "11:00",
    consent: true,
  };

  assert.equal(siteVisitSchema.safeParse({ ...base, preferredDate: iso(yesterday) }).success, false);
  assert.equal(siteVisitSchema.safeParse({ ...base, preferredDate: iso(today) }).success, true);
  assert.equal(siteVisitSchema.safeParse({ ...base, preferredDate: "31/10/2026" }).success, false);
});

test("projectSchema validates a minimal project and applies defaults", () => {
  const parsed = projectSchema.safeParse({
    name: "Demo Residences",
    developerId: "dev_1",
    locationId: "loc_1",
    address: "Sector 132, Noida",
    propertyType: "RESIDENTIAL",
    category: "Apartment",
    startingPrice: "8500000",
    status: "NEW_LAUNCH",
    description: "A demonstration project record used only to validate admin form input.",
  });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.startingPrice, 8500000);
  assert.deepEqual(parsed.data.bhkConfigs, []);
  assert.equal(parsed.data.published, true);
  assert.equal(parsed.data.reraVerified, false);
});

test("projectSchema rejects bad slugs, prices and short descriptions", () => {
  const base = {
    name: "Demo Residences",
    developerId: "dev_1",
    locationId: "loc_1",
    address: "Sector 132, Noida",
    propertyType: "RESIDENTIAL",
    category: "Apartment",
    startingPrice: 8500000,
    status: "NEW_LAUNCH",
    description: "A demonstration project record used only to validate admin form input.",
  };
  assert.equal(projectSchema.safeParse({ ...base, slug: "Bad Slug" }).success, false);
  assert.equal(projectSchema.safeParse({ ...base, startingPrice: 0 }).success, false);
  assert.equal(projectSchema.safeParse({ ...base, description: "Too short" }).success, false);
  assert.equal(projectSchema.safeParse({ ...base, status: "SOLD_OUT" }).success, false);
});

test("content schemas enforce minimum lengths", () => {
  assert.equal(faqSchema.safeParse({ question: "Why?", answer: "Short" }).success, false);
  assert.equal(
    faqSchema.safeParse({
      question: "Is this a demo?",
      answer: "Yes, every listing on this site is demonstration data.",
    }).success,
    true,
  );
  assert.equal(testimonialSchema.safeParse({ name: "A", quote: "Too short" }).success, false);
  assert.equal(visitUpdateSchema.safeParse({ status: "CONFIRMED" }).success, true);
  assert.equal(visitUpdateSchema.safeParse({ status: "DONE" }).success, false);
});
