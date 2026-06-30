"use client";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const QR_DARK = "#0f172a";

// Standalone SVG of the brand mark (the React <Logo> uses currentColor, which a
// canvas-drawn image can't resolve) so it can be rasterized for the download.
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
<path d="M16 27.5V6.5" stroke="${QR_DARK}" stroke-width="2.2" stroke-linecap="round"/>
<path d="M16 17C13 16 9.5 15 6.5 9.5" stroke="${QR_DARK}" stroke-width="2.2" stroke-linecap="round"/>
<path d="M16 17C19 16 22.5 15 25.5 9.5" stroke="${QR_DARK}" stroke-width="2.2" stroke-linecap="round"/>
<circle cx="16" cy="28" r="2.6" fill="${QR_DARK}"/>
<circle cx="16" cy="6" r="2.6" fill="${QR_DARK}"/>
<circle cx="6" cy="9" r="2.6" fill="${QR_DARK}"/>
<circle cx="26" cy="9" r="2.6" fill="${QR_DARK}"/>
</svg>`;
const LOGO_URI = `data:image/svg+xml;utf8,${encodeURIComponent(LOGO_SVG)}`;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

/**
 * Profile QR with the brand mark centered and the URL captioned. The on-screen
 * version overlays the logo via CSS; "Download" re-composites QR + logo + URL
 * onto a canvas so the saved PNG matches what's shown (no extra deps).
 */
export function QrCard({
  dataUri,
  url,
  filename,
}: {
  dataUri: string;
  url: string;
  filename: string;
}) {
  async function download() {
    try {
      const qrSize = 512;
      const pad = 24;
      const captionH = 72;
      const canvas = document.createElement("canvas");
      canvas.width = qrSize + pad * 2;
      canvas.height = qrSize + pad + captionH;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const [qr, logo] = await Promise.all([loadImage(dataUri), loadImage(LOGO_URI)]);
      ctx.drawImage(qr, pad, pad, qrSize, qrSize);

      // White rounded backing + centered logo (EC level H tolerates the punch-out).
      const box = 96;
      const bx = pad + (qrSize - box) / 2;
      const by = pad + (qrSize - box) / 2;
      ctx.fillStyle = "#ffffff";
      if (typeof ctx.roundRect === "function") {
        ctx.beginPath();
        ctx.roundRect(bx, by, box, box, 16);
        ctx.fill();
      } else {
        ctx.fillRect(bx, by, box, box);
      }
      const inset = 18;
      ctx.drawImage(logo, bx + inset, by + inset, box - inset * 2, box - inset * 2);

      // URL caption, shrunk to fit the canvas width.
      const maxWidth = canvas.width - pad * 2;
      let fontSize = 24;
      ctx.fillStyle = QR_DARK;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      do {
        ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
        fontSize -= 1;
      } while (ctx.measureText(url).width > maxWidth && fontSize > 10);
      ctx.fillText(url, canvas.width / 2, qrSize + pad + captionH / 2);

      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = filename;
      a.click();
    } catch {
      // Best-effort — never disrupt the dashboard.
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border p-6 sm:flex-row">
      <div className="relative shrink-0 rounded-lg border bg-white p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUri} alt={`QR code for ${url}`} className="size-36" />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex size-9 items-center justify-center rounded-md bg-white">
            <Logo className="size-6 text-[#0f172a]" />
          </span>
        </span>
      </div>

      <div className="flex flex-col items-center gap-3 sm:items-start">
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <p className="font-medium">Your QR code</p>
          <p className="text-sm text-muted-foreground">
            Print it or share it offline — it opens your public page.
          </p>
          <p className="text-xs break-all text-muted-foreground">{url}</p>
        </div>
        <Button variant="outline" size="sm" onClick={download}>
          <Icon name="download" />
          Download PNG
        </Button>
      </div>
    </div>
  );
}
