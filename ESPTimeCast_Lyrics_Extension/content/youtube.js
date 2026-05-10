const SOURCE = location.hostname === "music.youtube.com" ? "youtube-music" : "youtube";
let observedMedia = null;

setInterval(reportPlayerState, 250);
reportPlayerState();

function reportPlayerState() {
  const media = document.querySelector("video");
  if (!media) return;
  observeMedia(media);

  const metadata = readMediaSessionMetadata();
  const fallback = SOURCE === "youtube-music" ? readYouTubeMusicMetadata() : readYouTubeMetadata();
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

function readYouTubeMusicMetadata() {
  const title =
    text(".title.ytmusic-player-bar") ||
    text("ytmusic-player-bar .title") ||
    text("yt-formatted-string.title");

  const artistLinks = [
    ...document.querySelectorAll(".byline.ytmusic-player-bar a, ytmusic-player-bar .byline a")
  ]
    .map((node) => node.textContent.trim())
    .filter(Boolean);

  return {
    title,
    artist: artistLinks[0] || text(".byline.ytmusic-player-bar") || ""
  };
}

function readYouTubeMetadata() {
  const title =
    text("h1 yt-formatted-string") ||
    text("h1.title") ||
    document.title.replace(/\s+-\s+YouTube$/i, "").trim();

  const artist =
    text("ytd-video-owner-renderer #channel-name a") ||
    text("#owner #channel-name a") ||
    text("#text-container.ytd-channel-name a");

  return { title, artist };
}

function text(selector) {
  return document.querySelector(selector)?.textContent?.trim() || "";
}
