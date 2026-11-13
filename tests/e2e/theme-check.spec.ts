import { expect, test } from "@playwright/test";

// Palette reference
const CHARCOAL = "rgb(28, 27, 32)"; // #1C1B20 primary background
const SURFACE = "rgb(37, 33, 48)"; // #252130 cards
const ACCENT = "rgb(124, 92, 232)"; // #7C5CE8 dark violet accent
const TEXT = "rgb(255, 255, 255)"; // #FFFFFF

test("body uses charcoal background and white text", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const body = page.locator("body");
  await expect(body).toHaveCSS("background-color", CHARCOAL);
  await expect(body).toHaveCSS("color", TEXT);
});

test("eyebrow accent uses violet #A78BFA", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const eyebrow = page.locator(".eyebrow").first();
  await expect(eyebrow).toBeVisible();
  await expect(eyebrow).toHaveCSS("color", ACCENT);
});

test("cards use purple-tinted surface #252130", async ({ page }) => {
  await page.goto("/about", { waitUntil: "domcontentloaded" });
  const card = page.locator(".surface").first();
  await expect(card).toBeVisible();
  const bg = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).toBe(SURFACE);
});

test("primary button uses violet accent", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const btn = page.locator("a:has-text('Get Free Consultation')").first();
  await expect(btn).toBeVisible();
  await expect(btn).toHaveCSS("background-color", ACCENT);
});

test("hero section carries the charcoal-to-purple gradient", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const gradientCount = await page.evaluate(() => {
    let count = 0;
    document.querySelectorAll("*").forEach((el) => {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg.includes("linear-gradient") && (bg.includes("48, 35, 79") || bg.includes("53, 40, 96"))) {
        count += 1;
      }
    });
    return count;
  });
  expect(gradientCount).toBeGreaterThan(0);
});

test("forms fields use purple focus ring", async ({ page }) => {
  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  const field = page.locator("input.field").first();
  await expect(field).toBeVisible();
  await field.focus();
  const shadow = await field.evaluate((el) => getComputedStyle(el).boxShadow);
  expect(shadow).toContain("124, 92, 232");
});
