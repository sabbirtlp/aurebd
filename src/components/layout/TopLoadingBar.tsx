"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function TopLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // When path or params change, we consider the transition complete
    setLoading(false);
  }, [pathname, searchParams]);

  // We need a way to detect the *start* of navigation.
  // Next.js 14 doesn't have a direct 'routeChangeStart' event in the same way as Pages Router.
  // However, we can listen for clicks on links.
  
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor && anchor.href && anchor.href.startsWith(window.location.origin)) {
        if (anchor.href !== window.location.href) {
          setLoading(true);
        }
      }
    };

    window.addEventListener("click", handleAnchorClick);
    return () => window.removeEventListener("click", handleAnchorClick);
  }, []);

  if (!loading) return null;

  return (
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
          background: var(--primary);
          box-shadow: 0 0 10px var(--primary);
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
  );
}
