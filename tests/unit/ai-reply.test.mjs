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
  assert.match(response.reply, /\d+ projects? mil[ae]/);
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
  assert.match(visit.reply, /aapka pura naam|full name|mobile number/);
  assert.match(visit.reply, /date|time|project/);
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

test("booking without details asks for required fields", async () => {
  const hinglish = await getAssistantResponse({ message: "mere liye site visit book karo" });
  assert.match(hinglish.reply, /aapka pura naam|mobile number|date|time|project/);

  const english = await getAssistantResponse({ message: "book a site visit for me" });
  assert.match(english.reply, /full name|mobile number|date|time|project/);
});

test("booking with all details books a site visit", async () => {
  const response = await getAssistantResponse({
    message: "mere liye site visit book karo, mera naam Rahul hai, phone 9205908398, date 2026-12-25, time 14:00-16:00, project Meridian Edge",
  });

  assert.match(response.reply, /book ho gayi hai|booked/);
  assert.match(response.reply, /Meridian Edge/);
  assert.match(response.reply, /9205908398/);
});

test("english booking with all details", async () => {
  const response = await getAssistantResponse({
    message: "book a site visit, my name is Sarah, phone 9876543210, date 2026-12-26, time 10:00-12:00, project Aurelia Grove",
  });

  assert.match(response.reply, /booked for Aurelia Grove/);
  assert.match(response.reply, /9876543210/);
});

test("booking kaise kare returns contact info not booking ask", async () => {
  const response = await getAssistantResponse({ message: "booking kaise kare" });
  assert.match(response.reply, /92059 08398/);
  assert.doesNotMatch(response.reply, /aapka pura naam|full name/);
});

test("invalid phone number is rejected in booking flow", async () => {
  const response = await getAssistantResponse({
    message: "mere liye site visit book karo, mera naam Rahul hai, phone 123, date 2026-12-25, time 14:00-16:00, project Meridian Edge",
  });
  assert.match(response.reply, /mobile number/);
});
