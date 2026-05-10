const LRCLIB_SEARCH_URL = "https://lrclib.net/api/search";

export function buildLrclibSearchUrl({ artist = "", title = "" } = {}) {
  const params = new URLSearchParams();
  if (artist) params.set("artist_name", artist);
  if (title) params.set("track_name", title);
  return `${LRCLIB_SEARCH_URL}?${params.toString()}`;
}

export function selectBestSyncedLyrics(results) {
  if (!Array.isArray(results)) return null;
  return results.find((item) => typeof item.syncedLyrics === "string" && item.syncedLyrics.trim()) || null;
}

export function selectBestLyrics(results) {
  if (!Array.isArray(results)) return null;

  const synced = selectBestSyncedLyrics(results);
  if (synced) return { type: "synced", result: synced };

  const plain = results.find((item) => typeof item.plainLyrics === "string" && item.plainLyrics.trim());
  if (plain) return { type: "plain", result: plain };

  return null;
}

export async function searchLyrics(track, fetchImpl = fetch) {
  const response = await fetchImpl(buildLrclibSearchUrl(track), {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`LRCLIB returned ${response.status}`);
  }

  const results = await response.json();
  return selectBestLyrics(results);
}

export async function searchSyncedLyrics(track, fetchImpl = fetch) {
  const selected = await searchLyrics(track, fetchImpl);
  return selected?.type === "synced" ? selected.result : null;
}
