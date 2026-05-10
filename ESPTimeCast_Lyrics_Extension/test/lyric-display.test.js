import test from "node:test";
import assert from "node:assert/strict";

import { selectLyricDisplayChunk, splitDisplayChunks } from "../lib/lyric-display.js";
import { parseSyncedLyrics } from "../lib/lrc.js";

test("splits display text into static chunks no longer than 8 characters", () => {
  assert.deepEqual(splitDisplayChunks("I LOVE THIS SONG"), ["I LOVE", "THIS", "SONG"]);
});

test("hard-splits single words longer than the static display limit", () => {
  assert.deepEqual(splitDisplayChunks("SUPERCALIFRAGILISTIC"), ["SUPERCAL", "IFRAGILI", "STIC"]);
});

test("selects queued chunks across the active lyric time window", () => {
  const lines = parseSyncedLyrics("[00:10.00]I LOVE THIS SONG\n[00:13.00]NEXT");

  assert.equal(selectLyricDisplayChunk(lines, 10.1)?.text, "I LOVE");
  assert.equal(selectLyricDisplayChunk(lines, 11.1)?.text, "THIS");
  assert.equal(selectLyricDisplayChunk(lines, 12.1)?.text, "SONG");
});

test("uses the last lyric fallback duration when there is no next timestamp", () => {
  const lines = parseSyncedLyrics("[00:10.00]FINAL LINE HERE");

  assert.equal(selectLyricDisplayChunk(lines, 10.2)?.text, "FINAL");
  assert.equal(selectLyricDisplayChunk(lines, 12.2)?.text, "LINE");
  assert.equal(selectLyricDisplayChunk(lines, 14.2)?.text, "HERE");
});
