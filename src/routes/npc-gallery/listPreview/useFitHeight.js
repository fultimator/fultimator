import { useEffect } from "react";

export function useFitHeight(ref, top, enabled) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const offset = Math.max(top, el.getBoundingClientRect().top);
      el.style.height = `${Math.max(240, window.innerHeight - offset - 16)}px`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new window.ResizeObserver(schedule);
    observer.observe(document.body);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, top, enabled]);
}
