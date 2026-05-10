# ESPTimeCast Manager (Flutter) — PRD (Runtime Controls)

Date: 2026-05-10  
Target device base URL default: `http://esptimecast.local`

## 1. Goal

Build a cross-platform Flutter app (Android + Web) that controls an ESPTimeCast device over LAN using its existing HTTP API, focusing strictly on **runtime controls** (no backup/restore, no firmware update, no config editing UI).

## 2. Target Platforms

- **Android** (phone/tablet on same LAN as the device)
- **Web** (served over **local HTTP** on the LAN so it can call `http://esptimecast.local` directly)

## 3. In Scope (v1)

### 3.1 Device management

- Add/edit/remove device base URLs (e.g., `http://esptimecast.local`, `http://192.168.1.50`)
- Switch active device
- “Test connection” (calls `GET /status`)

### 3.2 Status & monitoring (read-only)

- Status dashboard from `GET /status`:
  - Display mode / rotation state (as available)
  - Clock/time info
  - Weather summary (when enabled/available)
  - Countdown info (enabled/remaining/label)
  - Dimming status (enabled/start/end)
  - “Next donation time” field (display only; no donation controls in app)
- Optional info panels:
  - `GET /ip` (show device IP)
  - `GET /uptime` (human-friendly uptime)

### 3.3 Runtime controls

All runtime controls are implemented through the unified endpoint:

- `GET/POST /action`

**Display & brightness**
- Brightness slider: `brightness=<0..15>`
- Buttons: `brightness_up`, `brightness_down`
- Display on/off toggle: `display_off`
- Flip display: `flip`
- Rotation toggle: `enable_rotation`
- Navigation: `next_mode`, `prev_mode`, `go_to_mode=<mode>`

**Clock & weather toggles**
- `twelve_hour` (toggle or set)
- `show_dayofweek` (toggle or set)
- `show_date` (toggle or set)
- `animated_seconds` (toggle or set)
- `show_humidity` (toggle or set)
- `weatherdesc` (toggle or set)
- Units: `metric`, `imperial` (and `units` toggle where applicable)

**Messages**
- Send message via `/action` with:
  - `message=<text>`
  - optional: `speed`, `scrolls`, `seconds`, `bignumbers`, `interrupt`
- Clear message by sending empty `message=""`
- Clear temporary override and restore persistent message: `clear_message`
- Handle “protected window” conflicts (`409 Conflict`) as a first-class UX state.

**Timers**
- Timer: `timer=<duration>`, `timer_pause`, `timer_resume`, `timer_restart`, `timer_stop` (and `timer_cancel` aliases)
- Stopwatch: `stopwatch_start`, `stopwatch_pause`, `stopwatch_resume`, `stopwatch_stop` (and `stopwatch_cancel` aliases)
- Pomodoro:
  - Start default: `pom` or `pomodoro_start`
  - Start custom: `pomodoro=<work-break-longbreak>` (e.g., `25-5-15`)
  - `pomodoro_pause`, `pomodoro_resume`, `pomodoro_restart`, `pomodoro_stop`

**System (runtime)**
- Save current settings: `save`
- Restart: `restart`

## 4. Out of Scope (v1)

Explicitly excluded from the Flutter app:

- Config editing UI (`GET /config.json`, `POST /save`, `POST /restore`)
- Config export/import (`GET /export`, `POST /upload`)
- Firmware update/version management (`GET /get_version`, `GET /perform_update`)
- Factory reset (`GET /factory_reset`)
- Wi‑Fi onboarding or captive portal flows (the device’s existing web UI remains the source of truth)

## 5. UX Requirements

- Every control action:
  - shows loading state
  - shows success/error feedback (HTTP status + response body)
- Connection issues:
  - clear “device unreachable” state
  - hints: try IP instead of `.local`, ensure same Wi‑Fi, check mDNS support
- Dangerous/runtime-impacting actions:
  - `restart` requires confirmation
  - message sending supports “interrupt=0” but warns users that it can lock out other messages until expiry/clear

## 6. Information Architecture (Screens)

1. **Devices**
   - Device list (base URLs), active device selector, “Test”
2. **Dashboard**
   - Status card (from `/status`) + quick controls (brightness, flip, rotation, display off)
3. **Message**
   - Message composer + advanced options + clear/restore controls
4. **Timers**
   - Timer, Stopwatch, Pomodoro tabs
5. **Controls**
   - Toggles (clock/weather) + `go_to_mode` picker
6. **About / Troubleshooting**
   - Show app version, show active device URL, link to local web UI (`/`)

## 7. API Encapsulation

### 7.1 Base URL handling

- The app stores a `Device { name?, baseUrl }`.
- Base URL normalization rules:
  - Always store with scheme (`http://...`)
  - Trim trailing `/`
  - All endpoints are `baseUrl + "/<path>"`

### 7.2 Calls

- `GET /status` for dashboard refresh (periodic refresh optional; manual refresh required).
- For most `/action` toggles: `GET /action?<param>` or `GET /action?<param>=<value>`
- For message sending (recommended): `POST /action` with `application/x-www-form-urlencoded`
- Treat non-`200` as error and display response text.

## 8. Technical Requirements (Flutter)

- State management: simple MVVM-ish (Service/Repository + ViewModels)
- Persistence: `shared_preferences` for device list + last active device
- Networking: `package:http` for Android + Web
- Web deployment assumption: local HTTP hosting on LAN (no mixed-content constraints)

## 9. Success Criteria

- User can add device `http://esptimecast.local`, press “Test”, see live status.
- User can reliably send/clear messages and control timers from Android and Web.
- App remains usable when `.local` fails by allowing IP-based device entries.

