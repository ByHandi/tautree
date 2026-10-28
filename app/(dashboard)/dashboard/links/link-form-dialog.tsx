"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
import Icon from "@/components/ui/icon";
import InputText from "@/components/ui/input-text";
import { Spinner } from "@/components/ui/spinner";
import { type LinkKind, THUMBNAIL_MAX_CHARS, TITLE_MAX } from "@/lib/links";
import { cn } from "@/lib/utils";

type EditableLink = {
  id: string;
  title: string;
  url: string | null;
  type: LinkKind;
  thumbnail: string | null;
  featured: boolean;
  startsAt: string | null;
  endsAt: string | null;
};

/** Longest edge (px) of a stored thumbnail — keeps the data URI small. */
const THUMBNAIL_MAX_DIM = 128;

/**
 * Read an image file, downscale it to a small square-ish thumbnail on a canvas,
 * and return a compressed data URI. Done client-side so no upload/storage infra
 * is needed — the server only validates + stores the resulting string.
 */
async function fileToThumbnail(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("decode failed"));
    image.src = dataUrl;
  });

  const scale = Math.min(1, THUMBNAIL_MAX_DIM / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas context");
  ctx.drawImage(img, 0, 0, width, height);
  // WebP where supported; browsers fall back to PNG (both are server-accepted).
  return canvas.toDataURL("image/webp", 0.85);
}

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

/** Initial field values: the link being edited, or blanks for a new link. */
function formDefaults(link: EditableLink | null) {
  return {
    kind: link?.type ?? "LINK",
    title: link?.title ?? "",
    url: link?.url ?? "",
    thumbnail: link?.thumbnail ?? null,
    featured: link?.featured ?? false,
  };
}

/** Per-kind dialog copy. */
const KIND_COPY: Record<
  LinkKind,
  { noun: string; description: string; titleLabel: string; titlePlaceholder: string }
> = {
  LINK: {
    noun: "link",
    description: "Add a new link to your public page.",
    titleLabel: "Title",
    titlePlaceholder: "Instagram",
  },
  HEADER: {
    noun: "header",
    description: "A section label to group the links on your public page.",
    titleLabel: "Heading",
    titlePlaceholder: "My socials",
  },
  EMBED: {
    noun: "embed",
    description: "Embed a YouTube video or Spotify track/playlist inline.",
    titleLabel: "Title",
    titlePlaceholder: "My latest video",
  },
};

const KIND_OPTIONS = [
  { value: "LINK", label: "Link", icon: "link" },
  { value: "HEADER", label: "Header", icon: "heading" },
  { value: "EMBED", label: "Embed", icon: "play" },
] as const;

/** Segmented Link / Header / Embed switch. */
function KindPicker({ kind, onChange }: { kind: LinkKind; onChange: (kind: LinkKind) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1" role="group">
      {KIND_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={kind === opt.value}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            kind === opt.value
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon name={opt.icon} className="size-4" />
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** Destination URL; embeds get provider-specific hints. */
function UrlField({ isEmbed, defaultValue }: { isEmbed: boolean; defaultValue: string }) {
  return (
    <InputText
      name="url"
      label="URL"
      placeholder={isEmbed ? "https://youtube.com/watch?v=…" : "https://instagram.com/username"}
      description={
        isEmbed ? "Paste a YouTube video or Spotify track/album/playlist link." : undefined
      }
      defaultValue={defaultValue}
      required
      inputMode="url"
      autoComplete="off"
      autoCapitalize="off"
      spellCheck={false}
    />
  );
}

/**
 * Optional custom icon: preview, upload/replace/remove, and the hidden field the
 * server action reads. State and the file handler live in the dialog.
 */
function ThumbnailPicker({
  thumbnail,
  busy,
  inputRef,
  onPickFile,
  onRemove,
}: {
  thumbnail: string | null;
  busy: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onPickFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">
        Icon <span className="font-normal text-muted-foreground">(optional)</span>
      </span>
      <div className="flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnail} alt="" className="size-full object-cover" />
          ) : (
            <Icon name="image" className="size-5 text-muted-foreground" />
          )}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy && <Spinner />}
          {thumbnail ? "Replace" : "Upload"}
        </Button>
        {thumbnail && (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove} disabled={busy}>
            Remove
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPickFile}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Overrides the auto social icon. Resized to {THUMBNAIL_MAX_DIM}px.
      </p>
      <input type="hidden" name="thumbnail" value={thumbnail ?? ""} />
    </div>
  );
}

function FeaturedCheckbox({ defaultChecked }: { defaultChecked: boolean }) {
  return (
    <label className="flex items-start gap-2.5 text-sm">
      <input
        type="checkbox"
        name="featured"
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 rounded border-input accent-primary"
      />
      <span className="flex flex-col">
        <span className="font-medium">Feature on profile</span>
        <span className="text-xs text-muted-foreground">
          Pinned to the top as a larger highlight card.
        </span>
      </span>
    </label>
  );
}

/**
 * Schedule inputs are local wall-clock; the hidden fields carry the
 * timezone-safe ISO value that the server action actually reads.
 */
function ScheduleFields({
  startsLocal,
  endsLocal,
  onStartsChange,
  onEndsChange,
}: {
  startsLocal: string;
  endsLocal: string;
  onStartsChange: (value: string) => void;
  onEndsChange: (value: string) => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <div className="grid grid-cols-2 gap-3">
          <InputText
            type="datetime-local"
            label="Starts"
            value={startsLocal}
            onChange={(e) => onStartsChange(e.target.value)}
          />
          <InputText
            type="datetime-local"
            label="Ends"
            value={endsLocal}
            onChange={(e) => onEndsChange(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Optional. Leave blank to show it immediately and indefinitely.
        </p>
      </div>
      <input type="hidden" name="startsAt" value={toIso(startsLocal)} />
      <input type="hidden" name="endsAt" value={toIso(endsLocal)} />
    </>
  );
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
  const defaults = formDefaults(link);
  const [state, formAction, isPending] = useActionState<LinkFormState, FormData>(
    isEdit ? updateLink : createLink,
    undefined,
  );

  const [kind, setKind] = useState<LinkKind>(defaults.kind);
  const isHeader = kind === "HEADER";
  const isLink = kind === "LINK";
  const copy = KIND_COPY[kind];

  const [thumbnail, setThumbnail] = useState<string | null>(defaults.thumbnail);
  const [thumbBusy, setThumbBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be re-picked after a remove
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setThumbBusy(true);
    try {
      const data = await fileToThumbnail(file);
      if (data.length > THUMBNAIL_MAX_CHARS) {
        toast.error("That image is too detailed — try a simpler one.");
        return;
      }
      setThumbnail(data);
    } catch {
      toast.error("Couldn't process that image.");
    } finally {
      setThumbBusy(false);
    }
  }

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
          <DialogTitle>
            {isEdit ? "Edit" : "Add"} {copy.noun}
          </DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          {isEdit && <input type="hidden" name="id" value={link.id} />}
          <input type="hidden" name="type" value={kind} />

          <KindPicker kind={kind} onChange={setKind} />

          <InputText
            name="title"
            label={copy.titleLabel}
            placeholder={copy.titlePlaceholder}
            defaultValue={defaults.title}
            required
            maxLength={TITLE_MAX}
            autoComplete="off"
          />

          {!isHeader && <UrlField isEmbed={kind === "EMBED"} defaultValue={defaults.url} />}

          {isLink && (
            <ThumbnailPicker
              thumbnail={thumbnail}
              busy={thumbBusy}
              inputRef={fileInputRef}
              onPickFile={onPickFile}
              onRemove={() => setThumbnail(null)}
            />
          )}

          {isLink && <FeaturedCheckbox defaultChecked={defaults.featured} />}

          <ScheduleFields
            startsLocal={startsLocal}
            endsLocal={endsLocal}
            onStartsChange={setStartsLocal}
            onEndsChange={setEndsLocal}
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
