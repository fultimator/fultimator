import { Box } from "@mui/material";
import CompactLoadout from "../playerSheet/compact/CompactLoadout";

export default function PcCompactLoadout({
  pc,
  onUpdate,
  isInteractive = false,
  searchQuery = "",
}) {
  return (
    <Box
      sx={{
        "& .MuiIconButton-root": {
          width: "28px !important",
          height: "28px !important",
          p: "0 !important",
        },
        "& .MuiIconButton-root .MuiSvgIcon-root": {
          fontSize: "1.15rem !important",
        },
      }}
    >
      <CompactLoadout
        player={pc}
        setPlayer={onUpdate}
        isEditMode={isInteractive}
        isMainTab={false}
        searchQuery={searchQuery}
      />
    </Box>
  );
}
