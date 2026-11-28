import { Box, Typography } from "@mui/material";
import ClockStepper from "/src/components/shared/common/ClockStepper";
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
      <Typography sx={{ fontFamily: "PFU Sans Narrow", fontWeight: "bold" }}>
        {t(label)}:
      </Typography>
      <ClockStepper
        size="small"
        onDecrement={decrement}
        onIncrement={increment}
        onReset={reset}
        decrementDisabled={isMin}
        incrementDisabled={isMax}
        resetDisabled={isMin}
        resetTooltip={t("class_skill_resource_reset")}
      >
        <Typography sx={{ minWidth: 48, textAlign: "center" }}>
          {current}
          {cap > 0 ? ` / ${cap}` : ""}
        </Typography>
      </ClockStepper>
    </Box>
  );
}
