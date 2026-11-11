import { expect, test } from "@playwright/test";

test.describe("Chatbot popup", () => {
  test("opens automatically after 2.3 seconds on homepage", async ({ page }) => {
    await page.goto("/");

    // Chatbot should not be open initially
    const chatbot = page.getByRole("dialog", { name: "Housirentz Support" });
    await expect(chatbot).toBeHidden();

    // Wait more than 2.3 seconds for auto-open
    await page.waitForTimeout(2500);

    // Chatbot should now be open
    await expect(chatbot).toBeVisible();
    await expect(page.getByText("Housirentz Support")).toBeVisible();
  });

  test("collects details and submits via chatbot form", async ({ page }) => {
    await page.goto("/");

    // Wait for auto-open
    await page.waitForTimeout(2500);

    const chatbot = page.getByRole("dialog", { name: "Housirentz Support" });

    // Form shows directly on open — fill it in (scoped within chatbot dialog)
    await chatbot.getByLabel("Your name").fill("Rahul Sharma");
    await chatbot.getByLabel("Phone number").fill("9205908398");
    await chatbot.getByLabel("Email (optional)").fill("rahul@example.com");
    await chatbot.getByLabel("What are you looking for?").fill(
      "2 BHK flat in Noida under 75 lakh",
    );

    // Submit
    await chatbot.getByRole("button", { name: "Send Details" }).click();

    // Should see success message
    await expect(page.getByText("Message Sent")).toBeVisible();
    await expect(page.getByText(/Thank you!/)).toBeVisible();
  });
});
