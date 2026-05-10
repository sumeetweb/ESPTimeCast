import test from "node:test";
import assert from "node:assert/strict";

import { findActiveLyricLine, parseSyncedLyrics } from "../lib/lrc.js";

test("parses timestamped LRC lines in ascending order", () => {
  const lines = parseSyncedLyrics("[00:10.50]First line\n[00:12.00]Second line");

  assert.deepEqual(lines, [
    { timeMs: 10500, text: "First line" },
    { timeMs: 12000, text: "Second line" }
  ]);
});

test("supports multiple timestamps for one lyric line", () => {
  const lines = parseSyncedLyrics("[00:05.00][00:15.00]Repeat me");

  assert.deepEqual(lines, [
    { timeMs: 5000, text: "Repeat me" },
    { timeMs: 15000, text: "Repeat me" }
  ]);
});

test("ignores metadata and blank lyric rows", () => {
  const lines = parseSyncedLyrics("[ar:Artist]\n[00:01.00]\n[00:02.00]Lyric");

  assert.deepEqual(lines, [{ timeMs: 2000, text: "Lyric" }]);
});

test("selects the latest lyric at or before current playback time", () => {
  const lines = parseSyncedLyrics("[00:01.00]One\n[00:03.00]Three\n[00:05.00]Five");

  assert.equal(findActiveLyricLine(lines, 0), null);
  assert.equal(findActiveLyricLine(lines, 1.2)?.text, "One");
  assert.equal(findActiveLyricLine(lines, 4.9)?.text, "Three");
  assert.equal(findActiveLyricLine(lines, 6)?.text, "Five");
});
