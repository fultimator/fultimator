import React, { useState } from "react";
import {
  Box,
  Collapse,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { GiDiceEightFacesEight } from "react-icons/gi";
import { MdExpandMore } from "react-icons/md";
import type { AccuracyCheckResult } from "../types";
import { TypeIcon } from "../../../../types";

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

const gridSx = {
  px: 1,
  py: 0.65,
  display: "grid",
  gridTemplateColumns: "24px max-content max-content 24px",
  justifyContent: "center",
  alignItems: "center",
  gap: 1,
};

interface AccuracyCheckMessageTemplateProps {
  check: AccuracyCheckResult;
}

export const AccuracyCheckMessageTemplate: React.FC<
  AccuracyCheckMessageTemplateProps
> = ({ check }) => {
  const [open, setOpen] = useState(false);

  const accentColor = check.critical
    ? "success.main"
    : check.fumble
      ? "error.main"
      : "primary.main";

  const rawDamageType = String(check.intent.damageType || "physical")
    .toLowerCase()
    .trim();
  const normalizedDamageType =
    rawDamageType === "air"
      ? "wind"
      : rawDamageType === "lightning"
        ? "bolt"
        : [
              "physical",
              "wind",
              "bolt",
              "dark",
              "earth",
              "fire",
              "ice",
              "light",
              "poison",
            ].includes(rawDamageType)
          ? rawDamageType
          : "physical";

  const lowRoll =
    check.primary.result < check.secondary.result
      ? check.primary.result
      : check.secondary.result;

  return (
    <>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}
      >
        Accuracy Check · {check.intent.weaponName}
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
      </Stack>

      <Box
        sx={{
          mt: 0.75,
          borderRadius: 1.5,
          border: "1px solid",
          borderColor: accentColor,
          overflow: "hidden",
        }}
      >
        {/* Row 1: accuracy */}
        <Box sx={{ ...gridSx, backgroundColor: accentColor }}>
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
              color: "text.primary",
              textAlign: "center",
            }}
          >
            {check.accuracyTotal}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "primary.contrastText",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 700,
            }}
          >
            {check.critical
              ? "Critical"
              : check.fumble
                ? "Fumble!"
                : "Accuracy"}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setOpen((v) => !v)}
            sx={{
              p: 0,
              color: "primary.contrastText",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          >
            <MdExpandMore size={18} />
          </IconButton>
        </Box>

        <Divider />

        {/* Row 2: damage */}
        <Box sx={{ ...gridSx, backgroundColor: "action.hover" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "& svg": { width: 20, height: 20 },
            }}
          >
            <TypeIcon type={normalizedDamageType} disabled={false} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              lineHeight: 1,
              px: 1,
              py: 0.25,
              borderRadius: 1,
              backgroundColor: "background.paper",
              color: "text.primary",
              textAlign: "center",
            }}
          >
            {check.damage}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 700,
            }}
          >
            {check.intent.damageType}
          </Typography>
          <Box />
        </Box>

        {/* Breakdown accordion */}
        <Collapse in={open}>
          <Divider />
          <Box
            sx={{
              px: 1.5,
              py: 1,
              backgroundColor: "background.default",
              display: "flex",
              flexDirection: "column",
              gap: 0.4,
            }}
          >
            <BreakdownRow
              label={`HR · ${ATTR_LABEL[check.primary.result >= check.secondary.result ? check.primary.attribute : check.secondary.attribute]} d${check.primary.result >= check.secondary.result ? check.primary.die : check.secondary.die}`}
              value={check.highRoll}
            />
            <BreakdownRow
              label={`LR · ${ATTR_LABEL[check.primary.result < check.secondary.result ? check.primary.attribute : check.secondary.attribute]} d${check.primary.result < check.secondary.result ? check.primary.die : check.secondary.die}`}
              value={lowRoll}
            />
            {check.intent.modifiers.map((mod, i) => (
              <BreakdownRow
                key={i}
                label={mod.label}
                value={mod.value}
                signed
              />
            ))}
            <Divider sx={{ my: 0.25 }} />
            <BreakdownRow
              label="Accuracy Total"
              value={check.accuracyTotal}
              bold
            />
            <Divider sx={{ my: 0.25 }} />
            <BreakdownRow label="HR (High Roll)" value={check.highRoll} />
            <BreakdownRow
              label={`Base Damage · ${check.intent.weaponName}`}
              value={check.intent.baseDamage}
              signed
            />
            <Divider sx={{ my: 0.25 }} />
            <BreakdownRow label="Damage Total" value={check.damage} bold />
          </Box>
        </Collapse>
      </Box>
    </>
  );
};

function BreakdownRow({
  label,
  value,
  signed,
  bold,
}: {
  label: string;
  value: number;
  signed?: boolean;
  bold?: boolean;
}) {
  const display = signed && value > 0 ? `+${value}` : String(value);
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 1,
      }}
    >
      <Typography
        variant="body2"
        color={bold ? "text.primary" : "text.secondary"}
        sx={{ fontWeight: bold ? 700 : 400 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: bold ? 700 : 400,
          color: bold ? "text.primary" : "text.secondary",
        }}
      >
        {display}
      </Typography>
    </Box>
  );
}
