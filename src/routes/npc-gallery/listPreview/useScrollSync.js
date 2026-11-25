import { useCallback, useEffect, useRef } from "react";
import { PAGE_SIZE } from "./utils";

const SCROLL_LOCK_MS = 900;

export function useScrollSync({
  items,
  current,
  setActiveId,
  apiRef,
  setPaginationModel,
  previewRef,
  desktop,
  mobileTop,
}) {
  const cardRefs = useRef(new Map());
  const lock = useRef({ active: false, timer: null });

  const registerCard = useCallback((id, el) => {
    if (el) cardRefs.current.set(id, el);
    else cardRefs.current.delete(id);
  }, []);

  const alignToCard = (el, behavior) => {
    const container = previewRef.current;
    if (desktop && container) {
      const top =
        el.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop;
      container.scrollTo({ top, behavior });
    } else {
      el.scrollIntoView({ behavior, block: "start" });
    }
  };

  const scrollToCard = (id) => {
    const el = cardRefs.current.get(id);
    if (!el) return;
    lock.current.active = true;
    clearTimeout(lock.current.timer);
    lock.current.timer = setTimeout(() => {
      alignToCard(el, "instant");
      lock.current.active = false;
    }, SCROLL_LOCK_MS);
    alignToCard(el, "smooth");
  };

  useEffect(() => {
    const visible = new Set();
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) =>
          isIntersecting
            ? visible.add(target.dataset.npcId)
            : visible.delete(target.dataset.npcId),
        );
        if (lock.current.active) return;
        const first = items.find((npc) => visible.has(String(npc.id)));
        if (first) setActiveId(first.id);
      },
      desktop
        ? { root: previewRef.current, rootMargin: "0px 0px -75% 0px" }
        : { rootMargin: `-${mobileTop + 8}px 0px -75% 0px` },
    );
    cardRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items, desktop, mobileTop, previewRef, setActiveId]);

  useEffect(() => {
    const index = items.findIndex((npc) => npc.id === current);
    if (index < 0) return undefined;
    const page = Math.floor(index / PAGE_SIZE);
    setPaginationModel((prev) =>
      prev.page === page ? prev : { ...prev, page },
    );
    const frame = requestAnimationFrame(() =>
      apiRef.current?.scrollToIndexes?.({ rowIndex: index % PAGE_SIZE }),
    );
    return () => cancelAnimationFrame(frame);
  }, [current, items, apiRef, setPaginationModel]);

  useEffect(() => () => clearTimeout(lock.current.timer), []);

  return { scrollToCard, registerCard };
}
