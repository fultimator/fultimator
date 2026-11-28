import { Box } from "@mui/material";
import { PLACEHOLDER_HEIGHT, useLazyMount } from "./useLazyMount";

export default function MasonryCard({ id, active, scrollMarginTop, children }) {
  const { elRef, mounted } = useLazyMount();

  return (
    <Box
      ref={elRef}
      data-npc-id={id}
      sx={{
        scrollMarginTop,
        position: "relative",
        pt: 1.5,
        minHeight: mounted ? undefined : PLACEHOLDER_HEIGHT,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          borderRadius: 2,
          bgcolor: "primary.main",
          opacity: active ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
        },
      }}
    >
      {mounted && children}
    </Box>
  );
}
