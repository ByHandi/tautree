import Link from "next/link";

import { IconName } from "lucide-react/dynamic";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { APP_DOMAIN } from "@/lib/site";
import { THEMES } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface FeaturesItem {
  icon: IconName;
  title: string;
  desc: string;
}

const features: FeaturesItem[] = [
  {
    icon: "grip-vertical",
    title: "Links, your way",
    desc: "Reorder with drag-and-drop, group with headers, schedule links to go live or expire, and pin a featured one to the top.",
  },
  {
    icon: "play",
    title: "Embed media inline",
    desc: "Drop in a YouTube video or Spotify track and it plays right on your page — no extra click.",
  },
  {
    icon: "palette",
    title: "Make it truly yours",
    desc: "Six themes plus your own custom color, four fonts, and button shapes & fills to match your style.",
  },
  {
    icon: "chart-no-axes-column",
    title: "Know what works",
    desc: "Total clicks and 30-day trends, plus top sources, device breakdown, custom date ranges, and CSV export.",
  },
  {
    icon: "qr-code",
    title: "Share in a tap",
    desc: "A built-in QR code and one-tap share button get your page in front of people, online or in person.",
  },
  {
    icon: "sparkles",
    title: "Polished by default",
    desc: "Auto-detected icons for 17 platforms, a social icon row in your header, and custom thumbnails per link.",
  },
];

const steps = [
  { n: "1", title: "Claim your username", desc: `Sign up for free and grab ${APP_DOMAIN}/you.` },
  { n: "2", title: "Add your links", desc: "Drop all your important links into the dashboard." },
  { n: "3", title: "Share", desc: "Put that one link in any social bio." },
];

function HeroPreview() {
  const theme = THEMES.sunset;
  const links = ["Instagram", "Online Store"];

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
        <span className="text-sm font-semibold">@you</span>
        <span className="text-xs" style={{ color: theme.muted }}>
          All my links live here ✨
        </span>
      </div>

      {/* social icon row */}
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="size-7 rounded-full border"
            style={{ background: theme.card, borderColor: theme.cardBorder }}
          />
        ))}
      </div>

      <div className="flex w-full flex-col gap-2">
        {/* featured / pinned link */}
        <span
          className="flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold"
          style={{ background: theme.card, color: theme.cardText, borderColor: theme.cardBorder }}
        >
          <Icon name="star" className="size-3.5 shrink-0" fill="currentColor" />
          <span className="flex-1 text-center">Latest drop</span>
          <Icon name="arrow-up-right" className="size-3.5 shrink-0" />
        </span>

        {/* embedded media */}
        <span
          className="flex aspect-video items-center justify-center rounded-xl border"
          style={{ background: theme.card, borderColor: theme.cardBorder }}
        >
          <Icon
            name="play"
            className="size-6"
            style={{ color: theme.cardText }}
            fill="currentColor"
          />
        </span>

        {/* regular links */}
        {links.map((label) => (
          <span
            key={label}
            className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium"
            style={{ background: theme.card, color: theme.cardText, borderColor: theme.cardBorder }}
          >
            <span className="flex-1 text-center">{label}</span>
            <Icon name="arrow-up-right" className="size-3.5 shrink-0" />
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
              Sign in
            </Link>
            <Link href="/dashboard" className={cn(buttonVariants({ size: "sm" }))}>
              Get started
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
              One link for everything you make
            </span>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              All your links, on one page
            </h1>
            <p className="text-pretty text-muted-foreground">
              Tautree brings your socials, work, and store together into one page that’s truly yours
              — embed media, make it your style, see what’s working, and share it with a tap.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
                Create your page
                <Icon name="arrow-right" />
              </Link>
              <Link
                href="/login"
                className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
              >
                Sign in
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
              <h2 className="text-3xl font-semibold tracking-tight">Everything you need</h2>
              <p className="text-pretty text-muted-foreground">
                From media embeds to analytics and styling — everything to build a page worth
                sharing, without fiddling with the tech.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="flex flex-col gap-3 rounded-xl border bg-card p-5">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon name={f.icon} className="size-5" />
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
            <h2 className="text-3xl font-semibold tracking-tight">Get started in 3 steps</h2>
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
              Ready to own your own link page?
            </h2>
            <p className="text-pretty text-muted-foreground">Free, fast, and hassle-free.</p>
            <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
              Get started
              <Icon name="arrow-right" />
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
          <span>Made with Next.js</span>
        </div>
      </footer>
    </div>
  );
}
