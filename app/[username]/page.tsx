import Link from "next/link";
import { notFound } from "next/navigation";

import type { Metadata } from "next";

import { Logo } from "@/components/logo";
import { SocialIcon } from "@/components/social-icon";
import Icon from "@/components/ui/icon";
import { db } from "@/lib/db";
import { getEmbed } from "@/lib/embed";
import { liveScheduleWhere } from "@/lib/links";
import { isProfilePublic } from "@/lib/profile";
import { getTheme } from "@/lib/themes";
import { normalizeUsername, validateUsername } from "@/lib/username";

type Params = { params: Promise<{ username: string }> };

async function getProfile(rawUsername: string) {
  const username = normalizeUsername(decodeURIComponent(rawUsername));
  if (!validateUsername(username).ok) return null;

  const user = await db.user.findUnique({
    where: { username },
    select: {
      name: true,
      username: true,
      bio: true,
      image: true,
      avatarUrl: true,
      theme: true,
      customTheme: true,
      suspended: true,
      links: {
        // Only links that are active AND inside their scheduling window. Mirrors
        // `isLinkLive`; suspended-owner gating is handled by `isProfilePublic`.
        where: { isActive: true, ...liveScheduleWhere(new Date()) },
        orderBy: { order: "asc" },
        select: { id: true, type: true, title: true, url: true, thumbnail: true },
        // (url is the source for embeds; getEmbed runs at render time below)
      },
    },
  });

  // A suspended account is invisible to the public — treat it as not found.
  if (user && !isProfilePublic(user)) return null;
  return user;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params;
  const user = await getProfile(username);
  if (!user) return { title: "Not found — Tautree" };

  const name = user.name ?? `@${user.username}`;
  const title = `${name} — Tautree`;
  const description = user.bio ?? `All of ${name}'s links on one page.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "profile" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicProfilePage({ params }: Params) {
  const { username } = await params;
  const user = await getProfile(username);
  if (!user) notFound();

  const displayName = user.name ?? `@${user.username}`;
  const initial = (user.name ?? user.username ?? "?").charAt(0).toUpperCase();
  const avatar = user.avatarUrl ?? user.image;
  const theme = getTheme(user.theme, user.customTheme);
  const links = user.links;

  function renderItem(link: (typeof links)[number]) {
    if (link.type === "HEADER") {
      return (
        <h2
          key={link.id}
          className="px-1 pt-4 text-center text-xs font-semibold uppercase tracking-widest first:pt-0"
          style={{ color: theme.muted }}
        >
          {link.title}
        </h2>
      );
    }

    const embed = link.type === "EMBED" ? getEmbed(link.url ?? "") : null;
    if (embed?.provider === "youtube") {
      return (
        <div
          key={link.id}
          className="aspect-video w-full overflow-hidden rounded-xl border shadow-xs"
          style={{ borderColor: theme.cardBorder }}
        >
          <iframe
            src={embed.src}
            title={link.title}
            className="size-full"
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      );
    }
    if (embed?.provider === "spotify") {
      return (
        <iframe
          key={link.id}
          src={embed.src}
          title={link.title}
          height={embed.height}
          className="w-full rounded-xl"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        />
      );
    }

    // LINK (and any embed that failed to resolve) → a clickable button.
    return (
      <a
        key={link.id}
        href={`/api/r/${link.id}`}
        className="group flex items-center gap-3 rounded-xl border px-5 py-4 font-medium shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
        style={{
          background: theme.card,
          color: theme.cardText,
          borderColor: theme.cardBorder,
        }}
      >
        {link.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={link.thumbnail}
            alt=""
            className="size-6 shrink-0 rounded-md object-cover"
          />
        ) : (
          <SocialIcon url={link.url ?? ""} className="size-5 shrink-0" />
        )}
        <span className="min-w-0 flex-1 truncate text-center">{link.title}</span>
        <Icon
          name="arrow-up-right"
          className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </a>
    );
  }

  return (
    <main
      className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center gap-6 px-5 py-16"
      style={{ background: theme.page, color: theme.text }}
    >
      <header className="flex flex-col items-center gap-3 text-center">
        <span
          className="flex size-24 items-center justify-center overflow-hidden rounded-full text-2xl font-semibold"
          style={{ background: theme.card, color: theme.cardText }}
        >
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={displayName} className="size-full object-cover" />
          ) : (
            initial
          )}
        </span>

        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">{displayName}</h1>
          {user.bio && (
            <p className="text-pretty text-sm" style={{ color: theme.muted }}>
              {user.bio}
            </p>
          )}
        </div>
      </header>

      {links.length > 0 ? (
        <nav className="flex w-full flex-col gap-3">{links.map(renderItem)}</nav>
      ) : (
        <p className="text-sm" style={{ color: theme.muted }}>
          No links yet.
        </p>
      )}

      <footer className="mt-auto pt-8">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-80"
          style={{ color: theme.muted }}
        >
          <Logo className="size-3.5" />
          Made with Tautree
        </Link>
      </footer>
    </main>
  );
}
