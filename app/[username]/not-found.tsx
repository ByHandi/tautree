import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProfileNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-2xl">
        🌳
      </span>

      <div className="flex max-w-sm flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Halaman tidak ditemukan</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Username ini belum dipakai atau halamannya sudah tidak ada. Mau pakai untuk
          kamu sendiri?
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard" className={cn(buttonVariants())}>
          Buat halaman kamu
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Ke beranda
        </Link>
      </div>
    </main>
  );
}
