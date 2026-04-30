import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import { useTranslate } from "../../../../translation/translate";
import { SLOT_TIERS } from "./slotTiers";
import SpherePickerDialog from "./SpherePickerDialog";
import { usedSlots } from "./sphereUtils";

export default function SlotEditor({
  item,
  onChange,
  player,
  isWeapon,
  onAddToBank,
}) {
  const { t } = useTranslate();
  const [pickerOpen, setPickerOpen] = useState(false);

  const eq0 = player?.equipment?.[0] ?? {};
  const mnemospheres = eq0.mnemospheres ?? [];
  const hoplospheres = eq0.hoplospheres ?? [];
  const slotted = item?.slotted ?? [];

  const tier =
    SLOT_TIERS.find((tr) => tr.value === (item?.slots ?? "alpha")) ??
    SLOT_TIERS[0];
  const used = usedSlots(slotted, hoplospheres);

  const handleAdd = (sphere) => {
    const newSlotted = [...slotted, sphere.id];
    onChange({ ...item, slotted: newSlotted });
  };

  const handleRemove = (index) => {
    const newSlotted = slotted.filter((_, i) => i !== index);
    onChange({ ...item, slotted: newSlotted });
  };

  const canAddMore = used < tier.slots;

  return (
    <Box sx={{ mt: 1 }}>
      <Divider sx={{ mb: 1 }} />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Typography variant="caption" fontWeight={600}>
          {t("Slots")}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {used}/{tier.slots} {t("used")}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
        {slotted.map((id, idx) => {
          const mnemo = mnemospheres.find((m) => m.id === id);
          const hoplo = hoplospheres.find((h) => h.id === id);
          const label = mnemo
            ? `${mnemo.class} Lv.${mnemo.lvl}`
            : hoplo
              ? hoplo.name
              : id;
          const tooltipTitle = mnemo
            ? `${mnemo.class} Lv.${mnemo.lvl} — ${500 + mnemo.lvl * 300}z`
            : hoplo
              ? hoplo.description
              : "";

          return (
            <Tooltip key={idx} title={tooltipTitle}>
              <Chip
                label={label}
                size="small"
                color={mnemo ? "primary" : "default"}
                onDelete={() => handleRemove(idx)}
                deleteIcon={<Close sx={{ fontSize: "14px !important" }} />}
              />
            </Tooltip>
          );
        })}

        {canAddMore && (
          <Tooltip title={t("Add sphere to slot")}>
            <IconButton
              size="small"
              onClick={() => setPickerOpen(true)}
              sx={{
                border: "1px dashed",
                borderRadius: 1,
                width: 28,
                height: 28,
              }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {!canAddMore && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<Add />}
          onClick={() => setPickerOpen(true)}
          disabled
        >
          {t("Slots full")}
        </Button>
      )}

      <SpherePickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        item={item}
        player={player}
        isWeapon={isWeapon}
        onAdd={handleAdd}
        onAddToBank={onAddToBank}
      />
    </Box>
  );
}
