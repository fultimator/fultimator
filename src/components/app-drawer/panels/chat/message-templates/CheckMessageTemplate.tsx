import React from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { GiDiceEightFacesEight } from "react-icons/gi";
import { MdTune } from "react-icons/md";
import type { CheckResult } from "../types";

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
  gap: 0.5,
  px: 1,
  pt: 0.5,
  pb: 0.75,
  borderRadius: 1.5,
  border: "1px solid",
  backgroundColor: "background.default",
  minWidth: 56,
};

interface CheckMessageTemplateProps {
  check: CheckResult;
}

export const CheckMessageTemplate: React.FC<CheckMessageTemplateProps> = ({
  check,
}) => {
  const accentColor = check.critical
    ? "success.main"
    : check.fumble
      ? "error.main"
      : "primary.main";

  return (
    <>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}
      >
        Attribute Check
        {check.intent.difficulty != null && (
          <> · DL {check.intent.difficulty}</>
        )}
      </Typography>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          mt: 0.75,
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
              borderColor: i === 0 ? "primary.main" : "divider",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              {ATTR_LABEL[die.attribute]} d{die.die}
            </Typography>
            <Box sx={{ lineHeight: 0 }}>
              <GiDiceEightFacesEight size={32} />
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {die.result}
            </Typography>
          </Box>
        ))}

        {check.modifierTotal !== 0 && (
          <Box sx={{ ...dieCellSx, borderColor: "divider" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              Mod
            </Typography>
            <Box sx={{ lineHeight: 0 }}>
              <MdTune size={32} />
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {check.modifierTotal > 0
                ? `+${check.modifierTotal}`
                : check.modifierTotal}
            </Typography>
          </Box>
        )}
      </Stack>

      {(check.critical || check.fumble) && (
        <Box sx={{ mt: 0.75, display: "flex", justifyContent: "center" }}>
          <Chip
            label={check.critical ? "Critical Hit!" : "Fumble!"}
            size="small"
            color={check.critical ? "success" : "error"}
            sx={{ fontWeight: 700, fontSize: "0.7rem" }}
          />
        </Box>
      )}

      <Box
        sx={{
          mt: 1,
          px: 1,
          py: 0.65,
          borderRadius: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          backgroundColor: accentColor,
          color: "primary.contrastText",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            lineHeight: 1,
            px: 1,
            py: 0.4,
            borderRadius: 1,
            backgroundColor: "background.paper",
            color: "text.primary",
            minWidth: 56,
            textAlign: "center",
          }}
        >
          {check.result}
        </Typography>

        {check.passed != null && (
          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
              lineHeight: 1,
              color: "primary.contrastText",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {check.passed ? "Success" : "Failure"}
          </Typography>
        )}
      </Box>
    </>
  );
};
