import { Box, Button, IconButton, Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Add, Remove, RestartAlt } from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";

const SIZES = {
  small: { stepWidth: 40, height: 28, resetSize: 28, icon: "1.1rem" },
  medium: { stepWidth: 48, height: 32, resetSize: 32, icon: "1.25rem" },
};

export default function ClockStepper({
  onDecrement,
  onIncrement,
  onReset,
  decrementDisabled = false,
  incrementDisabled = false,
  resetDisabled = false,
  onPrimary = false,
  size = "medium",
  resetTooltip,
  children,
  sx,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const dims = SIZES[size] ?? SIZES.medium;

  const stepSx = onPrimary
    ? {
        bgcolor: theme.white,
        color: theme.primary,
        "&:hover": { bgcolor: alpha(theme.white, 0.85) },
        "&.Mui-disabled": {
          bgcolor: alpha(theme.white, 0.45),
          color: alpha(theme.primary, 0.6),
        },
      }
    : {
        bgcolor: "action.selected",
        color: "text.primary",
        "&:hover": { bgcolor: "action.focus", color: "text.primary" },
        "&.Mui-disabled": {
          bgcolor: "action.disabledBackground",
          color: "action.disabled",
        },
      };

  const stepButton = (label, onClick, disabled, Icon) => (
    <Tooltip title={label} arrow>
      <span style={{ display: "inline-flex" }}>
        <Button
          aria-label={label}
          size="small"
          onClick={onClick}
          disabled={disabled}
          sx={{
            minWidth: dims.stepWidth,
            width: dims.stepWidth,
            height: dims.height,
            p: 0,
            border: "none",
            borderRadius: "4px",
            boxShadow: "none",
            backgroundImage: "none",
            ...stepSx,
          }}
        >
          <Icon sx={{ fontSize: dims.icon }} />
        </Button>
      </span>
    </Tooltip>
  );

  return (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        flexShrink: 0,
        ...sx,
      }}
    >
      {stepButton(t("Decrement"), onDecrement, decrementDisabled, Remove)}
      {children}
      {stepButton(t("Increment"), onIncrement, incrementDisabled, Add)}
      {onReset && (
        <Tooltip title={resetTooltip ?? t("Reset")} arrow>
          <span style={{ display: "inline-flex" }}>
            <IconButton
              aria-label={resetTooltip ?? t("Reset")}
              onClick={onReset}
              disabled={resetDisabled}
              sx={{
                p: 0,
                ml: "2px",
                width: dims.resetSize,
                height: dims.resetSize,
                color: onPrimary ? theme.white : "text.secondary",
                "&.Mui-disabled": {
                  color: onPrimary
                    ? alpha(theme.white, 0.4)
                    : "action.disabled",
                },
              }}
            >
              <RestartAlt sx={{ fontSize: dims.icon }} />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Box>
  );
}
