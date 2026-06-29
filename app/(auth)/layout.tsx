import Link from "next/link";

import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Logo className="size-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Tautree</span>
        </Link>
        {children}
      </div>
    </main>
  );
}
