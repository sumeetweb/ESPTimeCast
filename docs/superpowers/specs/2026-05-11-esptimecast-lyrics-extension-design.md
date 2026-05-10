# ESPTimeCast Lyrics Extension Design

Date: 2026-05-11

## Goal

Build a Chrome Manifest V3 extension that syncs timestamped song lyrics from supported web players to an ESPTimeCast ESP32/ESP8266 device using the existing HTTP `/action` API. V1 is extension-only and does not require firmware changes.

## Supported Players

- YouTube watch pages on `youtube.com`
- YouTube Music on `music.youtube.com`
- Apple Music web player on `music.apple.com`

Native desktop or mobile music apps are out of scope.

## User Configuration

- The extension stores an ESPTimeCast base URL in Chrome storage.
- Default URL: `http://esptimecast.local`
- The popup includes a Test button that calls `GET <baseUrl>/status`.
- Sync is enabled or disabled from the popup.

## Lyrics Provider

- V1 uses LRCLIB only.
- The extension searches LRCLIB from detected track metadata.
- Only synced lyrics are streamed to ESPTimeCast.
- If synced lyrics are missing, the popup shows a no-synced-lyrics state and sends nothing.

## Architecture

- `manifest.json` defines extension permissions, host permissions, content scripts, popup, and background service worker.
- Content scripts run on supported music sites and report player state to the background service worker.
- The background service worker owns device settings, lyrics lookup, parsed LRC state, and ESPTimeCast calls.
- The popup reads extension state and updates user settings.
- Small library modules handle URL normalization, title cleanup, LRC parsing, and line selection.

## Data Flow

1. A content script reads current track metadata and media playback position.
2. The content script sends a `PLAYER_STATE` message to the background service worker.
3. The background worker normalizes title/artist metadata and queries LRCLIB.
4. LRCLIB synced lyrics are parsed into timestamped lines.
5. Whenever the active lyric line changes, the background worker sends that line to ESPTimeCast.
6. When playback pauses, sync is disabled, or the active tab stops reporting, the background worker clears the temporary message.

## ESPTimeCast API Use

- Test connection: `GET <baseUrl>/status`
- Send lyric line: `POST <baseUrl>/action` with `application/x-www-form-urlencoded`
  - `message=<line>`
  - `seconds=4`
  - `scrolls=1`
  - `interrupt=1`
- Clear: `GET <baseUrl>/action?clear_message`

## Error Handling

- Device unreachable: popup shows a device error and keeps sync disabled until the user fixes the URL or tests again.
- LRCLIB no match: popup shows no synced lyrics found.
- LRCLIB network/API error: popup shows lyrics API error.
- Unsupported page: popup shows no supported player detected.
- Paused playback: the background worker stops sending new lines and clears the display after a short grace period.

## Testing

- Unit tests cover title cleanup, LRC parsing, lyric-line selection, URL normalization, and LRCLIB request URL building.
- Manual testing covers extension loading, popup settings, supported-player detection, and calls to a real ESPTimeCast device or local request inspector.

## Out Of Scope

- Firmware changes
- Dedicated lyrics endpoint
- Native Apple Music app support
- User-provided `.lrc` upload
- Unsynced lyrics display
- OAuth with YouTube, YouTube Music, Apple Music, or LRCLIB
