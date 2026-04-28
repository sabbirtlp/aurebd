"use client";

import { useThemeStore } from "@/store/themeStore";
import { useEffect, useState } from "react";

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme, mounted]);

  // Prevent flash by not rendering until mounted
  return <>{children}</>;
}
