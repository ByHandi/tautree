"use client";

import { useActionState, useEffect } from "react";

import { toast } from "sonner";

import { createLink, updateLink, type LinkFormState } from "./actions";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InputText from "@/components/ui/input-text";
import { Spinner } from "@/components/ui/spinner";
import { TITLE_MAX } from "@/lib/links";

type EditableLink = { id: string; title: string; url: string };

/**
 * Create/edit dialog. The parent mounts this fresh per open (via `key`) so the
 * `useActionState` state resets cleanly between create and edit sessions.
 */
export function LinkFormDialog({
  link,
  onClose,
}: {
  link: EditableLink | null;
  onClose: () => void;
}) {
  const isEdit = link !== null;
  const [state, formAction, isPending] = useActionState<LinkFormState, FormData>(
    isEdit ? updateLink : createLink,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success(isEdit ? "Link updated." : "Link added.");
      onClose();
    }
  }, [state, isEdit, onClose]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit link" : "Add link"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update your link's title or URL."
              : "Add a new link to your public page."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          {isEdit && <input type="hidden" name="id" value={link.id} />}

          <InputText
            name="title"
            label="Title"
            placeholder="Instagram"
            defaultValue={link?.title ?? ""}
            required
            maxLength={TITLE_MAX}
            autoComplete="off"
          />

          <InputText
            name="url"
            label="URL"
            placeholder="https://instagram.com/username"
            defaultValue={link?.url ?? ""}
            required
            inputMode="url"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner />}
              {isEdit ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
