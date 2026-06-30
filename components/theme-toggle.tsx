"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";

/** Shared toggle logic with an SSR-safe mounted guard. */
function useThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";
  const toggle = () => setTheme(isDark ? "light" : "dark");
  // Mirror the icon's `mounted` guard: before mount the theme is unknown, so
  // assume light (Sun + "Dark mode") on both server and first client render to
  // avoid a hydration mismatch on the label text.
  const label = mounted && isDark ? "Light mode" : "Dark mode";

  return { mounted, isDark, toggle, label };
}

/** Standalone icon button — used in the landing header. */
export function ThemeToggle({ className }: { className?: string }) {
  const { mounted, isDark, toggle, label } = useThemeToggle();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={className}
    >
      {/* Render a stable icon before mount to avoid a hydration mismatch. */}
      {mounted && isDark ? <MoonIcon /> : <SunIcon />}
    </Button>
  );
}

/** Sidebar menu variant — used in the dashboard sidebar footer. */
export function SidebarThemeToggle() {
  const { mounted, isDark, toggle, label } = useThemeToggle();

  return (
    <SidebarMenuButton type="button" onClick={toggle} tooltip={label}>
      {mounted && isDark ? <MoonIcon /> : <SunIcon />}
      <span>{label}</span>
    </SidebarMenuButton>
  );
}
