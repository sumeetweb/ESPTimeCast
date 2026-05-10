const SOURCE = "apple-music";
let observedMedia = null;

setInterval(reportPlayerState, 250);
reportPlayerState();

function reportPlayerState() {
  const media = document.querySelector("audio, video");
  if (!media) return;
  observeMedia(media);

  const metadata = readMediaSessionMetadata();
  const fallback = readAppleMusicMetadata();
  const title = metadata.title || fallback.title;
  const artist = metadata.artist || fallback.artist;

  if (!title) return;

  chrome.runtime.sendMessage({
    type: "PLAYER_STATE",
    payload: {
      source: SOURCE,
      title,
      artist,
      position: media.currentTime || 0,
      duration: Number.isFinite(media.duration) ? media.duration : 0,
      paused: media.paused,
      url: location.href
    }
  }).catch(() => {});
}

function observeMedia(media) {
  if (observedMedia === media) return;
  observedMedia = media;

  for (const eventName of ["play", "pause", "seeked", "loadedmetadata"]) {
    media.addEventListener(eventName, reportPlayerState, { passive: true });
  }
}

function readMediaSessionMetadata() {
  const metadata = navigator.mediaSession?.metadata;
  return {
    title: metadata?.title || "",
    artist: metadata?.artist || ""
  };
}

function readAppleMusicMetadata() {
  return {
    title:
      text("[data-testid='now-playing-title']") ||
      text(".lcd-meta__primary-text") ||
      text(".web-chrome-playback-lcd__song-name") ||
      text(".song-name"),
    artist:
      text("[data-testid='now-playing-subtitle']") ||
      text(".lcd-meta__secondary-text") ||
      text(".web-chrome-playback-lcd__sub-copy") ||
      text(".by-line")
  };
}

function text(selector) {
  return document.querySelector(selector)?.textContent?.trim() || "";
}
