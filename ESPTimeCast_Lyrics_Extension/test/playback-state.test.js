import test from "node:test";
import assert from "node:assert/strict";

import { createPlaybackSendState, shouldSendChunk, notePaused, noteSent } from "../lib/playback-state.js";

test("does not resend the same chunk during uninterrupted playback", () => {
  const state = createPlaybackSendState();

  assert.equal(shouldSendChunk(state, "HELLO"), true);
  noteSent(state, "HELLO");
  assert.equal(shouldSendChunk(state, "HELLO"), false);
});

test("resends the same chunk after playback was paused", () => {
  const state = createPlaybackSendState();

  assert.equal(shouldSendChunk(state, "HELLO"), true);
  noteSent(state, "HELLO");
  notePaused(state);
  assert.equal(shouldSendChunk(state, "HELLO"), true);
});
