"use client";

import { CheckIcon, PaletteIcon } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { type ThemeFormState, updateTheme } from "./actions";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  BUTTON_FILLS,
  BUTTON_SHAPES,
  type ButtonFill,
  type ButtonShape,
  linkButtonAppearance,
} from "@/lib/button-style";
import {
  CUSTOM_PALETTE_FIELDS,
  CUSTOM_THEME_ID,
  type CustomPalette,
  THEME_LIST,
  type Theme,
  type ThemeId,
  customTheme,
} from "@/lib/themes";
import { cn } from "@/lib/utils";

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      className="grid gap-1 rounded-lg bg-muted p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      role="group"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === opt.value
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

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
  buttonShape,
  buttonFill,
}: {
  current: ThemeId;
  customPalette: CustomPalette;
  buttonShape: ButtonShape;
  buttonFill: ButtonFill;
}) {
  const [selected, setSelected] = useState<ThemeId>(current);
  const [palette, setPalette] = useState<CustomPalette>(customPalette);
  const [shape, setShape] = useState<ButtonShape>(buttonShape);
  const [fill, setFill] = useState<ButtonFill>(buttonFill);
  const [state, formAction, isPending] = useActionState<ThemeFormState, FormData>(
    updateTheme,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) toast.success("Appearance saved.");
  }, [state]);

  const paletteChanged = CUSTOM_PALETTE_FIELDS.some(
    ({ key }) => palette[key] !== customPalette[key],
  );
  const isCustom = selected === CUSTOM_THEME_ID;
  const styleChanged = shape !== buttonShape || fill !== buttonFill;
  // Nothing to save when the selection matches what's stored — for the custom
  // theme that also requires the palette to be untouched.
  const unchanged = selected === current && !styleChanged && (!isCustom || !paletteChanged);

  const preview = customTheme(palette);

  // Theme the live button preview reflects: the custom palette, or the picked preset.
  const previewTheme: Theme = isCustom
    ? preview
    : (THEME_LIST.find((t) => t.id === selected) ?? THEME_LIST[0]);
  const btn = linkButtonAppearance(previewTheme, shape, fill);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="theme" value={selected} />
      <input type="hidden" name="buttonShape" value={shape} />
      <input type="hidden" name="buttonFill" value={fill} />

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
                  onChange={(e) => setPalette((p) => ({ ...p, [key]: e.target.value }))}
                  className="size-8 cursor-pointer rounded-md border bg-transparent p-0.5"
                  aria-label={label}
                />
              </span>
            </label>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-xl border p-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">Buttons</p>
          <p className="text-xs text-muted-foreground">Shape and fill of your link buttons.</p>
        </div>

        {/* Live preview on the selected theme's background. */}
        <div
          className="flex flex-col gap-3 rounded-lg p-4"
          style={{ background: previewTheme.page }}
        >
          {[0, 1].map((i) => (
            <span
              key={i}
              className={cn(
                "flex items-center justify-center px-5 py-3 text-sm font-medium transition-all",
                btn.shadow && "shadow-xs",
              )}
              style={{
                background: btn.background,
                color: btn.color,
                borderColor: btn.borderColor,
                borderWidth: btn.borderWidth,
                borderStyle: "solid",
                borderRadius: btn.borderRadius,
              }}
            >
              {i === 0 ? "My link" : "Another link"}
            </span>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Shape</span>
            <Segmented options={BUTTON_SHAPES} value={shape} onChange={setShape} />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Fill</span>
            <Segmented options={BUTTON_FILLS} value={fill} onChange={setFill} />
          </div>
        </div>
      </div>

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
