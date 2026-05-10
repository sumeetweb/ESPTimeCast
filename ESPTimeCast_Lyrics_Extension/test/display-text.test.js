import test from "node:test";
import assert from "node:assert/strict";

import { toDisplayText } from "../lib/display-text.js";

test("transliterates Devanagari lyric text to ASCII for ESPTimeCast", () => {
  assert.equal(toDisplayText("दिल है छोटा सा"), "DIL HAI CHHOTA SA");
});

test("normalizes Latin diacritics and smart punctuation", () => {
  assert.equal(toDisplayText("Cœur déjà vu — it’s fine"), "COEUR DEJA VU - IT'S FINE");
});

test("removes unsupported emoji and collapses whitespace", () => {
  assert.equal(toDisplayText("hello 🌙   world"), "HELLO WORLD");
});

test("limits display text to the custom message capacity", () => {
  assert.equal(toDisplayText("a".repeat(200)).length, 120);
});
