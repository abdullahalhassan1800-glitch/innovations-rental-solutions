import { expect, test } from "@playwright/test";

test.describe("accessibility foundations", () => {
  test("skip link is the first focusable element and jumps to main", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await skip.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("every page has one h1, a language and a description", async ({ page }) => {
    for (const path of ["/", "/projects", "/projects/aurelia-grove", "/contact", "/login"]) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", "en-IN");
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{40,}/);
      await expect(page).toHaveTitle(/.+/);
    }
  });

  test("content images provide alternative text", async ({ page }) => {
    for (const path of ["/", "/projects", "/projects/aurelia-grove"]) {
      await page.goto(path);
      const missing = await page.locator("img:not([alt])").count();
      expect(missing, `${path} should not contain images without an alt attribute`).toBe(0);
    }
  });

  test("form controls expose accessible names", async ({ page }) => {
    for (const path of ["/login", "/register", "/contact", "/projects"]) {
      await page.goto(path);
      const unnamed = await page.locator("input:not([type=hidden]):not([type=checkbox])").evaluateAll((nodes) =>
        nodes
          .filter((node) => {
            const element = node as HTMLInputElement;
            if (element.closest("[aria-hidden='true']")) return false;
            if (element.getAttribute("aria-label") || element.getAttribute("aria-labelledby")) return false;
            if (element.id && document.querySelector(`label[for="${CSS.escape(element.id)}"]`)) return false;
            return !element.closest("label");
          })
          .map((node) => (node as HTMLInputElement).outerHTML.slice(0, 120)),
      );
      expect(unnamed, `${path} has unlabelled inputs`).toEqual([]);
    }
  });

  test("pages do not contain duplicate element ids", async ({ page }) => {
    for (const path of ["/", "/projects", "/projects/aurelia-grove", "/contact"]) {
      await page.goto(path);
      const duplicates = await page.evaluate(() => {
        const seen = new Set<string>();
        const dupes = new Set<string>();
        for (const element of document.querySelectorAll("[id]")) {
          if (seen.has(element.id)) dupes.add(element.id);
          seen.add(element.id);
        }
        return [...dupes];
      });
      expect(duplicates, `${path} has duplicate ids`).toEqual([]);
    }
  });
});
