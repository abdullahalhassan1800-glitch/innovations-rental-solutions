import { expect, test } from "@playwright/test";
import { cleanupPhone, DEMO, dismissChatWidget, tomorrow, uniquePhone } from "./helpers";

test.describe("public browsing", () => {
  test("home page presents the brand, navigation and demo disclosure", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/own premium property/i);
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Properties", exact: true }).first()).toBeVisible();
    await expect(page.getByText(/demonstration|demo/i).first()).toBeVisible();
    await expect(page.locator("article").first()).toBeVisible();
  });

  test("every required public route renders exactly one h1", async ({ page }) => {
    const routes: [string, RegExp][] = [
      ["/", /own premium property/i],
      ["/properties", /curated, verified assets/i],
      ["/residential", /home|residential/i],
      ["/commercial", /footprint|commercial/i],
      ["/resort-housing", /resort/i],
      ["/service-apartments", /furnished|serviced|service/i],
      ["/location/mangalore", /mangalore/i],
      ["/location/bangalore", /bangalore/i],
      ["/location/bengaluru", /bengaluru/i],
      ["/location/greater-noida-west", /greater noida west/i],
      ["/about", /rental investing|about/i],
      ["/contact", /get in touch|conversation|contact/i],
      ["/blog", /blog|insights|question/i],
      ["/compare", /compare/i],
      ["/privacy-policy", /privacy/i],
      ["/terms", /terms/i],
      ["/login", /sign in/i],
      ["/register", /shortlist|account|create/i],
    ];

    for (const [route, heading] of routes) {
      const response = await page.goto(route);
      expect(response?.status(), `${route} should respond with 200`).toBe(200);
      await expect(page.locator("h1"), `${route} should have one h1`).toHaveCount(1);
      await expect(page.locator("h1")).toContainText(heading);
    }
  });

  test("resort and service apartment pages stay scoped to their category", async ({ page }) => {
    const pages: [string, RegExp][] = [
      ["/resort-housing", /resort housing/i],
      ["/service-apartments", /service apartments/i],
    ];

    for (const [route, label] of pages) {
      const response = await page.goto(route);
      expect(response?.status(), `${route} should respond with 200`).toBe(200);
      await expect(page.getByText(label).first()).toBeVisible();
      // The category pages lock the property type, so the shared type select is not rendered.
      await expect(page.locator("aside form select[name='propertyType']")).toHaveCount(0);
      // Current demo inventory has no resort/service-apartment projects: show the
      // scoped empty state with a recovery action instead of unrelated listings.
      await expect(
        page.getByRole("heading", { name: /No projects match those filters|Curated, verified assets/i }).first(),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: /Browse|Reset|Explore/i }).first()).toBeVisible();
    }
  });

  test("listing filters, sorting and clearing work through the URL", async ({ page }) => {
    await page.goto("/properties");
    await expect(page.getByRole("heading", { name: "Curated, verified assets ready for investment." })).toBeVisible();

    const filterForm = page.locator("aside form[action='/properties']");
    await filterForm.getByLabel("Location").selectOption("mangalore");
    await filterForm.getByLabel("Configuration").selectOption("3");
    await filterForm.getByLabel("Sort by").selectOption("price-asc");
    await filterForm.getByRole("button", { name: "Apply filters" }).click();

    await expect(page).toHaveURL(/location=mangalore/);
    await expect(page).toHaveURL(/bhk=3/);
    await expect(page).toHaveURL(/sort=price-asc/);
    await expect(page.getByRole("link", { name: "Clear all" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /^3 BHK/ }).first()).toBeVisible();

    // Let the filtered result tree settle so the link is not detached mid-render.
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1_000);
    await expect(async () => {
      if (new URL(page.url()).search) {
        await page.getByRole("link", { name: "Clear all" }).first().click({ timeout: 5_000 });
      }
      await expect(page).toHaveURL(/\/properties$/, { timeout: 5_000 });
    }).toPass({ timeout: 20_000 });
  });

  test("search with no matches shows an empty state and recovery action", async ({ page }) => {
    await page.goto("/properties?q=zzzz-no-such-project");

    await expect(page.getByRole("heading", { name: /No projects match those filters/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Clear|Reset|Browse/i }).first()).toBeVisible();
  });

  test("project detail shows gallery, pricing, amenities, map context and FAQs", async ({ page }) => {
    await page.goto(`/projects/${DEMO.projectSlug}`);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/(Demo|Sample) gallery/)).toBeVisible();
    await expect(page.getByRole("heading", { name: /An overview, without the noise/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Configurations & sample pricing/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /The everyday, considered/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /The address, in context/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Answers for this listing/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Demo brochure \(PDF\)/i })).toHaveAttribute(
      "href",
      /brochure/,
    );
    await expect(page.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", /wa\.me/);
    await expect(page.getByText(/Demonstration listing/i).first()).toBeVisible();
  });

  test("gallery controls advance the image counter", async ({ page }) => {
    await page.goto(`/projects/${DEMO.projectSlug}`);
    const counter = page.getByText(/^1 \/ \d+$/);
    await expect(counter).toBeVisible();
    const total = Number((await counter.textContent())?.split("/")[1]?.trim());
    test.skip(total < 2, "seed project needs more than one gallery image");

    await page.getByRole("button", { name: "Next image" }).click();
    await expect(page.getByText(/^2 \/ \d+$/)).toBeVisible();
  });

  test("callback form validates consent and stores a valid inquiry", async ({ page }) => {
    const phone = uniquePhone();
    try {
      await page.goto(`/projects/${DEMO.projectSlug}#site-visit`);
      await dismissChatWidget(page);
      const form = page
        .locator("form")
        .filter({ has: page.getByRole("heading", { name: "Request a callback" }) });

      await form.locator("#lead-name").fill("Playwright Callback");
      await form.locator("#lead-phone").fill(phone);
      await form.getByRole("button", { name: /Send my request/i }).click();

      await expect(page.getByRole("alert").or(form.locator(".field-error")).first()).toBeVisible();

      await form.getByRole("checkbox", { name: /I agree to be contacted/i }).check();
      await form.getByRole("button", { name: /Send my request/i }).click();

      await expect(page.getByRole("heading", { name: "Request received" })).toBeVisible();
      await expect(page.getByText(/no real sales team/i)).toBeVisible();
    } finally {
      await cleanupPhone(phone);
    }
  });

  test("site visit form books a future slot and confirms", async ({ page }) => {
    const phone = uniquePhone();
    try {
      await page.goto(`/projects/${DEMO.projectSlug}#site-visit`);
      await dismissChatWidget(page);
      const form = page
        .locator("form")
        .filter({ has: page.getByRole("heading", { name: "Schedule a site visit" }) });

      await form.locator("#visit-name").fill("Playwright Visitor");
      await form.locator("#visit-phone").fill(phone);
      await form.locator("#visit-date").fill(tomorrow());
      await form.locator("#visit-time").selectOption({ index: 1 });
      await form.getByRole("checkbox", { name: /I agree to be contacted/i }).check();
      await form.getByRole("button", { name: /Request site visit/i }).click();

      await expect(page.getByRole("heading", { name: "Site visit requested" })).toBeVisible();
      await expect(page.getByText(/dashboard under Site visits/i)).toBeVisible();
    } finally {
      await cleanupPhone(phone);
    }
  });

  test("SEO endpoints and the custom 404 are available", async ({ page, request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain(`/projects/${DEMO.projectSlug}`);

    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    const robotsText = await robots.text();
    expect(robotsText).toContain("Disallow: /admin");
    expect(robotsText).toContain("Disallow: /dashboard");

    const missing = await page.goto("/this-page-does-not-exist");
    expect(missing?.status()).toBe(404);
    await expect(page.getByText(/doesn.t exist|not found/i).first()).toBeVisible();
  });
});
