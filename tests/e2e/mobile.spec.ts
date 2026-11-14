import { expect, test } from "@playwright/test";
import { DEMO, dismissChatWidget } from "./helpers";

/** Global CSS uses smooth scrolling, which makes Playwright's auto-scroll
 *  never report a stable position; force instant scrolling in tests. */
async function disableSmoothScroll(page: import("@playwright/test").Page) {
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
}

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, "page should not scroll horizontally on a phone").toBeLessThanOrEqual(1);
}

test.describe("mobile experience", () => {
  test("mobile menu opens, navigates and closes", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator('button[aria-controls="mobile-menu"]');
    const menu = page.locator("#mobile-menu");
    await expect(toggle).toBeVisible();

    // Retry once hydration attaches the click handler, without toggling a menu that is already open.
    await expect(async () => {
      if (!(await menu.isVisible())) await toggle.click();
      await expect(menu).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 15_000 });
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    await menu.getByRole("link", { name: "All properties", exact: true }).click();
    await expect(page).toHaveURL(/\/properties$/);
    await expect(menu).toBeHidden();
  });

  test("listing filters are usable from the mobile disclosure", async ({ page }) => {
    await page.goto("/properties");
    await page.locator("summary").filter({ hasText: "Filters & sorting" }).click();

    const form = page.locator("details form[action='/properties']");
    await expect(form).toBeVisible();
    await form.getByLabel("Configuration").selectOption("2");
    await form.getByRole("button", { name: "Apply filters" }).click();

    await expect(page).toHaveURL(/bhk=2/);
    await expect(page.getByRole("link", { name: /^2 BHK/ }).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("project detail shows the sticky booking bar and stackable forms", async ({ page }) => {
    // Remote construction photos can hold the load event open; only the DOM is needed.
    await page.goto(`/projects/${DEMO.projectSlug}`, { waitUntil: "domcontentloaded" });
    // The chat widget auto-opens over the page and the sticky bar link needs
    // instant scrolling; both are test-environment concerns only.
    await dismissChatWidget(page);
    await disableSmoothScroll(page);

    await expect(page.getByRole("link", { name: /Book a visit/i }).first()).toBeVisible();
    await page.getByRole("link", { name: /Book a visit/i }).first().click();
    await expect(page).toHaveURL(/#site-visit$/);
    await expect(page.getByRole("heading", { name: "Schedule a site visit" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Request a callback" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("key pages fit a phone viewport without horizontal scrolling", async ({ page }) => {
    for (const path of ["/", "/properties", `/projects/${DEMO.projectSlug}`, "/contact", "/login"]) {
      await page.goto(path);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(800);
      await expectNoHorizontalOverflow(page);
    }
  });

  test("chat launcher remains reachable on small screens", async ({ page }) => {
    await page.goto("/");
    const launcher = page.getByRole("button", { name: "Open chat" });
    await expect(launcher).toBeVisible({ timeout: 15_000 });
    await launcher.click();
    await expect(page.getByRole("dialog", { name: "Housirentz Support" })).toBeVisible();
    await page.getByLabel("Close").last().click();
    await expect(page.getByRole("dialog", { name: "Housirentz Support" })).toBeHidden();
  });
});
