"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error); fetch('/api/log-error', { method: 'POST', body: error.stack || error.message });
  }, [error]);

  return (
    <div className="container" style={{ padding: "8rem 1.5rem", textAlign: "center" }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Error!</h2>
      <p style={{ color: "var(--text-light)", marginBottom: "2rem" }}>
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={() => reset()}
        className="btn-nm btn-nm-primary"
      >
        Try again
      </button>
    </div>
  );
}
