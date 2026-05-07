import React from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import type { CheckResult } from "../types";

const ATTR_LABEL: Record<string, string> = {
  dex: "DEX",
  ins: "INS",
  mig: "MIG",
  wlp: "WLP",
};

interface CheckMessageTemplateProps {
  check: CheckResult;
}

export const CheckMessageTemplate: React.FC<CheckMessageTemplateProps> = ({
  check,
}) => {
  return (
    <>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}
      >
        {ATTR_LABEL[check.primary.attribute]} +{" "}
        {ATTR_LABEL[check.secondary.attribute]}
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ mt: 0.75, alignItems: "center", justifyContent: "center" }}
      >
        {[check.primary, check.secondary].map((die, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              px: 1.25,
              py: 0.75,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: i === 0 ? "primary.main" : "divider",
              backgroundColor: "background.default",
              minWidth: 52,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              {ATTR_LABEL[die.attribute]} d{die.die}
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              {die.result}
            </Typography>
          </Box>
        ))}

        {check.modifierTotal !== 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 700 }}
          >
            {check.modifierTotal > 0
              ? `+${check.modifierTotal}`
              : check.modifierTotal}
          </Typography>
        )}
      </Stack>

      {(check.critical || check.fumble) && (
        <Box sx={{ mt: 0.75, display: "flex", justifyContent: "center" }}>
          <Chip
            label={check.critical ? "Critical" : "Fumble"}
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
          backgroundColor: check.critical
            ? "success.main"
            : check.fumble
              ? "error.main"
              : "primary.main",
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
      </Box>
    </>
  );
};
