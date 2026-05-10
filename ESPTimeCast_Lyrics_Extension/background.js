import { DEFAULT_DEVICE_URL, normalizeDeviceUrl } from "./lib/config.js";
import { clearDeviceMessage, sendLyricLine, testDeviceConnection } from "./lib/device-api.js";
import { parseSyncedLyrics } from "./lib/lrc.js";
import { selectLyricDisplayChunk } from "./lib/lyric-display.js";
import { searchSyncedLyrics } from "./lib/lrclib.js";
import { cleanTrackMetadata, makeTrackKey } from "./lib/title-cleaner.js";

const DEFAULT_SETTINGS = {
  deviceUrl: DEFAULT_DEVICE_URL,
  syncEnabled: false
};

const state = {
  settings: { ...DEFAULT_SETTINGS },
  player: null,
  detectedTrack: null,
  trackKey: "",
  lyricStatus: "idle",
  deviceStatus: "unknown",
  currentLine: "",
  error: "",
  lyrics: [],
  lyricsTrackKey: "",
  fetchInFlight: null,
  lastSentLine: "",
  lastPlayerAt: 0
};

chrome.runtime.onInstalled.addListener(() => {
  loadSettings();
});

loadSettings();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((error) => {
      state.error = error.message;
      sendResponse({ ok: false, error: error.message, state: snapshotState() });
    });
  return true;
});

async function handleMessage(message, sender) {
  if (!message || typeof message.type !== "string") {
    return { ok: false, error: "Unknown message" };
  }

  if (message.type === "GET_STATE") {
    await loadSettings();
    markStalePlayerIfNeeded();
    return { ok: true, state: snapshotState() };
  }

  if (message.type === "SAVE_SETTINGS") {
    await saveSettings(message.settings || {});
    if (!state.settings.syncEnabled) await clearCurrentLine();
    return { ok: true, state: snapshotState() };
  }

  if (message.type === "TEST_DEVICE") {
    await testConfiguredDevice(message.deviceUrl);
    return { ok: true, state: snapshotState() };
  }

  if (message.type === "PLAYER_STATE") {
    if (sender?.tab && sender.tab.active === false) return { ok: true };
    await updatePlayerState(message.payload || {});
    return { ok: true };
  }

  return { ok: false, error: `Unsupported message type ${message.type}` };
}

async function loadSettings() {
  const stored = await chrome.storage.local.get(DEFAULT_SETTINGS);
  state.settings = {
    deviceUrl: normalizeDeviceUrl(stored.deviceUrl),
    syncEnabled: Boolean(stored.syncEnabled)
  };
}

async function saveSettings(partial) {
  state.settings = {
    ...state.settings,
    ...partial,
    deviceUrl: normalizeDeviceUrl(partial.deviceUrl ?? state.settings.deviceUrl),
    syncEnabled: Boolean(partial.syncEnabled ?? state.settings.syncEnabled)
  };
  await chrome.storage.local.set(state.settings);
}

async function testConfiguredDevice(deviceUrl) {
  const nextUrl = normalizeDeviceUrl(deviceUrl || state.settings.deviceUrl);
  await saveSettings({ deviceUrl: nextUrl });

  try {
    await testDeviceConnection(nextUrl);
    state.deviceStatus = "connected";
    state.error = "";
  } catch (error) {
    state.deviceStatus = "error";
    state.error = error.message;
    throw error;
  }
}

async function updatePlayerState(player) {
  state.player = sanitizePlayerState(player);
  state.lastPlayerAt = Date.now();

  if (!state.settings.syncEnabled) {
    state.lyricStatus = "disabled";
    return;
  }

  if (!state.player.title) {
    state.lyricStatus = "unsupported";
    await clearCurrentLine();
    return;
  }

  state.detectedTrack = cleanTrackMetadata(state.player);
  state.trackKey = makeTrackKey({
    source: state.player.source,
    ...state.detectedTrack
  });

  if (state.player.paused) {
    state.lyricStatus = "paused";
    await clearCurrentLine();
    return;
  }

  await ensureLyricsForCurrentTrack();
  await sendCurrentLine();
}

async function ensureLyricsForCurrentTrack() {
  if (state.lyricsTrackKey === state.trackKey && state.lyrics.length > 0) return;
  if (state.fetchInFlight && state.fetchInFlight.trackKey === state.trackKey) {
    await state.fetchInFlight.promise;
    return;
  }

  state.lyricStatus = "searching";
  state.currentLine = "";
  state.lyrics = [];
  state.lyricsTrackKey = "";
  state.lastSentLine = "";

  const promise = searchSyncedLyrics(state.detectedTrack)
    .then((result) => {
      if (!result) {
        state.lyricStatus = "no-synced-lyrics";
        return;
      }

      state.lyrics = parseSyncedLyrics(result.syncedLyrics);
      state.lyricsTrackKey = state.trackKey;
      state.lyricStatus = state.lyrics.length > 0 ? "synced" : "no-synced-lyrics";
    })
    .catch((error) => {
      state.lyricStatus = "lyrics-api-error";
      state.error = error.message;
    })
    .finally(() => {
      state.fetchInFlight = null;
    });

  state.fetchInFlight = { trackKey: state.trackKey, promise };
  await promise;
}

async function sendCurrentLine() {
  if (state.lyricStatus !== "synced") return;

  const chunk = selectLyricDisplayChunk(state.lyrics, state.player.position);
  const displayLine = chunk?.text || "";

  if (!displayLine || displayLine === state.lastSentLine) return;

  try {
    await sendLyricLine(state.settings.deviceUrl, displayLine);
    state.deviceStatus = "connected";
    state.currentLine = displayLine;
    state.lastSentLine = displayLine;
    state.error = "";
  } catch (error) {
    state.deviceStatus = "error";
    state.error = error.message;
  }
}

async function clearCurrentLine() {
  if (!state.lastSentLine && !state.currentLine) return;

  try {
    await clearDeviceMessage(state.settings.deviceUrl);
    state.currentLine = "";
    state.lastSentLine = "";
  } catch (error) {
    state.deviceStatus = "error";
    state.error = error.message;
  }
}

function markStalePlayerIfNeeded() {
  if (state.lastPlayerAt && Date.now() - state.lastPlayerAt > 5000) {
    state.lyricStatus = state.settings.syncEnabled ? "waiting-for-player" : "disabled";
    state.player = null;
    state.currentLine = "";
  }
}

function sanitizePlayerState(player) {
  return {
    source: String(player.source || "unknown"),
    title: String(player.title || "").trim(),
    artist: String(player.artist || "").trim(),
    position: Number.isFinite(Number(player.position)) ? Number(player.position) : 0,
    duration: Number.isFinite(Number(player.duration)) ? Number(player.duration) : 0,
    paused: Boolean(player.paused),
    url: String(player.url || "")
  };
}

function snapshotState() {
  return {
    settings: { ...state.settings },
    player: state.player ? { ...state.player } : null,
    detectedTrack: state.detectedTrack ? { ...state.detectedTrack } : null,
    lyricStatus: state.lyricStatus,
    deviceStatus: state.deviceStatus,
    currentLine: state.currentLine,
    error: state.error
  };
}
