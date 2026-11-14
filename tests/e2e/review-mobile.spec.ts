import { expect, test } from "@playwright/test";

const PAGES: Array<[string, string]> = [
  ["home", "/"],
  ["about", "/about"],
  ["properties", "/properties"],
  ["blog", "/blog"],
  ["contact", "/contact"],
];

const OUT = "C:/Users/utm/AppData/Local/Temp/opencode/review";

test("mobile full-page screenshots of key pages", async ({ page }) => {
  test.setTimeout(180_000);
  for (const [name, path] of PAGES) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded", timeout: 60_000 });
    const status = response?.status() ?? 0;
    await page.evaluate(() => {
      const style = document.createElement("style");
      style.textContent =
        ".reveal{opacity:1!important;transform:none!important;transition:none!important}" +
        ".animate-fade-up{animation:none!important;opacity:1!important}" +
        "video{display:none!important}";
      document.head.appendChild(style);
    });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/mobile-${name}.png`, fullPage: true });
    const h1Count = await page.locator("h1").count();
    // horizontal overflow check
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    console.log(`PAGE ${path} status=${status} h1=${h1Count} overflowPx=${overflow}`);
    expect(status, `status for ${path}`).toBeLessThan(400);
    expect(overflow, `no horizontal overflow on ${path}`).toBeLessThanOrEqual(2);
  }
});
