import test from "node:test";
import assert from "node:assert/strict";

import { buildLrclibSearchUrl, selectBestLyrics, selectBestSyncedLyrics } from "../lib/lrclib.js";

test("builds an encoded LRCLIB search URL from track metadata", () => {
  const url = buildLrclibSearchUrl({
    artist: "Daft Punk",
    title: "Harder Better Faster Stronger"
  });

  assert.equal(
    url,
    "https://lrclib.net/api/search?artist_name=Daft+Punk&track_name=Harder+Better+Faster+Stronger"
  );
});

test("selects the first result with synced lyrics", () => {
  const result = selectBestSyncedLyrics([
    { id: 1, syncedLyrics: null },
    { id: 2, syncedLyrics: "[00:01.00]Line" }
  ]);

  assert.deepEqual(result, { id: 2, syncedLyrics: "[00:01.00]Line" });
});

test("returns null when no result has synced lyrics", () => {
  assert.equal(selectBestSyncedLyrics([{ id: 1, plainLyrics: "Line" }]), null);
});

test("selects synced lyrics before plain lyrics", () => {
  const result = selectBestLyrics([
    { id: 1, plainLyrics: "Plain line" },
    { id: 2, syncedLyrics: "[00:01.00]Synced line", plainLyrics: "Synced line" }
  ]);

  assert.deepEqual(result, {
    type: "synced",
    result: { id: 2, syncedLyrics: "[00:01.00]Synced line", plainLyrics: "Synced line" }
  });
});

test("falls back to plain lyrics when synced lyrics are unavailable", () => {
  const result = selectBestLyrics([{ id: 1, plainLyrics: "Plain line" }]);

  assert.deepEqual(result, {
    type: "plain",
    result: { id: 1, plainLyrics: "Plain line" }
  });
});
