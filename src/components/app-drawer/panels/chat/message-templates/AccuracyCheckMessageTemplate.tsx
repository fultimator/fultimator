import React, { useState } from "react";
import { Box, Collapse, Divider, IconButton, Typography } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { MdExpandMore } from "react-icons/md";
import type { AccuracyCheckResult } from "../types";
import { TypeIcon } from "../../../../types";
import Diamond from "../../../../Diamond";
import { BreakdownRow, DiceRow, TagRow } from "./primitives";
import { ATTR_LABEL, normalizeDamageType } from "./primitives-utils";

const gridSx = {
  px: 0.75,
  py: 0.5,
  display: "grid",
  gridTemplateColumns: "24px max-content max-content 24px",
  justifyContent: "center",
  alignItems: "center",
  gap: 1,
};

function formatCategory(category: string): string {
  const clean = category
    .replace(/^weapon_category_/, "")
    .replace(/_/g, " ")
    .trim();
  if (!clean) return "Unknown";
  return clean.replace(/\b\w/g, (m) => m.toUpperCase());
}

function formatRange(range: string): string {
  if (range === "ranged" || range === "weapon_range_ranged") return "Ranged";
  return "Melee";
}

interface AccuracyCheckMessageTemplateProps {
  check: AccuracyCheckResult;
}

export const AccuracyCheckMessageTemplate: React.FC<
  AccuracyCheckMessageTemplateProps
> = ({ check }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const accentColor = check.critical
    ? "success.main"
    : check.fumble
      ? "error.main"
      : "primary.main";
  const accentBackgroundImage = check.critical
    ? "linear-gradient(to bottom, #f7c754, #d17f10)"
    : check.fumble
      ? "linear-gradient(to bottom, #b087a6, #15031e)"
      : `linear-gradient(to bottom, ${alpha(theme.palette.primary.light, 0.95)}, ${alpha(theme.palette.primary.dark, 0.95)})`;

  const normalizedDamageType = normalizeDamageType(check.intent.damageType);
  const lowRoll =
    check.primary.result < check.secondary.result
      ? check.primary.result
      : check.secondary.result;
  const tags: string[] = [];
  if (check.intent.isWeaponModule) tags.push("Weapon Module");
  if (check.intent.category) tags.push(formatCategory(check.intent.category));
  if (check.intent.range) tags.push(formatRange(check.intent.range));
  if (check.intent.hands === 2) tags.push("Two-handed");
  else if (check.intent.hands === 1) tags.push("One-handed");
  if (check.intent.hrZero) tags.push("HR0");
  if (check.critical) tags.push("Critical");
  if (check.fumble) tags.push("Fumble");

  return (
    <>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}
      >
        Accuracy Check <Diamond color="inherit" /> {check.intent.weaponName}
      </Typography>
      <TagRow tags={tags} />

      <DiceRow dice={[check.primary, check.secondary]} />

      <Box
        sx={{
          mt: 0.5,
          borderRadius: 1.5,
          border: check.critical
            ? "2px solid"
            : check.fumble
              ? "2px solid"
              : "1px solid",
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
            position: "relative",
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
            {check.accuracyTotal}
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
            {check.critical
              ? "Critical"
              : check.fumble
                ? "Fumble!"
                : `Accuracy vs ${(check.intent.defense ?? "def").toUpperCase()}`}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setOpen((v) => !v)}
            sx={{
              position: "absolute",
              right: 6,
              top: "50%",
              transform: open
                ? "translateY(-50%) rotate(180deg)"
                : "translateY(-50%) rotate(0deg)",
              p: 0,
              color: "primary.contrastText",
              transition: "transform 0.2s",
            }}
          >
            <MdExpandMore size={18} />
          </IconButton>
        </Box>

        <Divider />

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
              border: "2px solid",
              borderColor: "rgba(255,255,255,0.7)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
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
            <BreakdownRow
              label="HR (High Roll)"
              value={check.intent.hrZero ? "HR0" : check.damageHighRoll}
            />
            <BreakdownRow
              label={`Base Damage · ${check.intent.weaponName}`}
              value={check.intent.baseDamage}
              signed
            />
            {(check.intent.damageSituationalBonus ?? 0) !== 0 && (
              <BreakdownRow
                label="Situational Bonus"
                value={check.intent.damageSituationalBonus ?? 0}
                signed
              />
            )}
            <Divider sx={{ my: 0.25 }} />
            <BreakdownRow label="Damage Total" value={check.damage} bold />
          </Box>
        </Collapse>
      </Box>
    </>
  );
};
