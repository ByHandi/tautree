"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for errors thrown in the root layout itself. It replaces
 * the whole document, so it must render its own <html>/<body> and can't rely on
 * globals.css being loaded — hence inline styles.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f8fafc",
          color: "#0f172a",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>Something went wrong</h1>
        <p style={{ fontSize: "0.875rem", color: "#64748b", maxWidth: "24rem", margin: 0 }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            cursor: "pointer",
            borderRadius: "0.5rem",
            border: "none",
            background: "#0f172a",
            color: "#fff",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
