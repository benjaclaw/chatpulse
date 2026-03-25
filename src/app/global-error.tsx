"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}): React.ReactNode {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="no">
      <body
        style={{
          margin: 0,
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fafafa",
          color: "#0f172a",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: "#fef2f2",
              color: "#ef4444",
              fontSize: 32,
              marginBottom: 24,
            }}
          >
            !
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              margin: "0 0 8px",
            }}
          >
            En kritisk feil oppstod
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#64748b",
              maxWidth: 400,
              margin: "0 auto 24px",
              lineHeight: 1.6,
            }}
          >
            Applikasjonen kunne ikke lastes. Prøv å laste siden på nytt.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: 12,
                color: "#94a3b8",
                fontFamily: "monospace",
                marginBottom: 24,
              }}
            >
              Feil-ID: {error.digest}
            </p>
          )}
          <button
            onClick={() => unstable_retry()}
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 40,
              padding: "0 16px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#6366f1",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Prøv igjen
          </button>
        </div>
      </body>
    </html>
  );
}
