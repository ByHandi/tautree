import { Geist_Mono, Inter } from "next/font/google";

import type { Metadata } from "next";

import "./globals.css";

import Providers from "@/components/providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "Tautree — One link for everything",
  description: "Create one page for all your links. Share it anywhere.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <Providers>
          <TooltipProvider>{children}</TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
