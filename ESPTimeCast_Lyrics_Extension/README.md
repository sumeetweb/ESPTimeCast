# ESPTimeCast Lyrics Sync Extension

Chrome Manifest V3 extension that syncs LRCLIB timestamped lyrics from supported web players to an ESPTimeCast device.

## Supported players

- YouTube watch pages
- YouTube Music
- Apple Music web player

## Load unpacked

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose Load unpacked.
4. Select `ESPTimeCast_Lyrics_Extension`.

## Use

1. Open the extension popup.
2. Set the ESPTimeCast URL, usually `http://esptimecast.local`.
3. Press Test.
4. Open a supported music web player.
5. Enable Sync lyrics to display.

The extension uses LRCLIB only. If LRCLIB has no synced lyrics for the detected track, the extension will not stream unsynced lyrics.

## Test

```powershell
npm test
```
