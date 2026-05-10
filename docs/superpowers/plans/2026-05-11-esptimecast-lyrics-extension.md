# ESPTimeCast Lyrics Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Chrome Manifest V3 extension that syncs LRCLIB timestamped lyrics from YouTube, YouTube Music, and Apple Music web players to ESPTimeCast through the existing `/action` API.

**Architecture:** The extension is self-contained in `ESPTimeCast_Lyrics_Extension/`. Content scripts report player state, the background service worker fetches and schedules synced lyrics, and the popup manages device URL/testing/sync state.

**Tech Stack:** Chrome Manifest V3, plain JavaScript ES modules, Chrome storage/runtime APIs, LRCLIB HTTP API, Node `node:test` unit tests.

---

## File Structure

- `ESPTimeCast_Lyrics_Extension/manifest.json`: Chrome extension metadata, permissions, content script matches, popup, background worker.
- `ESPTimeCast_Lyrics_Extension/background.js`: settings, player-state reducer, LRCLIB lookup, ESPTimeCast API calls.
- `ESPTimeCast_Lyrics_Extension/popup.html`: compact popup UI.
- `ESPTimeCast_Lyrics_Extension/popup.css`: popup styling.
- `ESPTimeCast_Lyrics_Extension/popup.js`: popup state, URL storage, Test button, sync toggle.
- `ESPTimeCast_Lyrics_Extension/content/youtube.js`: YouTube and YouTube Music state extraction.
- `ESPTimeCast_Lyrics_Extension/content/apple-music.js`: Apple Music web state extraction.
- `ESPTimeCast_Lyrics_Extension/lib/config.js`: URL normalization and defaults.
- `ESPTimeCast_Lyrics_Extension/lib/title-cleaner.js`: noisy music-title cleanup.
- `ESPTimeCast_Lyrics_Extension/lib/lrc.js`: synced lyric parser and active-line selector.
- `ESPTimeCast_Lyrics_Extension/lib/lrclib.js`: LRCLIB URL building and response normalization.
- `ESPTimeCast_Lyrics_Extension/test/*.test.js`: Node unit tests.
- `ESPTimeCast_Lyrics_Extension/package.json`: local test script.
- `ESPTimeCast_Lyrics_Extension/README.md`: load/test/use instructions.

## Tasks

### Task 1: Tested Core Libraries

- [ ] Add failing tests for URL normalization, title cleanup, LRC parsing, active-line selection, and LRCLIB URL construction.
- [ ] Run `npm test` in `ESPTimeCast_Lyrics_Extension` and confirm tests fail because modules are missing.
- [ ] Implement `lib/config.js`, `lib/title-cleaner.js`, `lib/lrc.js`, and `lib/lrclib.js`.
- [ ] Run `npm test` and confirm the core library tests pass.

### Task 2: Extension Shell

- [ ] Add `manifest.json`, popup HTML/CSS/JS, and initial background worker.
- [ ] Persist `deviceUrl` and `syncEnabled` through Chrome storage.
- [ ] Implement Test button with `GET /status`.
- [ ] Add README instructions for loading the unpacked extension.

### Task 3: Player Detection

- [ ] Add YouTube/YouTube Music content script that reports title, artist if available, playback position, duration, paused state, and URL.
- [ ] Add Apple Music content script that reports title, artist if available, playback position, duration, paused state, and URL.
- [ ] Send `PLAYER_STATE` messages to the background worker once per second.

### Task 4: Lyrics Sync Loop

- [ ] In `background.js`, detect track changes and fetch LRCLIB synced lyrics once per track.
- [ ] Parse synced lyrics and send the active line only when it changes.
- [ ] Clear the ESPTimeCast message when sync is disabled, playback pauses, or player state goes stale.
- [ ] Surface state to popup: source, title, artist, lyric status, device status, current line.

### Task 5: Verification

- [ ] Run `npm test` in `ESPTimeCast_Lyrics_Extension`.
- [ ] Validate `manifest.json` is valid JSON.
- [ ] Confirm every referenced extension file exists.
- [ ] Report manual browser testing steps and any device testing not performed.
