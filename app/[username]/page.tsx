import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Logo } from "@/components/logo";
import Icon from "@/components/ui/icon";
import { db } from "@/lib/db";
import { getTheme } from "@/lib/themes";
import { normalizeUsername, validateUsername } from "@/lib/username";

type Params = { params: Promise<{ username: string }> };

async function getProfile(rawUsername: string) {
  const username = normalizeUsername(decodeURIComponent(rawUsername));
  if (!validateUsername(username).ok) return null;

  return db.user.findUnique({
    where: { username },
    select: {
      name: true,
      username: true,
      bio: true,
      image: true,
      avatarUrl: true,
      theme: true,
      links: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: { id: true, title: true },
      },
    },
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params;
  const user = await getProfile(username);
  if (!user) return { title: "Tidak ditemukan — Tautree" };

  const name = user.name ?? `@${user.username}`;
  const title = `${name} — Tautree`;
  const description = user.bio ?? `Semua link ${name} dalam satu halaman.`;

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
  const theme = getTheme(user.theme);

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

      {user.links.length > 0 ? (
        <nav className="flex w-full flex-col gap-3">
          {user.links.map((link) => (
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
              <span className="min-w-0 flex-1 truncate text-center">{link.title}</span>
              <Icon
                name="arrow-up-right"
                className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          ))}
        </nav>
      ) : (
        <p className="text-sm" style={{ color: theme.muted }}>
          Belum ada link.
        </p>
      )}

      <footer className="mt-auto pt-8">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-80"
          style={{ color: theme.muted }}
        >
          <Logo className="size-3.5" />
          Dibuat dengan Tautree
        </Link>
      </footer>
    </main>
  );
}
