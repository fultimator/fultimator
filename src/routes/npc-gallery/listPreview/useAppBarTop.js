import { useEffect, useState } from "react";

const DEFAULT_HEIGHT = 56;

export function useAppBarTop() {
  const [height, setHeight] = useState(DEFAULT_HEIGHT);

  useEffect(() => {
    const bar = document.querySelector("header.MuiAppBar-root");
    if (!bar) return undefined;
    const update = () => setHeight(bar.offsetHeight);
    update();
    const observer = new window.ResizeObserver(update);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  return height;
}
