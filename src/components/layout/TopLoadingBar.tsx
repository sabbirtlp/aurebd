"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function NavigationHandler({ onFinish }: { onFinish: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    onFinish();
  }, [pathname, searchParams, onFinish]);

  return null;
}

export default function TopLoadingBar() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor && anchor.href && anchor.href.startsWith(window.location.origin)) {
        // Only trigger if it's a different URL
        const targetUrl = new URL(anchor.href);
        const currentUrl = new URL(window.location.href);
        
        if (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search) {
          setLoading(true);
          window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        }
      }
    };

    window.addEventListener("click", handleAnchorClick);
    return () => window.removeEventListener("click", handleAnchorClick);
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <NavigationHandler onFinish={() => setLoading(false)} />
      </Suspense>
      
      {loading && (
        <div className="top-loading-bar-container">
          <div className="top-loading-bar" />
          <style jsx>{`
            .top-loading-bar-container {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              height: 3px;
              z-index: 9999;
              pointer-events: none;
            }
            .top-loading-bar {
              height: 100%;
              background: var(--accent);
              box-shadow: 0 0 10px var(--accent);
              width: 0%;
              animation: loading 2s ease-in-out forwards;
            }
            @keyframes loading {
              0% { width: 0%; }
              50% { width: 70%; }
              100% { width: 90%; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
