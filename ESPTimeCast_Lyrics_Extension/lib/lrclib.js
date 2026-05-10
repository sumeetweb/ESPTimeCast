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

export async function searchSyncedLyrics(track, fetchImpl = fetch) {
  const response = await fetchImpl(buildLrclibSearchUrl(track), {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`LRCLIB returned ${response.status}`);
  }

  const results = await response.json();
  return selectBestSyncedLyrics(results);
}
