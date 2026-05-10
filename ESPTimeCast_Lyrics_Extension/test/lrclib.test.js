import test from "node:test";
import assert from "node:assert/strict";

import { buildLrclibSearchUrl, selectBestSyncedLyrics } from "../lib/lrclib.js";

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
