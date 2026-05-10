import test from "node:test";
import assert from "node:assert/strict";

import {
  createTrackState,
  getCachedLyricsStatus,
  hasTrackChanged,
  resetForTrackChange
} from "../lib/track-state.js";

test("detects a changed track key", () => {
  const state = createTrackState();
  state.trackKey = "youtube::artist::old";
  state.lyricsTrackKey = "youtube::artist::old";

  assert.equal(hasTrackChanged(state, "youtube::artist::new"), true);
  assert.equal(hasTrackChanged(state, "youtube::artist::old"), false);
});

test("clears lyric cache and display state on track change", () => {
  const state = createTrackState();
  state.lyrics = [{ timeMs: 0, text: "OLD" }];
  state.lyricsTrackKey = "youtube::artist::old";
  state.currentLine = "OLD";
  state.sendState.lastSentLine = "OLD";

  resetForTrackChange(state, "youtube::artist::new");

  assert.equal(state.trackKey, "youtube::artist::new");
  assert.deepEqual(state.lyrics, []);
  assert.equal(state.lyricsTrackKey, "");
  assert.equal(state.currentLine, "");
  assert.equal(state.sendState.lastSentLine, "");
  assert.equal(state.sendState.forceNextSend, true);
});

test("restores cached lyric status after pause without refetching lyrics", () => {
  const state = createTrackState();
  state.trackKey = "apple-music::artist::song";
  state.lyricsTrackKey = "apple-music::artist::song";
  state.lyrics = [{ timeMs: 0, text: "LINE" }];
  state.lyricsType = "plain-lyrics";

  assert.equal(getCachedLyricsStatus(state), "plain-lyrics");
});
