"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { type LinkFormState, createLink, updateLink } from "./actions";

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

type EditableLink = {
  id: string;
  title: string;
  url: string;
  startsAt: string | null;
  endsAt: string | null;
};

/** ISO string → `datetime-local` value (local wall-clock, minute precision). */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

/** `datetime-local` value (local wall-clock) → ISO-8601 with offset, or "". */
function toIso(local: string): string {
  if (!local) return "";
  const date = new Date(local);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

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

  // Schedule inputs are local wall-clock; hidden fields carry the timezone-safe
  // ISO value that the server action actually reads.
  const [startsLocal, setStartsLocal] = useState(() => toLocalInput(link?.startsAt ?? null));
  const [endsLocal, setEndsLocal] = useState(() => toLocalInput(link?.endsAt ?? null));

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
            {isEdit ? "Update your link's title or URL." : "Add a new link to your public page."}
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

          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-2 gap-3">
              <InputText
                type="datetime-local"
                label="Starts"
                value={startsLocal}
                onChange={(e) => setStartsLocal(e.target.value)}
              />
              <InputText
                type="datetime-local"
                label="Ends"
                value={endsLocal}
                onChange={(e) => setEndsLocal(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Optional. Leave blank to show the link immediately and indefinitely.
            </p>
          </div>
          <input type="hidden" name="startsAt" value={toIso(startsLocal)} />
          <input type="hidden" name="endsAt" value={toIso(endsLocal)} />

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
