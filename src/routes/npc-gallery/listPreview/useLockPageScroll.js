import { useEffect } from "react";

export function useLockPageScroll(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;
    const root = document.documentElement;
    const previous = root.style.overflow;
    window.scrollTo(0, 0);
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [enabled]);
}
