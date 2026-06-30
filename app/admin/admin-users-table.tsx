"use client";

import Link from "next/link";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteUser, setSuspended } from "./actions";

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

export type AdminUserRow = {
  id: string;
  username: string | null;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  suspended: boolean;
  createdAt: string;
  linkCount: number;
  clicks: number;
  isSelf: boolean;
};

export function AdminUsersTable({ rows, query }: { rows: AdminUserRow[]; query: string }) {
  const [deleting, setDeleting] = useState<AdminUserRow | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSuspend(user: AdminUserRow) {
    setPendingId(user.id);
    startTransition(async () => {
      const res = await setSuspended(user.id, !user.suspended);
      setPendingId(null);
      if (res.error) toast.error(res.error);
      else toast.success(user.suspended ? "Account un-suspended." : "Account suspended.");
    });
  }

  function handleDelete() {
    if (!deleting) return;
    const id = deleting.id;
    startTransition(async () => {
      const res = await deleteUser(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("User deleted.");
        setDeleting(null);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form action="/admin" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search username, email, or name…"
          className="h-9 flex-1 rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" variant="outline">
          <Icon name="search" />
          Search
        </Button>
      </form>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          {query ? `No users match “${query}”.` : "No users yet."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">User</th>
                <th className="px-3 py-2 font-medium">Links</th>
                <th className="px-3 py-2 font-medium">Clicks</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1.5 font-medium">
                        {u.username ? (
                          <Link href={`/admin/users/${u.id}`} className="hover:underline">
                            @{u.username}
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="text-muted-foreground italic hover:underline"
                          >
                            no username
                          </Link>
                        )}
                        {u.role === "ADMIN" && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase">
                            Admin
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 tabular-nums">{u.linkCount}</td>
                  <td className="px-3 py-2 tabular-nums">{u.clicks}</td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                        u.suspended
                          ? "bg-destructive/10 text-destructive"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          u.suspended ? "bg-destructive" : "bg-emerald-500",
                        )}
                      />
                      {u.suspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={u.isSelf || (isPending && pendingId === u.id)}
                        onClick={() => handleSuspend(u)}
                        title={u.isSelf ? "You can't suspend yourself" : undefined}
                      >
                        {isPending && pendingId === u.id && <Spinner />}
                        {u.suspended ? "Un-suspend" : "Suspend"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={u.isSelf}
                        onClick={() => setDeleting(u)}
                        aria-label="Delete user"
                        title={u.isSelf ? "You can't delete yourself" : "Delete user"}
                      >
                        <Icon name="trash-2" className="text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>
              {deleting?.username ? `@${deleting.username}` : deleting?.email} and all their links
              and analytics will be permanently deleted. This can’t be undone.
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
