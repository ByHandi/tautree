"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useId, useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteLink, reorderLinks, toggleLink } from "./actions";
import { LinkFormDialog } from "./link-form-dialog";

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
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import type { LinkKind } from "@/lib/links";
import { cn } from "@/lib/utils";

export type LinkItem = {
  id: string;
  type: LinkKind;
  title: string;
  url: string | null;
  thumbnail: string | null;
  isActive: boolean;
  clicks: number;
  startsAt: string | null;
  endsAt: string | null;
};

/**
 * Why a scheduled link isn't currently shown publicly. `null` = either live now
 * or simply toggled off (no schedule reason to surface). Mirrors `isLinkLive`.
 */
function scheduleStatus(link: LinkItem, now: number): "scheduled" | "expired" | null {
  if (link.endsAt && now >= Date.parse(link.endsAt)) return "expired";
  if (link.startsAt && now < Date.parse(link.startsAt)) return "scheduled";
  return null;
}

function SortableLinkRow({
  link,
  isPending,
  onToggle,
  onEdit,
  onDelete,
}: {
  link: LinkItem;
  isPending: boolean;
  onToggle: (link: LinkItem, next: boolean) => void;
  onEdit: (link: LinkItem) => void;
  onDelete: (link: LinkItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  });
  const status = scheduleStatus(link, Date.now());
  const isLink = link.type === "LINK";
  // Per-type row presentation: leading icon, badge text, and subtitle.
  const meta = (
    {
      LINK: { icon: null, badge: null, subtitle: link.url },
      HEADER: { icon: "heading", badge: "Header", subtitle: "Section header" },
      EMBED: { icon: "play", badge: "Embed", subtitle: link.url },
    } as const
  )[link.type];

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-card p-3",
        isDragging && "z-10 shadow-md",
      )}
    >
      <button
        type="button"
        className="-ml-1 cursor-grab touch-none rounded-md p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <Icon name="grip-vertical" className="size-4" />
      </button>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-1.5">
          {link.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={link.thumbnail} alt="" className="size-4 shrink-0 rounded object-cover" />
          )}
          {meta.icon && (
            <Icon name={meta.icon} className="size-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate font-medium">{link.title}</span>
          {meta.badge && (
            <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {meta.badge}
            </span>
          )}
          {status === "scheduled" && (
            <span className="shrink-0 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
              Scheduled
            </span>
          )}
          {status === "expired" && (
            <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Expired
            </span>
          )}
        </span>
        <span className="truncate text-sm text-muted-foreground">{meta.subtitle}</span>
      </div>

      {isLink && (
        <span className="hidden items-center gap-1 px-1 text-xs text-muted-foreground sm:flex">
          <Icon name="mouse-pointer-click" className="size-3.5" />
          {link.clicks}
        </span>
      )}

      <Switch
        checked={link.isActive}
        onCheckedChange={(v) => onToggle(link, v)}
        disabled={isPending}
        aria-label={link.isActive ? "Deactivate link" : "Activate link"}
      />

      <Button variant="ghost" size="icon-sm" onClick={() => onEdit(link)} aria-label="Edit link">
        <Icon name="pencil" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onDelete(link)}
        aria-label="Delete link"
      >
        <Icon name="trash-2" />
      </Button>
    </li>
  );
}

export function LinksManager({ links }: { links: LinkItem[] }) {
  // `undefined` = form closed, `null` = create mode, object = edit mode.
  const [editing, setEditing] = useState<LinkItem | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<LinkItem | null>(null);
  const [isPending, startTransition] = useTransition();
  // Stable, hydration-safe id for DndContext. Without it, dnd-kit falls back to
  // a module-global counter that diverges between server and client renders,
  // producing an aria-describedby hydration mismatch.
  const dndId = useId();

  // Local copy so drag reordering is optimistic; re-sync when the server sends
  // a fresh list (add/edit/delete/reorder all revalidate this page).
  const [items, setItems] = useState(links);
  useEffect(() => setItems(links), [links]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((l) => l.id === active.id);
    const newIndex = items.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next); // optimistic
    startTransition(async () => {
      await reorderLinks(next.map((l) => l.id));
    });
  }

  function handleToggle(link: LinkItem, next: boolean) {
    startTransition(async () => {
      await toggleLink(link.id, next);
    });
  }

  function handleDelete() {
    if (!deleting) return;
    const id = deleting.id;
    startTransition(async () => {
      await deleteLink(id);
      toast.success("Link deleted.");
      setDeleting(null);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length === 0 ? "No links yet." : `${items.length} links`}
        </p>
        <Button onClick={() => setEditing(null)}>
          <Icon name="plus" />
          Add link
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Icon name="link" className="size-5 text-muted-foreground" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-medium">No links yet</p>
            <p className="text-sm text-muted-foreground">
              Add your first link to start building your public page.
            </p>
          </div>
          <Button onClick={() => setEditing(null)} variant="outline">
            <Icon name="plus" />
            Add link
          </Button>
        </div>
      ) : (
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-2">
              {items.map((link) => (
                <SortableLinkRow
                  key={link.id}
                  link={link}
                  isPending={isPending}
                  onToggle={handleToggle}
                  onEdit={setEditing}
                  onDelete={setDeleting}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {editing !== undefined && (
        <LinkFormDialog
          key={editing ? editing.id : "new"}
          link={editing}
          onClose={() => setEditing(undefined)}
        />
      )}

      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete link?</DialogTitle>
            <DialogDescription>
              The link “{deleting?.title}” will be permanently deleted. This action can’t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending && <Spinner />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
