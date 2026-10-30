"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { type ContactFormState, updateContactCard } from "./actions";

import { Button } from "@/components/ui/button";
import InputSwitch from "@/components/ui/input-switch";
import InputText from "@/components/ui/input-text";
import { Spinner } from "@/components/ui/spinner";
import { CONTACT_EMAIL_MAX, CONTACT_PHONE_MAX, CONTACT_TEXT_MAX } from "@/lib/vcard";

type Props = {
  contactEnabled: boolean;
  contactPhone: string | null;
  contactEmail: string | null;
  contactOrg: string | null;
  contactTitle: string | null;
};

/** Opt-in vCard: a "Save contact" button on the public page with these details. */
export function ContactCardForm({
  contactEnabled,
  contactPhone,
  contactEmail,
  contactOrg,
  contactTitle,
}: Props) {
  const [state, formAction, isPending] = useActionState<ContactFormState, FormData>(
    updateContactCard,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) toast.success("Contact card saved.");
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Contact card</p>
        <p className="text-xs text-muted-foreground">
          Let visitors save you to their phone contacts with your name, bio, and profile link, plus
          the details below. Anyone who downloads your contact card can see them.
        </p>
      </div>

      <InputSwitch
        name="contactEnabled"
        label="Show a Save contact button"
        description="Adds a button under your social icons on your public page."
        defaultChecked={contactEnabled}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <InputText
          name="contactPhone"
          label="Phone"
          placeholder="+62 812-3456-7890"
          defaultValue={contactPhone ?? ""}
          maxLength={CONTACT_PHONE_MAX}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
        />
        <InputText
          name="contactEmail"
          label="Public email"
          placeholder="hello@example.com"
          defaultValue={contactEmail ?? ""}
          maxLength={CONTACT_EMAIL_MAX}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          spellCheck={false}
        />
        <InputText
          name="contactOrg"
          label="Organization"
          placeholder="Company or organization"
          defaultValue={contactOrg ?? ""}
          maxLength={CONTACT_TEXT_MAX}
          autoComplete="organization"
        />
        <InputText
          name="contactTitle"
          label="Job title"
          placeholder="What you do"
          defaultValue={contactTitle ?? ""}
          maxLength={CONTACT_TEXT_MAX}
          autoComplete="organization-title"
        />
      </div>

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
