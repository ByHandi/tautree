import { ImageResponse } from "next/og";

import { db } from "@/lib/db";
import { normalizeUsername, validateUsername } from "@/lib/username";

export const alt = "Profil Tautree";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: raw } = await params;
  const username = normalizeUsername(decodeURIComponent(raw));

  const user = validateUsername(username).ok
    ? await db.user.findUnique({
        where: { username },
        select: { name: true, username: true, bio: true, _count: { select: { links: true } } },
      })
    : null;

  const displayName = user?.name ?? (user ? `@${user.username}` : "Tautree");
  const handle = user ? `tautree.com/${user.username}` : "tautree.com";
  const bio = user?.bio ?? "Semua link kamu dalam satu halaman.";
  const initial = (user?.name ?? user?.username ?? "T").charAt(0).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: 32 }}>
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
            <path d="M16 27.5V6.5" stroke="#34e0a1" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M16 17C13 16 9.5 15 6.5 9.5" stroke="#34e0a1" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M16 17C19 16 22.5 15 25.5 9.5" stroke="#34e0a1" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="16" cy="28" r="2.6" fill="#34e0a1" />
            <circle cx="16" cy="6" r="2.6" fill="#34e0a1" />
            <circle cx="6" cy="9" r="2.6" fill="#34e0a1" />
            <circle cx="26" cy="9" r="2.6" fill="#34e0a1" />
          </svg>
          <span style={{ color: "#94a3b8" }}>Tautree</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            gap: "28px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "160px",
              height: "160px",
              borderRadius: "9999px",
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              fontSize: 80,
              fontWeight: 700,
            }}
          >
            {initial}
          </div>

          <div style={{ display: "flex", fontSize: 64, fontWeight: 700 }}>{displayName}</div>

          <div
            style={{
              display: "flex",
              maxWidth: "800px",
              fontSize: 32,
              color: "#cbd5e1",
              lineHeight: 1.4,
            }}
          >
            {bio}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", fontSize: 28, color: "#64748b" }}>
          {handle}
        </div>
      </div>
    ),
    { ...size },
  );
}
