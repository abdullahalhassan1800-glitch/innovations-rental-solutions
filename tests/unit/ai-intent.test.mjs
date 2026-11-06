import test from "node:test";
import assert from "node:assert/strict";
import { lib } from "./_jiti.mjs";

const { detectLanguage, parseIntent, mergeIntents, hasSearchCriteria, sanitiseExternalIntent, locationLabel } =
  await lib("ai/intent.ts");

test("detectLanguage distinguishes English, Hinglish and Hindi", () => {
  assert.equal(detectLanguage("Show me 3 BHK flats in Noida"), "en");
  assert.equal(detectLanguage("Mujhe Noida mein 3 BHK chahiye"), "hinglish");
  assert.equal(detectLanguage("मुझे नोएडा में फ्लैट चाहिए"), "hi");
});

test("parseIntent extracts location, configuration and budget", () => {
  const intent = parseIntent("3 BHK flat in Noida Extension under 1.5 Cr");
  assert.equal(intent.location, "noida-extension");
  assert.equal(intent.bhk, "3");
  assert.equal(intent.propertyType, "RESIDENTIAL");
  assert.equal(intent.maxPrice, 15_000_000);
  assert.equal(intent.minPrice, undefined);
  assert.equal(hasSearchCriteria(intent), true);
});

test("parseIntent reads a numeric budget range", () => {
  const intent = parseIntent("2 BHK in Greater Noida between 60 lakh and 80 lakh");
  assert.equal(intent.location, "greater-noida");
  assert.equal(intent.minPrice, 6_000_000);
  assert.equal(intent.maxPrice, 8_000_000);
});

test("parseIntent treats 'above' budgets as minimums", () => {
  const intent = parseIntent("commercial office in Noida above 2 crore");
  assert.equal(intent.location, "noida");
  assert.equal(intent.propertyType, "COMMERCIAL");
  assert.equal(intent.category, "Office");
  assert.equal(intent.minPrice, 20_000_000);
  assert.equal(intent.maxPrice, undefined);
});

test("parseIntent recognises status, possession year and amenities", () => {
  const intent = parseIntent("ready to move 4 bhk with swimming pool and gym, possession by 2027 in Noida");
  assert.equal(intent.status, "READY_TO_MOVE");
  assert.equal(intent.bhk, "4");
  assert.deepEqual(intent.amenities.sort(), ["Gymnasium", "Swimming Pool"]);
  assert.equal(intent.possessionYear, 2027);
});

test("parseIntent flags compare, site visit and greeting requests", () => {
  assert.equal(parseIntent("compare 2 bhk vs 3 bhk projects").compare, true);
  assert.equal(parseIntent("I want a site visit this weekend").siteVisit, true);
  assert.equal(parseIntent("Namaste").greeting, true);
  assert.equal(parseIntent("Hello there, show me villas").greeting, false);
  assert.equal(parseIntent("").greeting, false);
});

test("parseIntent picks the most specific location", () => {
  assert.equal(parseIntent("flats in Noida Extension").location, "noida-extension");
  assert.equal(parseIntent("flats in Greater Noida").location, "greater-noida");
  // "Greater Noida West" is commonly used for Noida Extension, so the more
  // specific pattern wins over the broader Greater Noida match.
  assert.equal(parseIntent("flats in Greater Noida West").location, "noida-extension");
  assert.equal(parseIntent("flats in Gurugram").location, "delhi-ncr");
  assert.equal(locationLabel("noida-extension"), "Noida Extension");
  assert.equal(locationLabel(), "Delhi NCR");
});

test("parseIntent understands spoken Hindi and Hinglish voice phrases", () => {
  const hinglish = parseIntent("mujhe noida extension mein sasta 2 bhk ghar chahiye");
  assert.equal(hinglish.location, "noida-extension");
  assert.equal(hinglish.bhk, "2");
  assert.equal(hinglish.propertyType, "RESIDENTIAL");
  assert.equal(hinglish.sort, "price-asc");

  const hindi = parseIntent("पचहत्तर लाख के अंदर ग्रेटर नोएडा में दो बीएचके फ्लैट");
  assert.equal(hindi.location, "greater-noida");
  assert.equal(hindi.bhk, "2");
  assert.equal(hindi.maxPrice, 7_500_000);
  assert.equal(detectLanguage("पचहत्तर लाख के अंदर फ्लैट"), "hi");
});

test("parseIntent converts spoken English budgets and Hindi fractions", () => {
  assert.equal(parseIntent("3 BHK in Noida under seventy five lakh").maxPrice, 7_500_000);
  assert.equal(parseIntent("dedh crore ke andar flat").maxPrice, 15_000_000);
  assert.equal(parseIntent("sava crore budget").maxPrice, 12_500_000);
  assert.equal(parseIntent("2.5 crore se kam").maxPrice, 25_000_000);
  assert.equal(parseIntent("pachattar lakh tak ghar").maxPrice, 7_500_000);
});

test("spoken amenities do not confuse parking with a park", () => {
  const parking = parseIntent("parking wala flat chahiye");
  assert.deepEqual(parking.amenities, ["Covered Parking"]);

  const garden = parseIntent("garden aur cctv wala project");
  assert.deepEqual(garden.amenities.sort(), ["24x7 Security", "Landscaped Gardens"]);
});

test("parseIntent recognises spoken comparison and readiness language", () => {
  assert.equal(parseIntent("inmein farak batao").compare, true);
  assert.equal(parseIntent("kaunsa better hai").compare, true);
  assert.equal(parseIntent("turant shift ho sakte hain").status, "READY_TO_MOVE");
  assert.equal(parseIntent("latest projects in Noida").sort, "newest");
  assert.equal(detectLanguage("Bhai noida mein ghar kitne ka hai"), "hinglish");
});

test("parseIntent rejects browsing words as site visits", () => {
  // "dikhao" means "show me", not "take me to the site". It used to set
  // siteVisit and make the assistant add an unrelated site-visit line.
  assert.equal(parseIntent("options dikhao").siteVisit, false);
  assert.equal(parseIntent("sasta dikhao").siteVisit, false);
  assert.equal(parseIntent("ghar dekhna hai").siteVisit, false);
  assert.equal(parseIntent("site visit book karna hai").siteVisit, true);
  assert.equal(parseIntent("साइट विज़िट बुक करनी है").siteVisit, true);
});

test("parseIntent reads Devanagari sort words", () => {
  // JavaScript's \b is ASCII-only, so Devanagari alternatives need their own
  // Unicode-aware match.
  assert.equal(parseIntent("नोएडा में सस्ता 2 बीएचके दिखाओ").sort, "price-asc");
  assert.equal(parseIntent("बजट में सस्ती फ्लैट दिखाओ").sort, "price-asc");
  assert.equal(parseIntent("premium projects dikhao").sort, "price-desc");
});

test("detectLanguage follows conversational Hinglish verbs", () => {
  assert.equal(detectLanguage("booking kaise kare"), "hinglish");
  assert.equal(detectLanguage("possession kab hoga"), "hinglish");
  assert.equal(detectLanguage("Docs kab tak milenge"), "en");
});

test("mergeIntents combines criteria and de-duplicates amenities", () => {
  const merged = mergeIntents(
    { location: "noida", amenities: ["Gymnasium"] },
    { bhk: "3", amenities: ["Gymnasium", "Spa"], compare: true },
    null,
  );
  assert.equal(merged.location, "noida");
  assert.equal(merged.bhk, "3");
  assert.equal(merged.compare, true);
  assert.deepEqual(merged.amenities.sort(), ["Gymnasium", "Spa"]);
});

test("sanitiseExternalIntent whitelists provider output", () => {
  const safe = sanitiseExternalIntent({
    location: "Greater Noida",
    minPrice: 5_000_000.7,
    maxPrice: 9_000_000,
    bhk: "3",
    propertyType: "RESIDENTIAL",
    status: "NEW_LAUNCH",
    possessionYear: 2027,
    amenities: ["swimming pool", "not-a-real-amenity"],
    compare: true,
    siteVisit: "yes",
    injected: "<script>",
  });

  assert.equal(safe.location, "greater-noida");
  assert.equal(safe.minPrice, 5_000_001);
  assert.deepEqual(safe.amenities, ["Swimming Pool"]);
  assert.equal(safe.compare, true);
  assert.equal(safe.siteVisit, undefined);
  assert.equal(safe.sort, undefined);
  assert.equal("injected" in safe, false);

  assert.equal(sanitiseExternalIntent({ sort: "price-asc" }).sort, "price-asc");
  assert.equal(sanitiseExternalIntent({ sort: "newest" }).sort, "newest");
  assert.equal(sanitiseExternalIntent({ sort: "DROP TABLE" }).sort, undefined);
});

test("sanitiseExternalIntent rejects invalid values", () => {
  const safe = sanitiseExternalIntent({
    location: "mars",
    minPrice: -5,
    maxPrice: 5_000_000_000,
    bhk: "9",
    propertyType: "LAND",
    status: "SOLD",
    possessionYear: 1999,
  });
  assert.equal(safe.location, undefined);
  assert.equal(safe.minPrice, undefined);
  assert.equal(safe.maxPrice, undefined);
  assert.equal(safe.bhk, undefined);
  assert.equal(safe.propertyType, undefined);
  assert.equal(safe.status, undefined);
  assert.equal(safe.possessionYear, undefined);
  assert.equal(sanitiseExternalIntent("nope"), null);
});
