import { toDisplayText } from "./display-text.js";
import { findActiveLyricLine } from "./lrc.js";

export const STATIC_DISPLAY_CHARS = 8;
const LAST_LINE_FALLBACK_MS = 6000;
const MIN_CHUNK_MS = 650;

export function splitDisplayChunks(text, maxChars = STATIC_DISPLAY_CHARS) {
  const clean = toDisplayText(text);
  if (!clean) return [];

  const chunks = [];
  let current = "";

  for (const word of clean.split(/\s+/)) {
    if (word.length > maxChars) {
      if (current) {
        chunks.push(current);
        current = "";
      }
      for (let i = 0; i < word.length; i += maxChars) {
        chunks.push(word.slice(i, i + maxChars));
      }
      continue;
    }

    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) chunks.push(current);
      current = word;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export function selectLyricDisplayChunk(lines, positionSeconds) {
  const active = findActiveLyricLine(lines, positionSeconds);
  if (!active) return null;

  const chunks = splitDisplayChunks(active.text);
  if (chunks.length === 0) return null;

  const activeIndex = lines.indexOf(active);
  const next = lines[activeIndex + 1] || null;
  const endMs = next ? next.timeMs : active.timeMs + LAST_LINE_FALLBACK_MS;
  const durationMs = Math.max(MIN_CHUNK_MS * chunks.length, endMs - active.timeMs);
  const chunkMs = Math.max(MIN_CHUNK_MS, durationMs / chunks.length);
  const elapsedMs = Math.max(0, Number(positionSeconds) * 1000 - active.timeMs);
  const chunkIndex = Math.min(chunks.length - 1, Math.floor(elapsedMs / chunkMs));

  return {
    text: chunks[chunkIndex],
    sourceText: active.text,
    chunkIndex,
    chunkCount: chunks.length
  };
}
