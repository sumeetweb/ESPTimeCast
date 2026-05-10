const TIMESTAMP_PATTERN = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?]/g;

export function parseSyncedLyrics(lrcText) {
  const rows = String(lrcText || "").split(/\r?\n/);
  const lines = [];

  for (const row of rows) {
    const timestamps = [...row.matchAll(TIMESTAMP_PATTERN)];
    if (timestamps.length === 0) continue;

    const text = row.replace(TIMESTAMP_PATTERN, "").trim();
    if (!text) continue;

    for (const match of timestamps) {
      lines.push({
        timeMs: timestampToMs(match),
        text
      });
    }
  }

  return lines.sort((a, b) => a.timeMs - b.timeMs);
}

export function findActiveLyricLine(lines, positionSeconds) {
  if (!Array.isArray(lines) || lines.length === 0) return null;

  const positionMs = Math.max(0, Number(positionSeconds) * 1000);
  let active = null;

  for (const line of lines) {
    if (line.timeMs > positionMs) break;
    active = line;
  }

  return active;
}

function timestampToMs(match) {
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  const fraction = String(match[3] || "0").padEnd(3, "0").slice(0, 3);

  return minutes * 60000 + seconds * 1000 + Number(fraction);
}
