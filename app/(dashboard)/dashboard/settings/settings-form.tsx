"use client";

import { useActionState, useEffect, useState } from "react";

import { toast } from "sonner";

import { updateProfile, type ProfileFormState } from "./actions";

import { Button } from "@/components/ui/button";
import InputText from "@/components/ui/input-text";
import InputTextarea from "@/components/ui/input-textarea";
import { Spinner } from "@/components/ui/spinner";
import { BIO_MAX, NAME_MAX } from "@/lib/profile";

type Props = {
  username: string | null;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

export function SettingsForm({ username, name, bio, avatarUrl }: Props) {
  const [state, formAction, isPending] = useActionState<ProfileFormState, FormData>(
    updateProfile,
    undefined,
  );

  // Mirror inputs locally for live preview + character counter.
  const [nameValue, setNameValue] = useState(name ?? "");
  const [bioValue, setBioValue] = useState(bio ?? "");
  const [avatarValue, setAvatarValue] = useState(avatarUrl ?? "");

  useEffect(() => {
    if (state?.ok) toast.success("Profile saved.");
  }, [state]);

  const displayName = nameValue.trim() || (username ? `@${username}` : "You");
  const initial = (nameValue.trim() || username || "?").charAt(0).toUpperCase();

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xl font-semibold">
          {avatarValue.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarValue.trim()}
              alt=""
              className="size-full object-cover"
              onError={(e) => (e.currentTarget.style.visibility = "hidden")}
              onLoad={(e) => (e.currentTarget.style.visibility = "visible")}
            />
          ) : (
            initial
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">{displayName}</p>
          {bioValue.trim() && (
            <p className="truncate text-sm text-muted-foreground">{bioValue.trim()}</p>
          )}
        </div>
      </div>

      <InputText
        name="name"
        label="Name"
        placeholder="Your display name"
        value={nameValue}
        onChange={(e) => setNameValue(e.target.value)}
        maxLength={NAME_MAX}
        autoComplete="name"
      />

      <InputText
        name="avatarUrl"
        label="Avatar (image URL)"
        placeholder="https://example.com/photo.jpg"
        description="Paste an image URL. Leave empty to use your name's initial."
        value={avatarValue}
        onChange={(e) => setAvatarValue(e.target.value)}
        inputMode="url"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      <InputTextarea
        name="bio"
        label="Bio"
        placeholder="Tell us a little about yourself…"
        description={`${bioValue.length}/${BIO_MAX} characters`}
        value={bioValue}
        onChange={(e) => setBioValue(e.target.value)}
        maxLength={BIO_MAX}
        rows={3}
      />

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner />}
          Save
        </Button>
      </div>
    </form>
  );
}
