import test from "node:test";
import assert from "node:assert/strict";

import {
  buildActionUrl,
  buildDeviceEndpoint,
  buildLyricMessageBody
} from "../lib/device-api.js";

test("builds device endpoint URLs from normalized base URL", () => {
  assert.equal(buildDeviceEndpoint("esptimecast.local/", "status"), "http://esptimecast.local/status");
  assert.equal(buildActionUrl("http://192.168.1.20"), "http://192.168.1.20/action");
});

test("builds the form body used to send lyric lines", () => {
  assert.equal(
    buildLyricMessageBody("Hello world").toString(),
    "message=HELLO+WORLD&seconds=4&scrolls=0&interrupt=1"
  );
});

test("sanitizes lyric lines before they are sent to ESPTimeCast", () => {
  assert.equal(
    buildLyricMessageBody("दिल है छोटा सा").toString(),
    "message=DIL+HAI+CHHOTA+SA&seconds=4&scrolls=0&interrupt=1"
  );
});
