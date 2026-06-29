import Link from "next/link";

import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  ChartNoAxesColumnIcon,
  GripVerticalIcon,
  PaletteIcon,
  UserRoundIcon,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { APP_DOMAIN } from "@/lib/site";
import { THEMES } from "@/lib/themes";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: GripVerticalIcon,
    title: "Kelola link dengan mudah",
    desc: "Tambah, edit, aktif/nonaktifkan, dan susun ulang link cukup dengan drag-and-drop.",
  },
  {
    icon: PaletteIcon,
    title: "Tema sesuai gaya kamu",
    desc: "Enam tema siap pakai — dari terang minimalis sampai gradient sunset & ocean.",
  },
  {
    icon: ChartNoAxesColumnIcon,
    title: "Analytics bawaan",
    desc: "Pantau total klik, tren 30 hari, dan link mana yang paling banyak diklik.",
  },
  {
    icon: UserRoundIcon,
    title: "Profil yang kamu banget",
    desc: "Atur nama, bio, dan foto. Halaman publikmu langsung tampil rapi dan personal.",
  },
];

const steps = [
  { n: "1", title: "Klaim username", desc: `Daftar gratis dan ambil ${APP_DOMAIN}/kamu.` },
  { n: "2", title: "Tambahkan link", desc: "Masukkan semua link penting kamu ke dashboard." },
  { n: "3", title: "Bagikan", desc: "Sebar satu link itu ke bio sosmed mana pun." },
];

function HeroPreview() {
  const theme = THEMES.sunset;
  const items = ["Instagram", "YouTube", "Toko Online"];

  return (
    <div
      className="flex w-full max-w-[280px] flex-col items-center gap-4 rounded-3xl border p-6 shadow-2xl"
      style={{ background: theme.page, color: theme.text }}
      aria-hidden
    >
      <span
        className="flex size-16 items-center justify-center rounded-full text-xl font-semibold"
        style={{ background: theme.card, color: theme.cardText }}
      >
        T
      </span>
      <div className="flex flex-col items-center gap-0.5 text-center">
        <span className="text-sm font-semibold">@kamu</span>
        <span className="text-xs" style={{ color: theme.muted }}>
          Semua link aku ada di sini ✨
        </span>
      </div>
      <div className="flex w-full flex-col gap-2">
        {items.map((label) => (
          <span
            key={label}
            className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium"
            style={{ background: theme.card, color: theme.cardText, borderColor: theme.cardBorder }}
          >
            <span className="flex-1 text-center">{label}</span>
            <ArrowUpRightIcon className="size-3.5" />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
          <span className="flex items-center gap-2 font-semibold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Logo className="size-4" />
            </span>
            Tautree
          </span>
          <div className="flex items-center gap-1.5">
            <ThemeToggle className="size-9" />
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Masuk
            </Link>
            <Link href="/dashboard" className={cn(buttonVariants({ size: "sm" }))}>
              Mulai gratis
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-5xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col items-start gap-6 text-left">
            <span className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Logo className="size-3.5 text-primary" />
              Satu link untuk semua isi kamu
            </span>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Semua link kamu, dalam satu halaman
            </h1>
            <p className="text-pretty text-muted-foreground">
              Tautree bantu kamu kumpulin sosmed, karya, dan toko jadi satu halaman cantik yang
              gampang dibagikan — lengkap dengan tema dan analytics.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
                Buat halaman kamu
                <ArrowRightIcon />
              </Link>
              <Link href="/login" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
                Masuk
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <HeroPreview />
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30">
          <div className="mx-auto w-full max-w-5xl px-6 py-16 md:py-20">
            <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
              <h2 className="text-3xl font-semibold tracking-tight">Semua yang kamu butuhin</h2>
              <p className="text-pretty text-muted-foreground">
                Dibuat ringkas tapi lengkap — biar kamu fokus berbagi, bukan ngurusin teknis.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="flex flex-col gap-3 rounded-xl border bg-card p-5">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="size-5" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-medium">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16 md:py-20">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Mulai dalam 3 langkah</h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="flex flex-col items-center gap-3 text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {s.n}
                </span>
                <h3 className="font-medium">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-6 py-16 text-center md:py-20">
            <h2 className="text-balance text-3xl font-semibold tracking-tight">
              Siap punya halaman link kamu sendiri?
            </h2>
            <p className="text-pretty text-muted-foreground">Gratis, cepat, dan tanpa ribet.</p>
            <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
              Mulai sekarang
              <ArrowRightIcon />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <span className="flex items-center gap-2">
            <Logo className="size-4 text-primary" />
            Tautree
          </span>
          <span>Dibuat dengan Next.js</span>
        </div>
      </footer>
    </div>
  );
}
