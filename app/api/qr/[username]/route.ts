import { type NextRequest, NextResponse } from "next/server";

import QRCode from "qrcode";

import { APP_URL } from "@/lib/site";
import { normalizeUsername, validateUsername } from "@/lib/username";

/**
 * On-demand QR PNG for a public profile URL. Kept out of the profile page HTML
 * (loaded only when a visitor opens "Share") and cached hard since the QR for a
 * username never changes.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username: raw } = await params;
  const username = normalizeUsername(decodeURIComponent(raw));
  if (!validateUsername(username).ok) return new NextResponse("Not found", { status: 404 });

  const png = await QRCode.toBuffer(`${APP_URL}/${username}`, {
    width: 512,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#0f172a", light: "#ffffff" },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
