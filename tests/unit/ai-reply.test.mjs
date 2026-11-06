import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lib } from "./_jiti.mjs";

// The assistant reads the bundled demo snapshot, so these tests exercise the
// real reply composition against the same data the public site uses.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
process.env.DATABASE_URL = `file:${path.join(root, "prisma", "demo.db").replace(/\\/g, "/")}`;

const { getAssistantResponse } = await lib("ai/assistant.ts");

test("Hinglish replies no longer repeat sentence fragments", async () => {
  const response = await getAssistantResponse({ message: "mujhe noida mein sasta 2 bhk chahiye" });

  assert.equal(response.language, "hinglish");
  assert.doesNotMatch(response.reply, /\bhoon hoon\b/i);
  assert.doesNotMatch(response.reply, /\bmein mein\b/i);
  assert.match(response.reply, /dhoondh raha hoon\./);
  assert.match(response.reply, /Database mein \d+ projects? mil[ae]/);
  assert.ok(response.projects.length > 0);
});

test("English replies use correct plurals and word order", async () => {
  const response = await getAssistantResponse({ message: "2 BHK in Noida under 75 lakh" });

  assert.equal(response.language, "en");
  assert.match(response.reply, /^Searching Noida for 2 BHK projects under ₹75 L\./);
  if (response.projects.length === 1) {
    assert.match(response.reply, /I found 1 project that matches your brief\./);
  } else {
    assert.match(response.reply, /I found \d+ projects that match your brief\./);
  }
  assert.doesNotMatch(response.reply, /that match your brief\./);
  assert.doesNotMatch(response.reply, /\s{2,}/);
});

test("spoken scripts expand comma-separated configurations", async () => {
  const response = await getAssistantResponse({ message: "Tell me about Meridian Edge" });

  assert.equal(response.projects[0]?.name, "Meridian Edge");
  assert.match(response.speech ?? "", /1 and 2 BHK/);
  assert.doesNotMatch(response.speech ?? "", /, 1, 2 BHK/);
});

test("a named project gets a direct, factual answer", async () => {
  const response = await getAssistantResponse({ message: "Meridian Edge ka price kya hai" });

  assert.equal(response.language, "hinglish");
  assert.equal(response.projects[0]?.name, "Meridian Edge");
  assert.match(response.reply, /Meridian Edge/);
  assert.match(response.reply, /se shuru hoti hai/);
  assert.match(response.reply, /possession/i);
});

test("follow-up questions use the previous project context", async () => {
  const first = await getAssistantResponse({ message: "Tell me about Meridian Edge" });
  const id = first.projects[0].id;
  const followUp = await getAssistantResponse({
    message: "iski possession kab hai",
    contextProjectIds: [id],
  });

  assert.equal(followUp.projects[0]?.id, id);
  assert.match(followUp.reply, /possession/i);
});

test("browsing words do not add an unrelated site-visit line", async () => {
  const response = await getAssistantResponse({ message: "sasta dikhao" });

  assert.doesNotMatch(response.reply, /site visit/i);
  assert.match(response.reply, /dhoondh raha hoon/);
});

test("booking, fees and site-visit questions get a real answer", async () => {
  const booking = await getAssistantResponse({ message: "booking kaise kare" });
  assert.equal(booking.language, "hinglish");
  assert.match(booking.reply, /92059 08398/);

  const fees = await getAssistantResponse({ message: "kya aapki koi fees hai" });
  assert.match(fees.reply, /written breakup|92059 08398/);

  const visit = await getAssistantResponse({ message: "site visit book karna hai" });
  assert.match(visit.reply, /sales team|सेल्स टीम/i);
  assert.equal(visit.projects.length, 0);
});

test("'options dikhao' shows featured projects instead of a prompt", async () => {
  const response = await getAssistantResponse({ message: "options dikhao" });

  assert.ok(response.projects.length > 0);
  assert.doesNotMatch(response.reply, /Mujhe location, budget/i);
});

test("contact answers include the new office address", async () => {
  const response = await getAssistantResponse({ message: "office address kya hai" });

  assert.match(response.reply, /S-11, 1101, 1st Floor, Urbtech Trade Center/);
});
