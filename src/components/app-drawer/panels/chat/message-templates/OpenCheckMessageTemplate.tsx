import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { GiDiceEightFacesEight } from "react-icons/gi";
import { MdTune } from "react-icons/md";
import type { CheckResult } from "../types";
import Diamond from "../../../../Diamond";
import { CheckOpenIcon } from "../../../../icons";
import {
  ATTR_LABEL,
  STUDY_TIERS,
  dieCellSx,
  gridSx,
} from "./openCheckTemplate.constants";

interface OpenCheckMessageTemplateProps {
  check: CheckResult;
  onOppose?: () => void;
}

export const OpenCheckMessageTemplate: React.FC<
  OpenCheckMessageTemplateProps
> = ({ check, onOppose }) => {
  const theme = useTheme();
  const originAction =
    typeof check.additionalData?.originAction === "string"
      ? check.additionalData.originAction
      : undefined;
  const isStudy = originAction === "study";

  const accentColor = check.critical
    ? "#ffcc56"
    : check.fumble
      ? "#b087a6"
      : `primary.main`;
  const accentBackgroundImage = check.critical
    ? "linear-gradient(to bottom, #f7c754, #d17f10)"
    : check.fumble
      ? "linear-gradient(to bottom, #b087a6, #15031e)"
      : `linear-gradient(to bottom, ${alpha(theme.palette.primary.light, 0.72)}, ${alpha(theme.palette.primary.dark, 0.8)})`;

  const studyTier = isStudy
    ? STUDY_TIERS.find((t) => check.result >= t.threshold)
    : null;

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
          <CheckOpenIcon size="32px" />
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
          Open Check
          {isStudy && (
            <>
              {" "}
              <Diamond color="inherit" /> Study
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
              : "primary.main",
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
            {check.critical ? "Critical" : check.fumble ? "Fumble!" : "Result"}
          </Typography>
          <Box />
        </Box>

        {isStudy && (
          <Box
            sx={{
              px: 1,
              py: 0.75,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            {STUDY_TIERS.map((tier) => {
              const reached = check.result >= tier.threshold;
              const isActive = studyTier?.threshold === tier.threshold;
              return (
                <Box
                  key={tier.threshold}
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    py: 0.25,
                    opacity: reached ? 1 : 0.35,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: isActive ? 800 : 600,
                      minWidth: 24,
                      color: isActive ? "text.primary" : "text.secondary",
                    }}
                  >
                    {tier.threshold}+
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? "text.primary" : "text.secondary",
                      flex: 1,
                      textAlign: "right",
                    }}
                  >
                    {tier.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {onOppose && (
        <Typography
          component="button"
          variant="caption"
          onClick={onOppose}
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
          Oppose
        </Typography>
      )}
    </>
  );
};
