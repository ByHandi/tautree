import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Icon from "@/components/ui/icon";
import { db } from "@/lib/db";
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
    twitter: { card: "summary", title, description },
  };
}

export default async function PublicProfilePage({ params }: Params) {
  const { username } = await params;
  const user = await getProfile(username);
  if (!user) notFound();

  const displayName = user.name ?? `@${user.username}`;
  const initial = (user.name ?? user.username ?? "?").charAt(0).toUpperCase();
  const avatar = user.avatarUrl ?? user.image;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center gap-6 px-5 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-24 items-center justify-center overflow-hidden rounded-full bg-muted text-2xl font-semibold">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={displayName} className="size-full object-cover" />
          ) : (
            initial
          )}
        </span>

        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">{displayName}</h1>
          {user.bio && <p className="text-pretty text-sm text-muted-foreground">{user.bio}</p>}
        </div>
      </header>

      {user.links.length > 0 ? (
        <nav className="flex w-full flex-col gap-3">
          {user.links.map((link) => (
            <a
              key={link.id}
              href={`/api/r/${link.id}`}
              className="group flex items-center gap-3 rounded-xl border bg-card px-5 py-4 font-medium shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="min-w-0 flex-1 truncate text-center">{link.title}</span>
              <Icon
                name="arrow-up-right"
                className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          ))}
        </nav>
      ) : (
        <p className="text-sm text-muted-foreground">Belum ada link.</p>
      )}

      <footer className="mt-auto pt-8">
        <Link
          href="/"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          🌳 Dibuat dengan Tautree
        </Link>
      </footer>
    </main>
  );
}
