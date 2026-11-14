import { expect, test } from "@playwright/test";

// The standalone AIAssistant (voice + database fact-table assistant) is not
// mounted anywhere in the app right now — the redesigned ChatBot replaced it
// as the AI surface (see components/ai/chat-bot.tsx, covered by chatbot.spec).
// Re-enable this suite if the assistant ships again.
test.skip(true, "AIAssistant component is not mounted; ChatBot (chatbot.spec.ts) is the active AI surface.");

async function openAssistant(page: import("@playwright/test").Page) {
  await page.goto("/");
  // The floating launcher fades in only after the hero scrolls out of view
  // (see ai-assistant.tsx heroInView logic).
  await page.evaluate(() => window.scrollTo(0, 1200));
  const launcher = page.getByRole("button", { name: /Ask Innovations AI/ });
  await expect(launcher).toBeVisible({ timeout: 15_000 });
  await launcher.click();
  const dialog = page.getByRole("dialog", { name: "Innovations AI assistant" });
  await expect(dialog).toBeVisible();
  return dialog;
}

async function ask(dialog: import("@playwright/test").Locator, message: string) {
  await dialog.locator("#ai-input").fill(message);
  await dialog.getByRole("button", { name: "Send message" }).click();
  await expect(dialog.getByText(/Searching the project database/i)).toBeHidden({ timeout: 20_000 });
}

test.describe("AI assistant", () => {
  test("opens as a dialog, answers from the database and renders project cards", async ({ page }) => {
    const dialog = await openAssistant(page);
    await expect(dialog.getByText(/I never invent projects or prices/i)).toBeVisible();

    await ask(dialog, "2 BHK in Greater Noida West under 90 lakh");

    await expect(dialog.getByText(/I found \d+ project|closest options from our database/i).last()).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Compare" }).first()).toBeVisible();
    await expect(dialog.getByRole("link", { name: "View" }).first()).toBeVisible();
    await expect(dialog.getByText("Demo data. No invented listings or prices.")).toBeVisible();
  });

  test("compares two named projects in a fact table", async ({ page }) => {
    const dialog = await openAssistant(page);
    await ask(dialog, "Compare Signature and Vrinda Gardens");

    await expect(dialog.getByText(/side-by-side comparison/i)).toBeVisible();
    const table = dialog.locator("table");
    await expect(table).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "Signature" })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "Vrinda Gardens" })).toBeVisible();
    await expect(table.getByRole("cell", { name: "Starting price" })).toBeVisible();
  });

  test("answers a Hindi question in Devanagari, using database projects", async ({ page }) => {
    const dialog = await openAssistant(page);
    await ask(dialog, "मुझे ग्रेटर नोएडा में 2 बीएचके फ्लैट चाहिए");

    const reply = dialog.locator(".animate-chat-in").last();
    await expect(reply).toContainText(/[\u0900-\u097F]/);
    await expect(dialog.getByRole("link", { name: "View" }).first()).toBeVisible();
  });

  test("escape closes the dialog", async ({ page }) => {
    const dialog = await openAssistant(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("falls back to text when the browser has no speech recognition", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "SpeechRecognition", { value: undefined, configurable: true });
      Object.defineProperty(window, "webkitSpeechRecognition", { value: undefined, configurable: true });
    });
    const dialog = await openAssistant(page);

    await expect(dialog.getByText("Text only")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Start voice input" })).toBeDisabled();
  });

  test("recovers with a typed-message hint when voice permission fails", async ({ page }) => {
    await page.addInitScript(() => {
      class FakeRecognition {
        lang = "en-IN";
        continuous = false;
        interimResults = false;
        onresult = null;
        onerror = null;
        onend = null;
        start() {
          (this.onerror as ((event: { error: string }) => void) | null)?.({ error: "not-allowed" });
        }
        stop() {}
        abort() {}
      }
      Object.defineProperty(window, "SpeechRecognition", { value: FakeRecognition, configurable: true });
      Object.defineProperty(window, "webkitSpeechRecognition", { value: FakeRecognition, configurable: true });
    });
    const dialog = await openAssistant(page);

    const mic = dialog.getByRole("button", { name: "Start voice input" });
    await expect(mic).toBeEnabled();
    await mic.click();
    await expect(dialog.getByRole("alert")).toContainText(/microphone access is blocked/i);
    await expect(dialog.getByRole("button", { name: "Start voice input" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  test("transcribes simulated speech, applies the voice language and searches the database", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      type Result = ArrayLike<{ transcript: string; isFinal?: boolean }>;
      class FakeRecognition {
        lang = "en-IN";
        continuous = false;
        interimResults = false;
        onresult: ((event: { resultIndex: number; results: Result[] }) => void) | null = null;
        onerror: ((event: { error?: string }) => void) | null = null;
        onend: (() => void) | null = null;
        start() {
          (window as unknown as { __lastRecognition?: FakeRecognition }).__lastRecognition = this;
          this.onresult?.({
            resultIndex: 0,
            results: [[{ transcript: "mujhe greater noida west mein sasta 2 bhk chahiye", isFinal: true }]],
          });
          this.onend?.();
        }
        stop() {
          this.onend?.();
        }
        abort() {}
      }
      Object.defineProperty(window, "SpeechRecognition", { value: FakeRecognition, configurable: true });
      Object.defineProperty(window, "webkitSpeechRecognition", { value: FakeRecognition, configurable: true });
    });

    const dialog = await openAssistant(page);
    await dialog.getByLabel("Voice language").selectOption("hi-IN");

    const mic = dialog.getByRole("button", { name: "Start voice input" });
    await expect(mic).toBeEnabled();
    await mic.click();

    // The final transcript is submitted automatically and the composer clears.
    await expect(dialog.getByText("mujhe greater noida west mein sasta 2 bhk chahiye")).toBeVisible();
    await expect(dialog.locator("#ai-input")).toHaveValue("");
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as unknown as { __lastRecognition?: { lang: string } }).__lastRecognition?.lang,
        ),
      )
      .toBe("hi-IN");
    await expect(dialog.getByText(/Searching the project database/i)).toBeHidden({ timeout: 20_000 });
    await expect(dialog.getByRole("link", { name: "View" }).first()).toBeVisible();
    await expect(dialog.getByText(/sabse kam starting price ke hisaab se sort/i)).toBeVisible();
  });

  test("voice input turns on spoken replies and speaks the database answer", async ({ page }) => {
    await page.addInitScript(() => {
      type Result = ArrayLike<{ transcript: string; isFinal?: boolean }>;
      class FakeRecognition {
        lang = "en-IN";
        continuous = false;
        interimResults = false;
        onresult: ((event: { resultIndex: number; results: Result[] }) => void) | null = null;
        onerror: ((event: { error?: string }) => void) | null = null;
        onend: (() => void) | null = null;
        start() {
          this.onresult?.({
            resultIndex: 0,
            results: [[{ transcript: "2 bhk in greater noida west under 90 lakh", isFinal: true }]],
          });
          this.onend?.();
        }
        stop() {
          this.onend?.();
        }
        abort() {}
      }
      Object.defineProperty(window, "SpeechRecognition", { value: FakeRecognition, configurable: true });
      Object.defineProperty(window, "webkitSpeechRecognition", { value: FakeRecognition, configurable: true });

      const spoken: string[] = [];
      Object.defineProperty(window, "__spoken", { value: spoken, configurable: true });
      window.speechSynthesis.speak = ((utterance: SpeechSynthesisUtterance) => {
        spoken.push(utterance.text);
        (utterance.onend as ((event: Event) => void) | null)?.(new Event("end"));
      }) as typeof window.speechSynthesis.speak;
      window.speechSynthesis.cancel = () => {};
      window.speechSynthesis.resume = () => {};
    });

    const dialog = await openAssistant(page);
    await expect(dialog.getByRole("button", { name: "Enable spoken replies" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await dialog.getByRole("button", { name: "Start voice input" }).click();

    await expect(dialog.getByRole("button", { name: "Disable spoken replies" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(dialog.getByText(/Searching the project database/i)).toBeHidden({ timeout: 20_000 });
    await expect(dialog.getByText(/I found \d+ project|closest options from our database/i).last()).toBeVisible();

    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __spoken?: string[] }).__spoken?.join(" ") ?? ""))
      .toMatch(/project/i);
  });
});
