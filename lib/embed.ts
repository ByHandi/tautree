/**
 * Turn a public YouTube/Spotify URL into a safe iframe embed descriptor. Pure
 * (URL string -> embed | null) and host-driven, so it's trivially testable.
 *
 * IDs are extracted and re-validated against a strict charset before being
 * interpolated into the embed `src` — nothing from the raw URL reaches the
 * iframe except a known-good id, which keeps arbitrary content out of the
 * embed origin.
 */

export type Embed =
  | { provider: "youtube"; src: string }
  | { provider: "spotify"; src: string; height: number };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{6,20}$/;
const SPOTIFY_TYPES = new Set(["track", "album", "playlist", "episode", "show", "artist"]);
const SPOTIFY_ID = /^[A-Za-z0-9]{8,40}$/;

export function getEmbed(rawUrl: string): Embed | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  // --- YouTube ---
  if (host === "youtu.be") {
    return youtubeEmbed(parts[0]);
  }
  if (host === "youtube.com" || host.endsWith(".youtube.com")) {
    if (parts[0] === "watch") return youtubeEmbed(url.searchParams.get("v"));
    if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") {
      return youtubeEmbed(parts[1]);
    }
    return null;
  }

  // --- Spotify --- (skips an optional locale segment like "intl-id")
  if (host === "spotify.com" || host.endsWith(".spotify.com")) {
    const idx = parts.findIndex((p) => SPOTIFY_TYPES.has(p));
    if (idx === -1) return null;
    const type = parts[idx];
    const id = parts[idx + 1];
    if (!id || !SPOTIFY_ID.test(id)) return null;
    // Compact players for single items, taller players for collections.
    const height = type === "track" ? 152 : type === "episode" ? 232 : 352;
    return { provider: "spotify", src: `https://open.spotify.com/embed/${type}/${id}`, height };
  }

  return null;
}

function youtubeEmbed(id: string | null | undefined): Embed | null {
  if (!id || !YOUTUBE_ID.test(id)) return null;
  return { provider: "youtube", src: `https://www.youtube.com/embed/${id}` };
}

/** True when the URL can be rendered as an inline embed. */
export function canEmbed(url: string): boolean {
  return getEmbed(url) !== null;
}
