import { Box, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { MOBILE_LIST_BAR_HEIGHT } from "./constants";

export default function MobileListBar({
  top,
  title,
  currentName,
  currentIndex,
  count,
  onOpen,
}) {
  return (
    <Box
      sx={{
        position: "sticky",
        top,
        zIndex: 2,
        height: MOBILE_LIST_BAR_HEIGHT,
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1,
        mb: 1,
        bgcolor: "background.default",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <IconButton size="small" onClick={onOpen} aria-label={title}>
        <MenuIcon />
      </IconButton>
      <Typography noWrap sx={{ flex: 1, fontWeight: 700 }}>
        {currentName || title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {currentIndex > 0 ? `${currentIndex} / ${count}` : count}
      </Typography>
    </Box>
  );
}
