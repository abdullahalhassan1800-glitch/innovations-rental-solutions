import { expect, test } from "@playwright/test";
import { DEMO } from "./helpers";

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

    await menu.getByRole("link", { name: "Projects", exact: true }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(menu).toBeHidden();
  });

  test("listing filters are usable from the mobile disclosure", async ({ page }) => {
    await page.goto("/projects");
    await page.locator("summary").filter({ hasText: "Filters & sorting" }).click();

    const form = page.locator("details form[action='/projects']");
    await expect(form).toBeVisible();
    await form.getByLabel("Configuration").selectOption("2");
    await form.getByRole("button", { name: "Apply filters" }).click();

    await expect(page).toHaveURL(/bhk=2/);
    await expect(page.getByRole("link", { name: /^2 BHK/ }).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("project detail shows the sticky booking bar and stackable forms", async ({ page }) => {
    await page.goto(`/projects/${DEMO.projectSlug}`);

    await expect(page.getByRole("link", { name: /Book a visit/i })).toBeVisible();
    await page.getByRole("link", { name: /Book a visit/i }).click();
    await expect(page).toHaveURL(/#site-visit$/);
    await expect(page.getByRole("heading", { name: "Schedule a site visit" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Request a callback" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("key pages fit a phone viewport without horizontal scrolling", async ({ page }) => {
    for (const path of ["/", "/projects", `/projects/${DEMO.projectSlug}`, "/contact", "/login"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expectNoHorizontalOverflow(page);
    }
  });

  test("AI launcher remains reachable on small screens", async ({ page }) => {
    await page.goto("/");
    const launcher = page.getByRole("button", { name: /AI/ });
    await expect(launcher).toBeVisible();
    await launcher.click();
    await expect(page.getByRole("dialog", { name: "Innovations AI assistant" })).toBeVisible();
    await expect(page.locator("#ai-input")).toBeVisible();
    await page.getByRole("button", { name: "Close assistant" }).click();
    await expect(page.getByRole("dialog", { name: "Innovations AI assistant" })).toBeHidden();
  });
});
