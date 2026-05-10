import test from "node:test";
import assert from "node:assert/strict";

import { plainLyricsToTimedLines } from "../lib/plain-lyrics.js";

test("converts plain lyrics into evenly timed lines across track duration", () => {
  assert.deepEqual(plainLyricsToTimedLines("First\nSecond\nThird", 90), [
    { timeMs: 0, text: "First" },
    { timeMs: 30000, text: "Second" },
    { timeMs: 60000, text: "Third" }
  ]);
});

test("ignores blank plain lyric lines", () => {
  assert.deepEqual(plainLyricsToTimedLines("\nFirst\n\nSecond\n", 20), [
    { timeMs: 0, text: "First" },
    { timeMs: 10000, text: "Second" }
  ]);
});

test("uses a readable fallback cadence when duration is missing", () => {
  assert.deepEqual(plainLyricsToTimedLines("First\nSecond", 0), [
    { timeMs: 0, text: "First" },
    { timeMs: 2000, text: "Second" }
  ]);
});
