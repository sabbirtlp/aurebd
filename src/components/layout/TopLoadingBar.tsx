"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function NavigationHandler({ onFinish }: { onFinish: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Small delay to ensure the page has actually started rendering/changing
    const timer = setTimeout(() => onFinish(), 100);
    return () => clearTimeout(timer);
  }, [pathname, searchParams, onFinish]);

  return null;
}

export default function TopLoadingBar() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      // Basic check for internal links
      if (anchor && anchor.href && anchor.href.startsWith(window.location.origin)) {
        const targetUrl = new URL(anchor.href);
        const currentUrl = new URL(window.location.href);
        
        // Don't trigger for: same page hashes, non-navigation links (download, etc), or links with target="_blank"
        if (anchor.target === "_blank" || anchor.hasAttribute("download") || targetUrl.hash !== "") {
          return;
        }

        // Only trigger if the path or search changes
        if (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search) {
          setLoading(true);
          // Only scroll if we are actually moving to a new path
          if (targetUrl.pathname !== currentUrl.pathname) {
             window.scrollTo({ top: 0, behavior: 'instant' });
          }
        }
      }
    };

    window.addEventListener("click", handleAnchorClick, { capture: true });
    return () => window.removeEventListener("click", handleAnchorClick, { capture: true });
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
              z-index: 10000;
              pointer-events: none;
            }
            .top-loading-bar {
              height: 100%;
              background: var(--primary);
              box-shadow: 0 0 15px var(--primary);
              width: 0%;
              animation: loading 3s cubic-bezier(0.1, 0, 0, 1) forwards;
            }
            @keyframes loading {
              0% { width: 0%; }
              50% { width: 60%; }
              100% { width: 95%; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
