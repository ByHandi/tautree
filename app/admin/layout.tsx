import Link from "next/link";

import { Logo } from "@/components/logo";
import Icon from "@/components/ui/icon";
import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // DB-truthful gate — the edge middleware only checks that the user is logged
  // in; role authority is verified here (and again in every admin action).
  await requireAdmin();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Link href="/admin" className="flex items-center gap-2 font-medium">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Logo className="size-4" />
          </span>
          Admin
        </Link>

        <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
          Moderation
        </span>

        <Link
          href="/dashboard"
          className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon name="arrow-left" className="size-4" />
          Back to dashboard
        </Link>
      </header>
      {children}
    </div>
  );
}
