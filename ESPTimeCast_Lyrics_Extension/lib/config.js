export const DEFAULT_DEVICE_URL = "http://esptimecast.local";

export function normalizeDeviceUrl(input) {
  const raw = String(input || "").trim();
  if (!raw) return DEFAULT_DEVICE_URL;

  const withScheme = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
  return withScheme.replace(/\/+$/, "");
}
