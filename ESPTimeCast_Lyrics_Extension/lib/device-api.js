import { normalizeDeviceUrl } from "./config.js";
import { toDisplayText } from "./display-text.js";

export function buildDeviceEndpoint(baseUrl, path) {
  const cleanPath = String(path || "").replace(/^\/+/, "");
  return `${normalizeDeviceUrl(baseUrl)}/${cleanPath}`;
}

export function buildActionUrl(baseUrl) {
  return buildDeviceEndpoint(baseUrl, "action");
}

export function buildLyricMessageBody(line) {
  const body = new URLSearchParams();
  body.set("message", toDisplayText(line));
  body.set("seconds", "4");
  body.set("scrolls", "0");
  body.set("interrupt", "1");
  return body;
}

export async function testDeviceConnection(baseUrl, fetchImpl = fetch) {
  const response = await fetchImpl(buildDeviceEndpoint(baseUrl, "status"), {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Device returned ${response.status}`);
  }

  return response.json();
}

export async function sendLyricLine(baseUrl, line, fetchImpl = fetch) {
  const response = await fetchImpl(buildActionUrl(baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: buildLyricMessageBody(line)
  });

  if (!response.ok) {
    throw new Error(`Device returned ${response.status}`);
  }

  return response.text();
}

export async function clearDeviceMessage(baseUrl, fetchImpl = fetch) {
  const response = await fetchImpl(`${buildActionUrl(baseUrl)}?clear_message`, {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Device returned ${response.status}`);
  }

  return response.text();
}
