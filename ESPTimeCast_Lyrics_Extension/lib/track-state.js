import { createPlaybackSendState, notePaused } from "./playback-state.js";

export function createTrackState() {
  return {
    trackKey: "",
    lyrics: [],
    lyricsTrackKey: "",
    lyricsType: "",
    currentLine: "",
    sendState: createPlaybackSendState()
  };
}

export function hasTrackChanged(state, nextTrackKey) {
  return Boolean(state.trackKey) && state.trackKey !== nextTrackKey;
}

export function resetForTrackChange(state, nextTrackKey) {
  state.trackKey = nextTrackKey;
  state.currentLine = "";
  state.lyrics = [];
  state.lyricsTrackKey = "";
  state.lyricsType = "";
  notePaused(state.sendState);
}

export function getCachedLyricsStatus(state) {
  if (state.lyricsTrackKey !== state.trackKey) return "";
  if (!Array.isArray(state.lyrics) || state.lyrics.length === 0) return "";
  return state.lyricsType || "synced";
}
