import React, { useLayoutEffect, useRef, useState } from "react";
import { Box } from "@mui/material";

interface MasonryColumnsProps {
  children: React.ReactNode;
  columnWidth?: number;
  gap?: number;
}

export default function MasonryColumns({
  children,
  columnWidth = 460,
  gap = 24,
}: MasonryColumnsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setCount(
        Math.max(1, Math.floor((el.clientWidth + gap) / (columnWidth + gap))),
      );
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [columnWidth, gap]);

  const items = React.Children.toArray(children);
  const columns: React.ReactNode[][] = Array.from({ length: count }, () => []);
  items.forEach((item, i) => columns[i % count].push(item));

  return (
    <Box
      ref={ref}
      sx={{ display: "flex", alignItems: "flex-start", gap: `${gap}px` }}
    >
      {columns.map((column, i) => (
        <Box key={i} sx={{ flex: 1, minWidth: 0 }}>
          {column}
        </Box>
      ))}
    </Box>
  );
}
