const DASH_PATTERN = /\s[-–—]\s/;
const BRACKET_NOISE_PATTERN =
  /\s*[\[(](?:official\s+)?(?:music\s+)?(?:video|audio|lyrics?|lyric\s+video|visualizer|remaster(?:ed)?|hd|4k|mv|performance|live\s+video)[\])]\s*/gi;
const TRAILING_NOISE_PATTERN =
  /\s+-\s+(?:single|album|ep|song|official\s+music\s+video|official\s+audio|lyrics?)\s*$/i;

export function cleanTrackMetadata({ title = "", artist = "" } = {}) {
  const rawArtist = normalizeText(artist);
  let cleanTitle = normalizeText(title)
    .replace(/\s+\|\s+.*$/i, "")
    .replace(/\s+by\s+.+$/i, "")
    .replace(BRACKET_NOISE_PATTERN, " ")
    .replace(TRAILING_NOISE_PATTERN, "")
    .replace(/\s+/g, " ")
    .trim();

  let cleanArtist = rawArtist;
  if (!cleanArtist && DASH_PATTERN.test(cleanTitle)) {
    const [artistPart, ...titleParts] = cleanTitle.split(DASH_PATTERN);
    cleanArtist = normalizeText(artistPart);
    cleanTitle = normalizeText(titleParts.join(" - "));
  }

  cleanTitle = cleanTitle
    .replace(BRACKET_NOISE_PATTERN, " ")
    .replace(TRAILING_NOISE_PATTERN, "")
    .replace(/\s+/g, " ")
    .trim();

  return {
    artist: cleanArtist,
    title: cleanTitle
  };
}

export function makeTrackKey({ source = "", artist = "", title = "" } = {}) {
  return [source, artist, title].map((part) => normalizeText(part).toLowerCase()).join("::");
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
