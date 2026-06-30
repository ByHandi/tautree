"use client";

import { useActionState, useEffect, useState } from "react";

import { CheckIcon, PaletteIcon } from "lucide-react";
import { toast } from "sonner";

import { updateTheme, type ThemeFormState } from "./actions";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  CUSTOM_PALETTE_FIELDS,
  CUSTOM_THEME_ID,
  customTheme,
  THEME_LIST,
  type CustomPalette,
  type ThemeId,
} from "@/lib/themes";
import { cn } from "@/lib/utils";

function ThemeSwatch({ theme }: { theme: { page: string; card: string; cardBorder: string } }) {
  return (
    <span
      className="flex h-28 flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border px-3"
      style={{ background: theme.page }}
    >
      <span
        className="size-6 rounded-full"
        style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}
      />
      <span
        className="h-4 w-full rounded-md border"
        style={{ background: theme.card, borderColor: theme.cardBorder }}
      />
      <span
        className="h-4 w-full rounded-md border"
        style={{ background: theme.card, borderColor: theme.cardBorder }}
      />
    </span>
  );
}

export function AppearanceForm({
  current,
  customPalette,
}: {
  current: ThemeId;
  customPalette: CustomPalette;
}) {
  const [selected, setSelected] = useState<ThemeId>(current);
  const [palette, setPalette] = useState<CustomPalette>(customPalette);
  const [state, formAction, isPending] = useActionState<ThemeFormState, FormData>(
    updateTheme,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) toast.success("Theme saved.");
  }, [state]);

  const paletteChanged = CUSTOM_PALETTE_FIELDS.some(
    ({ key }) => palette[key] !== customPalette[key],
  );
  const isCustom = selected === CUSTOM_THEME_ID;
  // Nothing to save when the selection matches what's stored — for the custom
  // theme that also requires the palette to be untouched.
  const unchanged = selected === current && (!isCustom || !paletteChanged);

  const preview = customTheme(palette);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="theme" value={selected} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {THEME_LIST.map((theme) => {
          const isSelected = selected === theme.id;
          return (
            <button
              type="button"
              key={theme.id}
              onClick={() => setSelected(theme.id)}
              aria-pressed={isSelected}
              className={cn(
                "group relative flex flex-col gap-2 rounded-xl border-2 p-2 text-left transition-colors",
                isSelected ? "border-primary" : "border-transparent hover:border-border",
              )}
            >
              <ThemeSwatch theme={theme} />
              <span className="flex items-center justify-between px-1 text-sm font-medium">
                {theme.label}
                {isSelected && <CheckIcon className="size-4 text-primary" />}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setSelected(CUSTOM_THEME_ID)}
          aria-pressed={isCustom}
          className={cn(
            "group relative flex flex-col gap-2 rounded-xl border-2 p-2 text-left transition-colors",
            isCustom ? "border-primary" : "border-transparent hover:border-border",
          )}
        >
          <ThemeSwatch theme={preview} />
          <span className="flex items-center justify-between px-1 text-sm font-medium">
            <span className="flex items-center gap-1.5">
              <PaletteIcon className="size-3.5" />
              Custom
            </span>
            {isCustom && <CheckIcon className="size-4 text-primary" />}
          </span>
        </button>
      </div>

      {isCustom && (
        <div className="grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2">
          {CUSTOM_PALETTE_FIELDS.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center justify-between gap-3 text-sm font-medium"
            >
              {label}
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground uppercase">
                  {palette[key]}
                </span>
                <input
                  type="color"
                  name={key}
                  value={palette[key]}
                  onChange={(e) =>
                    setPalette((p) => ({ ...p, [key]: e.target.value }))
                  }
                  className="size-8 cursor-pointer rounded-md border bg-transparent p-0.5"
                  aria-label={label}
                />
              </span>
            </label>
          ))}
        </div>
      )}

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || unchanged}>
          {isPending && <Spinner />}
          Save
        </Button>
      </div>
    </form>
  );
}
