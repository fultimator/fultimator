import React from "react";
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Tooltip,
} from "@mui/material";
import { useTranslate } from "../../../../translation/translate";
import { SLOT_TIERS } from "./slotTiers";

export default function SlotTierPicker({ value, onChange, isWeapon }) {
  const { t } = useTranslate();
  const tiers = isWeapon
    ? SLOT_TIERS
    : SLOT_TIERS.filter((tier) => !tier.weaponOnly);

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 0.5, display: "block" }}
      >
        {t("Slot Tier")}
      </Typography>
      <ToggleButtonGroup
        value={value ?? "alpha"}
        exclusive
        onChange={(_e, v) => {
          if (v) onChange(v);
        }}
        size="small"
        sx={{ flexWrap: "wrap" }}
      >
        {tiers.map((tier) => (
          <Tooltip
            key={tier.value}
            title={
              <Box>
                <div>
                  {tier.label} — {tier.slots} slot{tier.slots > 1 ? "s" : ""},
                  max {tier.mnemoMax} mnemosphere{tier.mnemoMax > 1 ? "s" : ""}
                </div>
                <div>{tier.costLabel}</div>
                {tier.weaponOnly && <div>{t("Weapon only")}</div>}
              </Box>
            }
          >
            <ToggleButton value={tier.value} sx={{ textTransform: "none" }}>
              <Box sx={{ textAlign: "center", lineHeight: 1.2 }}>
                <Typography variant="body2" fontWeight={600}>
                  {tier.label}
                </Typography>
                <Typography variant="caption" display="block">
                  {tier.slots}s / {tier.mnemoMax}m
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  {tier.costLabel}
                </Typography>
              </Box>
            </ToggleButton>
          </Tooltip>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
