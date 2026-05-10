import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("background message handler receives the Chrome sender argument", () => {
  const background = readFileSync(new URL("../background.js", import.meta.url), "utf8");

  assert.match(background, /async function handleMessage\s*\(\s*message\s*,\s*sender\s*\)/);
  assert.match(background, /sender\?\.tab/);
});
