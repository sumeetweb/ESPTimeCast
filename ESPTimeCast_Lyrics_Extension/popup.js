import { DEFAULT_DEVICE_URL, normalizeDeviceUrl } from "./lib/config.js";

const elements = {
  deviceUrl: document.getElementById("deviceUrl"),
  testDevice: document.getElementById("testDevice"),
  syncEnabled: document.getElementById("syncEnabled"),
  deviceStatus: document.getElementById("deviceStatus"),
  source: document.getElementById("source"),
  track: document.getElementById("track"),
  lyricStatus: document.getElementById("lyricStatus"),
  currentLine: document.getElementById("currentLine"),
  error: document.getElementById("error")
};

elements.testDevice.addEventListener("click", async () => {
  elements.testDevice.disabled = true;
  await sendMessage({
    type: "TEST_DEVICE",
    deviceUrl: elements.deviceUrl.value
  });
  elements.testDevice.disabled = false;
  await refresh();
});

elements.deviceUrl.addEventListener("change", saveSettings);
elements.syncEnabled.addEventListener("change", saveSettings);

refresh();
setInterval(refresh, 1000);

async function saveSettings() {
  await sendMessage({
    type: "SAVE_SETTINGS",
    settings: {
      deviceUrl: normalizeDeviceUrl(elements.deviceUrl.value),
      syncEnabled: elements.syncEnabled.checked
    }
  });
  await refresh();
}

async function refresh() {
  const response = await sendMessage({ type: "GET_STATE" });
  render(response.state);
}

function render(state) {
  const settings = state?.settings || {};
  const player = state?.player;
  const track = state?.detectedTrack;

  elements.deviceUrl.value = settings.deviceUrl || DEFAULT_DEVICE_URL;
  elements.syncEnabled.checked = Boolean(settings.syncEnabled);
  elements.deviceStatus.textContent = labelForStatus(state?.deviceStatus || "unknown");
  elements.source.textContent = player?.source || "Not detected";
  elements.track.textContent = track?.title
    ? `${track.artist ? `${track.artist} - ` : ""}${track.title}`
    : player?.title || "-";
  elements.lyricStatus.textContent = labelForStatus(state?.lyricStatus || "idle");
  elements.currentLine.textContent = state?.currentLine || "-";

  if (state?.error) {
    elements.error.hidden = false;
    elements.error.textContent = state.error;
  } else {
    elements.error.hidden = true;
    elements.error.textContent = "";
  }
}

function labelForStatus(status) {
  return String(status || "")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function sendMessage(message) {
  return chrome.runtime.sendMessage(message);
}
