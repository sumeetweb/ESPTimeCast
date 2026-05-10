const FALLBACK_LINE_MS = 2000;

export function plainLyricsToTimedLines(plainLyrics, durationSeconds) {
  const lines = String(plainLyrics || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const durationMs = Number(durationSeconds) > 0 ? Number(durationSeconds) * 1000 : lines.length * FALLBACK_LINE_MS;
  const lineMs = durationMs / lines.length;

  return lines.map((text, index) => ({
    timeMs: Math.round(index * lineMs),
    text
  }));
}
