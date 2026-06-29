import type { Metadata } from "next";
import Link from "next/link";

import { MailCheckIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Check your email — Tautree",
};

export default function CheckEmailPage() {
  return (
    <div className="flex w-full flex-col items-center gap-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MailCheckIcon className="size-6" />
      </span>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We’ve sent you a sign-in link. Open your email and click the link to
          continue.
        </p>
      </div>
      <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
        Back to sign in
      </Link>
    </div>
  );
}
