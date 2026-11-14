import { expect, test } from "@playwright/test";

const PAGES: Array<[string, string]> = [
  ["home", "/"],
  ["about", "/about"],
  ["benefits", "/benefits"],
  ["properties", "/properties"],
  ["property-detail", "/projects/signature"],
  ["blog", "/blog"],
  ["blog-detail", "/blog/rent-to-own-property-provider-in-india"],
  ["contact", "/contact"],
  ["login", "/login"],
  ["register", "/register"],
  ["privacy", "/privacy-policy"],
  ["terms", "/terms"],
  ["location", "/location/mangalore"],
  ["compare", "/compare"],
];

const OUT = "C:/Users/utm/AppData/Local/Temp/opencode/review";

test.describe.configure({ mode: "serial" });

test("desktop full-page screenshots of all public pages", async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1366, height: 900 });
  for (const [name, path] of PAGES) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded", timeout: 60_000 });
    const status = response?.status() ?? 0;
    // Freeze reveal/fade animations so below-fold content is visible in full-page shots
    await page.evaluate(() => {
      const style = document.createElement("style");
      style.textContent =
        ".reveal{opacity:1!important;transform:none!important;transition:none!important}" +
        ".animate-fade-up{animation:none!important;opacity:1!important}" +
        "video{display:none!important}";
      document.head.appendChild(style);
    });
    // Fixed settle wait instead of networkidle (remote construction images keep
    // the network busy and trip the networkidle timeout).
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/desktop-${name}.png`, fullPage: true });
    // Basic assertions collected for the report
    const h1Count = await page.locator("h1").count();
    console.log(`PAGE ${path} status=${status} h1=${h1Count}`);
    expect(status, `status for ${path}`).toBeLessThan(400);
    expect(h1Count, `exactly one h1 on ${path}`).toBe(1);
  }
});
