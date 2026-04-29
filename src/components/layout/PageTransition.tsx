"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import styles from "./pageTransition.module.css";

function PageTransitionInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<"idle" | "loading" | "complete">("idle");

  const startTransition = useCallback(() => {
    setState("loading");
  }, []);

  const completeTransition = useCallback(() => {
    setState("complete");
    const timer = setTimeout(() => {
      setState("idle");
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Listen for route changes via link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      
      // Skip external links, hash links, and same-page links
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) return;

      // Skip if modifier keys are pressed (new tab, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;

      // Only trigger if navigating to a different page
      const currentPath = window.location.pathname + window.location.search;
      const targetUrl = new URL(href, window.location.origin);
      const targetPath = targetUrl.pathname + targetUrl.search;
      
      if (currentPath !== targetPath) {
        startTransition();
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [startTransition]);

  // Complete transition when route actually changes
  useEffect(() => {
    if (state === "loading") {
      completeTransition();
    }
  }, [pathname, searchParams, completeTransition]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state === "idle") return null;

  return (
    <>
      {/* Top progress bar */}
      <div
        className={`${styles.progressBar} ${
          state === "loading" ? styles.active : state === "complete" ? styles.complete : ""
        }`}
      />

      {/* Glow trail */}
      <div
        className={`${styles.progressGlow} ${
          state === "loading" ? styles.active : state === "complete" ? styles.complete : ""
        }`}
      />

      {/* Center spinner overlay */}
      <div
        className={`${styles.overlay} ${
          state === "loading" ? styles.active : state === "complete" ? styles.complete : ""
        }`}
      >
        <div className={styles.spinner}>
          <div className={styles.spinnerRing} />
          <div className={styles.spinnerRing} />
          <div className={styles.spinnerRing} />
          <div className={styles.spinnerDot} />

          {/* Floating petals */}
          <div className={styles.petals}>
            <div className={styles.petal} />
            <div className={styles.petal} />
            <div className={styles.petal} />
            <div className={styles.petal} />
          </div>
        </div>
      </div>
    </>
  );
}

export default function PageTransition() {
  return (
    <Suspense fallback={null}>
      <PageTransitionInner />
    </Suspense>
  );
}
