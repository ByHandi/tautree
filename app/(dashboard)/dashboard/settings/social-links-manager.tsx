"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { type SocialFormState, addSocial, removeSocial } from "./actions";

import { SocialIcon } from "@/components/social-icon";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import InputText from "@/components/ui/input-text";
import { Spinner } from "@/components/ui/spinner";
import { SOCIAL_MAX } from "@/lib/social";

export type SocialItem = { id: string; url: string };

export function SocialLinksManager({ socials }: { socials: SocialItem[] }) {
  const [items, setItems] = useState(socials);
  useEffect(() => setItems(socials), [socials]);

  const [state, formAction, isAdding] = useActionState<SocialFormState, FormData>(
    addSocial,
    undefined,
  );
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      toast.success("Social link added.");
    }
  }, [state]);

  function handleRemove(id: string) {
    setItems((prev) => prev.filter((s) => s.id !== id)); // optimistic
    startTransition(async () => {
      await removeSocial(id);
    });
  }

  const atMax = items.length >= SOCIAL_MAX;

  return (
    <div className="flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Social icons</p>
        <p className="text-xs text-muted-foreground">
          Small icons shown in your profile header, separate from your link buttons.
        </p>
      </div>

      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((s) => (
            <li key={s.id} className="flex items-center gap-3 rounded-lg border bg-card p-2.5">
              <SocialIcon url={s.url} className="size-5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm">{s.url}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleRemove(s.id)}
                disabled={isPending}
                aria-label="Remove social link"
              >
                <Icon name="x" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {atMax ? (
        <p className="text-xs text-muted-foreground">Maximum of {SOCIAL_MAX} reached.</p>
      ) : (
        <form ref={formRef} action={formAction} className="flex items-start gap-2">
          <div className="flex-1">
            <InputText
              name="url"
              placeholder="https://instagram.com/username"
              required
              inputMode="url"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Social link URL"
            />
          </div>
          <Button type="submit" variant="outline" disabled={isAdding}>
            {isAdding ? <Spinner /> : <Icon name="plus" />}
            Add
          </Button>
        </form>
      )}

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
    </div>
  );
}
