import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import { artwork, observanceSchema } from "../src/lib/content-schema.ts";
import { featuredSlugs, seed } from "../src/lib/seed.ts";
import { hashPassword, verifyPassword } from "../src/lib/password.ts";

test("seed content is valid, unique, bilingual, sourced, and illustrated", () => {
  assert.equal(new Set(seed.map(entry => entry.slug)).size, seed.length);
  assert.equal(new Set(seed.map(entry => entry.date.slice(0,2))).size, 12);
  for (const story of seed) {
    assert.equal(observanceSchema.safeParse(story).success, true, story.slug);
    assert.notEqual(story.title.en, story.title.bn);
    assert.ok(existsSync("public" + artwork[story.image].file));
  }
  assert.ok(featuredSlugs.every(slug => seed.some(story => story.slug === slug)));
});
test("invalid dates, source protocols, and unreferenced submissions are rejected", () => {
  assert.equal(observanceSchema.safeParse({ ...seed[0], date: "02-30" }).success, false);
  assert.equal(observanceSchema.safeParse({ ...seed[0], sources: [] }).success, false);
  assert.equal(observanceSchema.safeParse({ ...seed[0], sources: [{ name: "Invalid", url: "javascript:alert(1)" }] }).success, false);
});
test("password hashing is salted and verifies only the matching password", async () => {
  const password = "example password for test";
  const hash = await hashPassword(password);
  assert.notEqual(hash, await hashPassword(password));
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword("wrong", hash), false);
  assert.equal(await verifyPassword(password, "malformed"), false);
});