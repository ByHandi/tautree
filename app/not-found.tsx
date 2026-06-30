import Link from "next/link";

import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Logo className="size-7" />
      </span>

      <div className="flex max-w-sm flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-balance text-sm text-muted-foreground">
          The page you’re looking for doesn’t exist or has moved.
        </p>
      </div>

      <Link href="/" className={cn(buttonVariants())}>
        Back home
      </Link>
    </main>
  );
}
