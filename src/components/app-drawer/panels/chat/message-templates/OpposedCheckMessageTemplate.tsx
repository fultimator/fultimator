import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { GiDiceEightFacesEight } from "react-icons/gi";
import { MdTune } from "react-icons/md";
import type { OpposedCheckResult } from "../types";
import Diamond from "../../../../Diamond";
import { CheckOpposedIcon } from "../../../../icons";
import { isOpposedTied } from "../domain/checks";

const ATTR_LABEL: Record<string, string> = {
  dex: "DEX",
  ins: "INS",
  mig: "MIG",
  wlp: "WLP",
};

const dieCellSx = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  gap: 0.25,
  px: 0.75,
  py: 0.5,
  borderRadius: 1.25,
  border: "1px solid",
  backgroundColor: "background.default",
  minWidth: 50,
};

const gridSx = {
  px: 0.75,
  py: 0.5,
  display: "grid",
  gridTemplateColumns: "24px max-content max-content 24px",
  justifyContent: "center",
  alignItems: "center",
  gap: 1,
};

interface OpposedCheckMessageTemplateProps {
  check: OpposedCheckResult;
  onReroll?: () => void;
}

export const OpposedCheckMessageTemplate: React.FC<
  OpposedCheckMessageTemplateProps
> = ({ check, onReroll }) => {
  const theme = useTheme();

  const tied = isOpposedTied(check);
  const won = tied
    ? false
    : check.fumble
      ? false
      : check.critical
        ? true
        : check.result > check.opposedToResult;

  const accentColor = check.critical
    ? "#ffcc56"
    : check.fumble
      ? "#b087a6"
      : won
        ? "#91c469"
        : tied
          ? "primary.main"
          : "#edb7aa";

  const accentBackgroundImage = check.critical
    ? "linear-gradient(to bottom, #f7c754, #d17f10)"
    : check.fumble
      ? "linear-gradient(to bottom, #b087a6, #15031e)"
      : won
        ? "linear-gradient(to bottom, #91c469, #228c22)"
        : tied
          ? `linear-gradient(to bottom, ${alpha(theme.palette.primary.light, 0.72)}, ${alpha(theme.palette.primary.dark, 0.8)})`
          : "linear-gradient(to bottom, #d99689, #880012)";

  const outcomeLabel = check.critical
    ? "Critical"
    : check.fumble
      ? "Fumble!"
      : won
        ? "Victory"
        : tied
          ? "Tied"
          : "Defeated";

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            minWidth: 40,
            borderRadius: 0.5,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 0.5,
          }}
        >
          <CheckOpposedIcon size="32px" />
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            fontSize: "0.8rem",
            fontWeight: 700,
          }}
        >
          Opposed Check
          {check.opposedToSpeaker && (
            <>
              {" "}
              <Diamond color="inherit" /> vs {check.opposedToSpeaker}
            </>
          )}
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          mt: 0.5,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {[check.primary, check.secondary].map((die, i) => (
          <Box
            key={i}
            sx={{
              ...dieCellSx,
              borderColor: "divider",
            }}
          >
            <Box sx={{ lineHeight: 0 }}>
              <GiDiceEightFacesEight size={28} />
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              {ATTR_LABEL[die.attribute]} d{die.die}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {die.result}
            </Typography>
          </Box>
        ))}

        {check.modifierTotal !== 0 && (
          <Box sx={{ ...dieCellSx, borderColor: "divider" }}>
            <Box sx={{ lineHeight: 0 }}>
              <MdTune size={28} />
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              Mod
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {check.modifierTotal > 0
                ? `+${check.modifierTotal}`
                : String(check.modifierTotal)}
            </Typography>
          </Box>
        )}
      </Stack>

      <Box
        sx={{
          mt: 1,
          borderRadius: 1.5,
          border: check.critical || check.fumble ? "2px solid" : "1px solid",
          borderColor: check.critical
            ? "#ffcc56"
            : check.fumble
              ? "#b087a6"
              : accentColor,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            ...gridSx,
            backgroundColor: accentColor,
            backgroundImage: accentBackgroundImage,
          }}
        >
          <Box />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              lineHeight: 1,
              px: 1,
              py: 0.25,
              borderRadius: 1,
              backgroundColor: "background.paper",
              border: "2px solid",
              borderColor: "rgba(255,255,255,0.7)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
              color: "text.primary",
              textAlign: "center",
            }}
          >
            {check.result}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "primary.contrastText",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 800,
              fontSize: "0.9rem",
              lineHeight: 1.1,
              textShadow:
                "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
            }}
          >
            {outcomeLabel}
          </Typography>
          <Box />
        </Box>

        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "center",
            gap: 0.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            vs
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700 }}
            color="text.primary"
          >
            {check.opposedToResult}
          </Typography>
          {check.opposedToSpeaker && (
            <Typography variant="caption" color="text.secondary">
              ({check.opposedToSpeaker})
            </Typography>
          )}
        </Box>
      </Box>

      {tied && onReroll && (
        <Typography
          component="button"
          variant="caption"
          onClick={onReroll}
          sx={{
            mt: 0.75,
            display: "block",
            width: "100%",
            cursor: "pointer",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            px: 1,
            py: 0.5,
            background: "none",
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            fontWeight: 700,
            textAlign: "center",
            "&:hover": { borderColor: "text.primary", color: "text.primary" },
          }}
        >
          Tied - Reroll
        </Typography>
      )}
      {tied && !onReroll && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.75, display: "block", textAlign: "center" }}
        >
          Tied - awaiting reroll
        </Typography>
      )}
    </>
  );
};
