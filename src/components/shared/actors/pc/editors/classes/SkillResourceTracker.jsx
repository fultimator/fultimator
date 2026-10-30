import { Box, IconButton, Typography, Tooltip } from "@mui/material";
import { Add, Remove, RestartAlt } from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import { resolveResourceMax } from "/src/forms/schema/shared/resourceTrackSchema";
import { useResourceTrack } from "/src/hooks/useClock";

export default function SkillResourceTracker({
  resource,
  skillLevel,
  onChange,
}) {
  const { t } = useTranslate();
  const cap = resolveResourceMax(resource, skillLevel ?? 0);
  const { current, increment, decrement, reset, isMax, isMin } =
    useResourceTrack(cap, resource.current ?? 0, onChange, resource.step ?? 1);

  const label = resource.name?.trim() || t("class_skill_resource_enabled");

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        px: "17px",
        py: "4px",
      }}
    >
      <Typography sx={{ fontFamily: "PT Sans Narrow", fontWeight: "bold" }}>
        {t(label)}:
      </Typography>
      <IconButton size="small" onClick={decrement} disabled={isMin}>
        <Remove fontSize="small" />
      </IconButton>
      <Typography sx={{ minWidth: 48, textAlign: "center" }}>
        {current}
        {cap > 0 ? ` / ${cap}` : ""}
      </Typography>
      <IconButton size="small" onClick={increment} disabled={isMax}>
        <Add fontSize="small" />
      </IconButton>
      <Tooltip title={t("class_skill_resource_reset")}>
        <span>
          <IconButton size="small" onClick={reset} disabled={isMin}>
            <RestartAlt fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
