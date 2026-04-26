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
    console.error(error);
  }, [error]);

  return (
    <div className="container" style={{ padding: "8rem 1.5rem", textAlign: "center" }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Something went wrong!</h2>
      <p style={{ color: "var(--text-light)", marginBottom: "2rem" }}>We apologize for the inconvenience. Our team has been notified.</p>
      <button
        onClick={() => reset()}
        className="btn-nm btn-nm-primary"
      >
        Try again
      </button>
    </div>
  );
}
