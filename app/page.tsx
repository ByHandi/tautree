import Link from "next/link";

import { ArrowRightIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <div className="flex max-w-xl flex-col items-center gap-6">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-2xl text-primary-foreground">
          🌳
        </span>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Satu link untuk semua isi kamu
        </h1>

        <p className="text-balance text-muted-foreground">
          Tautree bantu kamu kumpulin semua link — sosmed, karya, toko — dalam satu
          halaman yang gampang dibagikan di mana aja.
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
            Mulai gratis
            <ArrowRightIcon />
          </Link>
          <Link href="/login" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
            Masuk
          </Link>
        </div>
      </div>
    </main>
  );
}
