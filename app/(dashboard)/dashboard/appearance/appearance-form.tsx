"use client";

import { useActionState, useEffect, useState } from "react";

import { CheckIcon } from "lucide-react";
import { toast } from "sonner";

import { updateTheme, type ThemeFormState } from "./actions";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { THEME_LIST, type ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";

export function AppearanceForm({ current }: { current: ThemeId }) {
  const [selected, setSelected] = useState<ThemeId>(current);
  const [state, formAction, isPending] = useActionState<ThemeFormState, FormData>(
    updateTheme,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) toast.success("Tema disimpan.");
  }, [state]);

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

              <span className="flex items-center justify-between px-1 text-sm font-medium">
                {theme.label}
                {isSelected && <CheckIcon className="size-4 text-primary" />}
              </span>
            </button>
          );
        })}
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || selected === current}>
          {isPending && <Spinner />}
          Simpan
        </Button>
      </div>
    </form>
  );
}
