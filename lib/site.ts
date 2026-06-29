/**
 * Canonical app URL, sourced from `NEXT_PUBLIC_APP_URL` (public so client
 * components can use it). Falls back to localhost for dev.
 */
const RAW = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** Full origin without a trailing slash — e.g. `https://tautree.com`. */
export const APP_URL = RAW.replace(/\/+$/, "");

/** Host only, for display — e.g. `tautree.com`. */
export const APP_DOMAIN = APP_URL.replace(/^https?:\/\//, "");
