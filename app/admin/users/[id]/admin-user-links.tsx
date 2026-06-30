"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteLinkAsAdmin } from "../../actions";

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
import { cn } from "@/lib/utils";

type AdminLink = {
  id: string;
  type: "LINK" | "HEADER";
  title: string;
  url: string | null;
  isActive: boolean;
  clicks: number;
};

export function AdminUserLinks({ links }: { links: AdminLink[] }) {
  const [deleting, setDeleting] = useState<AdminLink | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!deleting) return;
    const id = deleting.id;
    startTransition(async () => {
      const res = await deleteLinkAsAdmin(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Link deleted.");
        setDeleting(null);
      }
    });
  }

  if (links.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        This user has no links.
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <span
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                link.isActive ? "bg-emerald-500" : "bg-muted-foreground/40",
              )}
              title={link.isActive ? "Active" : "Inactive"}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">{link.title}</span>
              <span className="truncate text-sm text-muted-foreground">
                {link.type === "HEADER" ? "Section header" : link.url}
              </span>
            </div>
            <span className="hidden items-center gap-1 px-1 text-xs text-muted-foreground sm:flex">
              <Icon name="mouse-pointer-click" className="size-3.5" />
              {link.clicks}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDeleting(link)}
              aria-label="Delete link"
            >
              <Icon name="trash-2" className="text-destructive" />
            </Button>
          </li>
        ))}
      </ul>

      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete link?</DialogTitle>
            <DialogDescription>
              The link “{deleting?.title}” will be permanently deleted. This can’t be undone.
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
    </>
  );
}
