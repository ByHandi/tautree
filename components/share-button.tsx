"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

/**
 * Visitor-facing share affordance on a public profile. Lets people copy the
 * link, use the native share sheet (mobile), or scan the QR. The QR is fetched
 * from `/api/qr/<username>` only when the dialog opens, so it never weighs down
 * the initial page load.
 */
export function ShareButton({
  url,
  username,
  color,
}: {
  url: string;
  username: string;
  color: string;
}) {
  const [open, setOpen] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `@${username}`, url });
      } catch {
        // user dismissed the share sheet — ignore
      }
    } else {
      void copy();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Share this page"
          className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full transition-opacity hover:opacity-70"
          style={{ color }}
        >
          <Icon name="share-2" className="size-5" />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Share this page</DialogTitle>
          <DialogDescription>Copy the link, share it, or scan the QR code.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <span className="rounded-xl border bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/qr/${encodeURIComponent(username)}`}
              alt={`QR code for ${url}`}
              width={176}
              height={176}
              className="size-44"
            />
          </span>

          <div className="flex w-full items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            <span className="min-w-0 flex-1 truncate text-muted-foreground">{url}</span>
          </div>

          <div className="grid w-full grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={copy}>
              <Icon name="copy" />
              Copy link
            </Button>
            <Button type="button" onClick={share}>
              <Icon name="share-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
