"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en-IN">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050810",
          color: "#f4f1e9",
          fontFamily: "system-ui, sans-serif",
          padding: "24px",
        }}
      >
        <main style={{ maxWidth: "32rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#c9a25e" }}>
            Innovations
          </p>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", margin: "12px 0" }}>
            The application could not start.
          </h1>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#b9c3d0" }}>
            A critical error occurred while rendering the site. Please reload the page. If the
            problem persists, check the server logs.
          </p>
          {error.digest && (
            <p style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#8a95a6" }}>
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              border: "1px solid #c9a25e",
              background: "#c9a25e",
              color: "#050810",
              borderRadius: "3px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
