import { useEffect, useRef, useState } from "react";

export const PLACEHOLDER_HEIGHT = 460;
const MOUNT_MARGIN = "1200px 0px";

export function useLazyMount(rootRef) {
  const elRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = elRef.current;
    if (mounted || !el) return undefined;
    const observer = new window.IntersectionObserver(
      ([entry]) => entry.isIntersecting && setMounted(true),
      { root: rootRef?.current ?? null, rootMargin: MOUNT_MARGIN },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted, rootRef]);

  return { elRef, mounted };
}
