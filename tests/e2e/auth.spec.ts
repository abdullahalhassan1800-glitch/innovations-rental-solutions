import { expect, test } from "@playwright/test";
import { cleanupUser, db, DEMO, uniqueEmail, uniquePhone } from "./helpers";

async function signIn(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
  destination: RegExp = /\/dashboard$/,
) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: /^Sign in/ }).click();
  await expect(page, "sign-in should establish a session").toHaveURL(destination, { timeout: 20_000 });
}

test.describe("authentication and account area", () => {
  test("anonymous visitors are redirected away from private areas", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login\?next=%2Fadmin/);
  });

  test("buyer can sign in and browse every dashboard section", async ({ page }) => {
    await signIn(page, DEMO.buyer.email, DEMO.buyer.password);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: /Good to see you/i })).toBeVisible();

    const sections: [string, RegExp][] = [
      ["/dashboard/saved", /Saved projects/i],
      ["/dashboard/inquiries", /Your inquiries/i],
      ["/dashboard/visits", /Site visits/i],
      ["/dashboard/profile", /Profile & security/i],
    ];
    for (const [path, heading] of sections) {
      await page.goto(path);
      await expect(page.locator("h1")).toContainText(heading);
    }

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard\?error=forbidden/);
  });

  test("buyer can save and unsave a project from the detail page", async ({ page }) => {
    const buyer = await db.user.findUnique({ where: { email: DEMO.buyer.email } });
    expect(buyer).toBeTruthy();
    await db.savedProject.deleteMany({
      where: { userId: buyer!.id, project: { slug: DEMO.projectSlug } },
    });

    try {
      await signIn(page, DEMO.buyer.email, DEMO.buyer.password);
      await page.goto(`/projects/${DEMO.projectSlug}`);

      const saveButton = page.getByRole("button", { name: "Save this project" }).first();
      await saveButton.click();
      await expect(page.getByText("Saved to your dashboard")).toBeVisible();
      await expect(page.getByRole("button", { name: "Remove from saved projects" }).first()).toHaveAttribute(
        "aria-pressed",
        "true",
      );

      await page.goto("/dashboard/saved");
      await expect(page.getByRole("heading", { name: "Saved projects." })).toBeVisible();
      await expect(page.getByRole("link", { name: /signature/i }).first()).toBeVisible();
    } finally {
      await db.savedProject.deleteMany({
        where: { userId: buyer!.id, project: { slug: DEMO.projectSlug } },
      });
    }
  });

  test("wrong credentials show an inline error and do not create a session", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill(DEMO.buyer.email);
    await page.getByLabel("Password", { exact: true }).fill("definitely-wrong");
    await page.getByRole("button", { name: /^Sign in/ }).click();

    await expect(page.getByText("Incorrect email or password")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("registration creates an account and opens a private dashboard", async ({ page }) => {
    const email = uniqueEmail("register");
    const phone = uniquePhone();
    try {
      await page.goto("/register");
      await page.getByLabel("Full name").fill("Playwright Buyer");
      await page.getByLabel("Email address").fill(email);
      await page.getByLabel("Mobile").fill(phone);
      await page.getByLabel("Password", { exact: true }).fill("Playwright123");
      await page.getByRole("button", { name: /Create|Register|account/i }).click();

      await expect(page).toHaveURL(/\/dashboard$/);
      await expect(page.getByRole("heading", { name: /Good to see you, Playwright/i })).toBeVisible();
      await expect(page.getByText(email)).toBeVisible();
    } finally {
      await cleanupUser(email);
    }
  });

  test("buyer can sign out, ending the session", async ({ page }) => {
    await signIn(page, DEMO.buyer.email, DEMO.buyer.password);
    await page.goto("/dashboard/profile");
    await page.getByRole("button", { name: /Sign out/i }).click();
    await expect(page).toHaveURL(/\/(\?.*)?$/);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("administrator workspace", () => {
  test("admin signs in and all management sections load", async ({ page }) => {
    await signIn(page, DEMO.admin.email, DEMO.admin.password, /\/admin$/);
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Workspace overview." })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Admin" })).toBeVisible();

    const sections: [string, RegExp][] = [
      ["/admin/projects", /Projects/i],
      ["/admin/leads", /Leads/i],
      ["/admin/site-visits", /Site visits/i],
      ["/admin/developers", /Developers/i],
      ["/admin/locations", /Locations/i],
      ["/admin/amenities", /Amenities/i],
      ["/admin/faqs", /FAQs/i],
      ["/admin/testimonials", /Testimonials/i],
      ["/admin/users", /Users/i],
    ];

    for (const [path, heading] of sections) {
      await page.goto(path);
      await expect(page.locator("h1")).toContainText(heading);
      await expect(page.locator("main")).toBeVisible();
    }
  });

  test("admin project manager exposes search, tabs and creation", async ({ page }) => {
    await signIn(page, DEMO.admin.email, DEMO.admin.password, /\/admin$/);
    await page.goto("/admin/projects");

    await expect(page.getByRole("heading", { name: "Projects." })).toBeVisible();
    await expect(page.getByRole("link", { name: /New project/i }).first()).toBeVisible();
    await expect(page.getByLabel("Search projects")).toBeVisible();
    await expect(page.getByRole("table").or(page.locator("tbody tr")).first()).toBeVisible();
  });

  test("leads screen warns that customer data is private", async ({ page }) => {
    await signIn(page, DEMO.admin.email, DEMO.admin.password, /\/admin$/);
    await page.goto("/admin/leads");
    await expect(page.getByText("Private data")).toBeVisible();
    await expect(page.getByText(/visible to signed-in administrators only/i)).toBeVisible();
  });

  test("admin cannot be reached by a regular buyer session", async ({ page }) => {
    await signIn(page, DEMO.buyer.email, DEMO.buyer.password);
    await page.goto("/admin/projects");
    await expect(page).toHaveURL(/\/dashboard\?error=forbidden/);
  });
});
