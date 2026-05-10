export function createPlaybackSendState() {
  return {
    lastSentLine: "",
    forceNextSend: false
  };
}

export function notePaused(state) {
  state.forceNextSend = true;
  state.lastSentLine = "";
}

export function noteSent(state, chunk) {
  state.lastSentLine = chunk;
  state.forceNextSend = false;
}

export function shouldSendChunk(state, chunk) {
  if (!chunk) return false;
  if (state.forceNextSend) return true;
  return chunk !== state.lastSentLine;
}
