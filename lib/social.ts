/**
 * Detect the social platform behind a link URL so the public page can show a
 * recognizable brand icon. Pure (URL string -> platform id) and host-driven, so
 * it's trivially testable and decoupled from the icon assets.
 */

/** Registrable host -> platform id. Subdomains (e.g. open.spotify.com) match. */
const HOST_PLATFORM: Record<string, string> = {
  "github.com": "github",
  "x.com": "x",
  "twitter.com": "x",
  "instagram.com": "instagram",
  "youtube.com": "youtube",
  "youtu.be": "youtube",
  "tiktok.com": "tiktok",
  "facebook.com": "facebook",
  "fb.com": "facebook",
  "twitch.tv": "twitch",
  "discord.com": "discord",
  "discord.gg": "discord",
  "spotify.com": "spotify",
  "threads.net": "threads",
  "threads.com": "threads",
  "whatsapp.com": "whatsapp",
  "wa.me": "whatsapp",
  "t.me": "telegram",
  "telegram.me": "telegram",
  "telegram.org": "telegram",
  "soundcloud.com": "soundcloud",
  "dribbble.com": "dribbble",
  "behance.net": "behance",
  "medium.com": "medium",
  "substack.com": "substack",
};

/** Returns a platform id (e.g. "github") or null when unrecognized/invalid. */
export function detectPlatform(url: string): string | null {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
  host = host.replace(/^www\./, "");

  for (const known in HOST_PLATFORM) {
    if (host === known || host.endsWith(`.${known}`)) return HOST_PLATFORM[known];
  }
  return null;
}
