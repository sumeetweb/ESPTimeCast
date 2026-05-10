import test from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_DEVICE_URL, normalizeDeviceUrl } from "../lib/config.js";

test("defaults to the ESPTimeCast mDNS URL when input is empty", () => {
  assert.equal(normalizeDeviceUrl(""), DEFAULT_DEVICE_URL);
  assert.equal(normalizeDeviceUrl("   "), DEFAULT_DEVICE_URL);
});

test("adds http scheme and removes trailing slashes", () => {
  assert.equal(normalizeDeviceUrl("esptimecast.local/"), "http://esptimecast.local");
  assert.equal(normalizeDeviceUrl("192.168.1.50///"), "http://192.168.1.50");
});

test("preserves explicit http and https schemes", () => {
  assert.equal(normalizeDeviceUrl("http://clock.local/"), "http://clock.local");
  assert.equal(normalizeDeviceUrl("https://clock.example/"), "https://clock.example");
});
