import test from "node:test";
import assert from "node:assert/strict";

import { cleanTrackMetadata, makeTrackKey } from "../lib/title-cleaner.js";

test("extracts artist and title from common YouTube title format", () => {
  assert.deepEqual(
    cleanTrackMetadata({
      title: "Daft Punk - Harder Better Faster Stronger (Official Video) [HD]",
      artist: "",
      source: "youtube"
    }),
    {
      artist: "Daft Punk",
      title: "Harder Better Faster Stronger"
    }
  );
});

test("keeps explicit player artist and strips Apple Music suffixes", () => {
  assert.deepEqual(
    cleanTrackMetadata({
      title: "Bad Guy - Single",
      artist: "Billie Eilish",
      source: "apple-music"
    }),
    {
      artist: "Billie Eilish",
      title: "Bad Guy"
    }
  );
});

test("removes noisy video labels without destroying featuring artists", () => {
  assert.deepEqual(
    cleanTrackMetadata({
      title: "The Weeknd feat. Daft Punk - Starboy (Lyrics)",
      artist: "",
      source: "youtube"
    }),
    {
      artist: "The Weeknd feat. Daft Punk",
      title: "Starboy"
    }
  );
});

test("track key is stable across whitespace and case changes", () => {
  assert.equal(
    makeTrackKey({ source: "youtube", artist: " Daft Punk ", title: "Harder  Better" }),
    "youtube::daft punk::harder better"
  );
});
