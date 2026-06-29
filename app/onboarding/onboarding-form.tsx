"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { CheckIcon, XIcon } from "lucide-react";

import { claimUsername } from "./actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { APP_DOMAIN } from "@/lib/site";
import { USERNAME_MAX, normalizeUsername, validateUsername } from "@/lib/username";
import { cn } from "@/lib/utils";

type Availability =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "taken"; reason: string };

export function OnboardingForm({ suggestion }: { suggestion: string }) {
  const [username, setUsername] = useState(suggestion);
  const [check, setCheck] = useState<Availability>({ status: "idle" });
  const [state, formAction, isPending] = useActionState(claimUsername, undefined);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const value = normalizeUsername(username);
    const valid = validateUsername(value);

    if (!valid.ok) {
      setCheck(value.length === 0 ? { status: "idle" } : { status: "taken", reason: valid.reason });
      return;
    }

    setCheck({ status: "checking" });
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/username/check?u=${encodeURIComponent(value)}`, {
          signal: controller.signal,
        });
        const data: { available: boolean; reason?: string } = await res.json();
        setCheck(
          data.available
            ? { status: "available" }
            : { status: "taken", reason: data.reason ?? "Tidak tersedia." },
        );
      } catch (err) {
        if ((err as Error).name !== "AbortError") setCheck({ status: "idle" });
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [username]);

  const canSubmit = check.status === "available" && !isPending;

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex items-center rounded-md border border-input bg-transparent pl-2.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
        <span className="text-sm text-muted-foreground select-none">{APP_DOMAIN}/</span>
        <Input
          name="username"
          value={username}
          onChange={(e) => setUsername(normalizeUsername(e.target.value))}
          maxLength={USERNAME_MAX}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="username"
          aria-invalid={check.status === "taken"}
          className="border-0 px-1 shadow-none focus-visible:border-0 focus-visible:ring-0"
        />
        <span className="px-2.5">
          {check.status === "checking" && <Spinner className="size-4 text-muted-foreground" />}
          {check.status === "available" && <CheckIcon className="size-4 text-emerald-600" />}
          {check.status === "taken" && <XIcon className="size-4 text-destructive" />}
        </span>
      </div>

      <p
        className={cn(
          "min-h-5 text-sm",
          check.status === "available" && "text-emerald-600",
          check.status === "taken" && "text-destructive",
          (check.status === "idle" || check.status === "checking") && "text-muted-foreground",
        )}
      >
        {check.status === "available" && "Username tersedia 🎉"}
        {check.status === "taken" && check.reason}
        {check.status === "checking" && "Mengecek ketersediaan…"}
      </p>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" className="w-full" disabled={!canSubmit}>
        {isPending && <Spinner />}
        Lanjut
      </Button>
    </form>
  );
}
