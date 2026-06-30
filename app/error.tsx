"use client";

import { useEffect } from "react";

import Link from "next/link";

import { Logo } from "@/components/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to server logs / monitoring. `digest` correlates with the
    // server-side stack trace in production builds.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Logo className="size-7" />
      </span>

      <div className="flex max-w-sm flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-balance text-sm text-muted-foreground">
          An unexpected error occurred. Try again, or head back home.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Back home
        </Link>
      </div>
    </main>
  );
}
