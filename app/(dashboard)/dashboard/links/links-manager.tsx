"use client";

import { useEffect, useState, useTransition } from "react";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { cn } from "@/lib/utils";

export type LinkItem = {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
  clicks: number;
};

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
        <span className="truncate font-medium">{link.title}</span>
        <span className="truncate text-sm text-muted-foreground">{link.url}</span>
      </div>

      <span className="hidden items-center gap-1 px-1 text-xs text-muted-foreground sm:flex">
        <Icon name="mouse-pointer-click" className="size-3.5" />
        {link.clicks}
      </span>

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
