import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { demoCategories, demoPeople } from "./seed";
import { confirmationMessage, parseCloudLedgerSms } from "./sms-parser";

const dad = demoPeople.find((person) => person.role === "dad")!;
const jesse = demoPeople.find((person) => person.name === "Jesse")!;

describe("parseCloudLedgerSms", () => {
  it("parses a kid defaulting to Dad owes kid", () => {
    const result = parseCloudLedgerSms({ body: "64 Uber Eats", sender: jesse, people: demoPeople, categories: demoCategories });
    assert.equal(result.ok, true);
    assert.equal(result.ok && result.amountCents, 6400);
    assert.equal(result.ok && result.description, "Uber Eats");
    assert.equal(result.ok && result.category.slug, "food-delivery");
    assert.equal(result.ok && result.direction, "dad_owes_kid");
  });

  it("parses a kid saying the kid owes Dad", () => {
    const result = parseCloudLedgerSms({ body: "to dad 110 shoes", sender: jesse, people: demoPeople, categories: demoCategories });
    assert.equal(result.ok, true);
    assert.equal(result.ok && result.amountCents, 11000);
    assert.equal(result.ok && result.description, "shoes");
    assert.equal(result.ok && result.category.slug, "clothing-shopping");
    assert.equal(result.ok && result.direction, "kid_owes_dad");
  });

  it("parses dad owes me wording from a kid", () => {
    const result = parseCloudLedgerSms({ body: "dad owes me 116 chalet bbq", sender: jesse, people: demoPeople, categories: demoCategories });
    assert.equal(result.ok, true);
    assert.equal(result.ok && result.amountCents, 11600);
    assert.equal(result.ok && result.description, "chalet bbq");
    assert.equal(result.ok && result.category.slug, "food-delivery");
    assert.equal(result.ok && result.direction, "dad_owes_kid");
  });

  it("parses Dad defaulting to kid owes Dad", () => {
    const result = parseCloudLedgerSms({ body: "Jesse 45 gas", sender: dad, people: demoPeople, categories: demoCategories });
    assert.equal(result.ok, true);
    assert.equal(result.ok && result.kid.name, "Jesse");
    assert.equal(result.ok && result.amountCents, 4500);
    assert.equal(result.ok && result.description, "gas");
    assert.equal(result.ok && result.category.slug, "travel-transport");
    assert.equal(result.ok && result.direction, "kid_owes_dad");
  });

  it("parses Dad owing a kid", () => {
    const result = parseCloudLedgerSms({ body: "Jesse I owe you 80 dinner", sender: dad, people: demoPeople, categories: demoCategories });
    assert.equal(result.ok, true);
    assert.equal(result.ok && result.kid.name, "Jesse");
    assert.equal(result.ok && result.amountCents, 8000);
    assert.equal(result.ok && result.description, "dinner");
    assert.equal(result.ok && result.category.slug, "food-delivery");
    assert.equal(result.ok && result.direction, "dad_owes_kid");
  });

  it("does not save Dad SMS with no kid", () => {
    const result = parseCloudLedgerSms({ body: "22 coffee", sender: dad, people: demoPeople, categories: demoCategories });
    assert.equal(result.ok, false);
    assert.equal(!result.ok && result.reason, "missing_kid");
    assert.equal(!result.ok && result.reply, "Who is this for? Text it like: 'Jesse 22 coffee.'");
  });

  it("formats the confirmation TwiML text", () => {
    const result = parseCloudLedgerSms({ body: "64 Uber Eats", sender: jesse, people: demoPeople, categories: demoCategories });
    assert.equal(result.ok, true);
    assert.equal(result.ok && confirmationMessage(result), "Added: Dad owes Jesse $64.00 for Uber Eats - Food / Delivery");
  });
});
