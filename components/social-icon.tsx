import {
  siBehance,
  siDiscord,
  siDribbble,
  siFacebook,
  siGithub,
  siInstagram,
  siMedium,
  siSoundcloud,
  siSpotify,
  siSubstack,
  siTelegram,
  siThreads,
  siTiktok,
  siTwitch,
  siWhatsapp,
  siX,
  siYoutube,
} from "simple-icons";

import Icon from "@/components/ui/icon";
import { detectPlatform } from "@/lib/social";
import { cn } from "@/lib/utils";

type Brand = { title: string; path: string };

/** platform id (from detectPlatform) -> brand glyph. */
const ICONS: Record<string, Brand> = {
  github: siGithub,
  x: siX,
  instagram: siInstagram,
  youtube: siYoutube,
  tiktok: siTiktok,
  facebook: siFacebook,
  twitch: siTwitch,
  discord: siDiscord,
  spotify: siSpotify,
  threads: siThreads,
  whatsapp: siWhatsapp,
  telegram: siTelegram,
  soundcloud: siSoundcloud,
  dribbble: siDribbble,
  behance: siBehance,
  medium: siMedium,
  substack: siSubstack,
};

/**
 * Brand icon for a link's destination. Renders a simple-icons glyph in the
 * current text color, falling back to a generic globe for unrecognized hosts.
 * Server component — emits inline SVG with no client JS.
 */
export function SocialIcon({ url, className }: { url: string; className?: string }) {
  const platform = detectPlatform(url);
  const brand = platform ? ICONS[platform] : null;

  if (!brand) {
    return <Icon name="globe" className={className} aria-hidden />;
  }

  return (
    <svg
      role="img"
      aria-label={brand.title}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn(className)}
    >
      <path d={brand.path} />
    </svg>
  );
}
