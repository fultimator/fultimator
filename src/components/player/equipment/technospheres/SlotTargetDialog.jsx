import React, { useMemo } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useTranslate } from "../../../../translation/translate";
import { SLOT_TIERS } from "./slotTiers";
import { usedSlots } from "./sphereUtils";

function getEquipmentItems(player) {
  const eq0 = player?.equipment?.[0] ?? {};
  const items = [];
  for (const [bank, isWeapon] of [
    ["customWeapons", true],
    ["weapons", true],
    ["armor", false],
    ["shields", false],
    ["accessories", false],
  ]) {
    for (const item of eq0[bank] ?? []) {
      if (item.slots) items.push({ item, isWeapon });
    }
  }
  return items;
}

export default function SlotTargetDialog({
  open,
  onClose,
  sphere,
  player,
  onSlot,
}) {
  const { t } = useTranslate();
  const eq0 = player?.equipment?.[0] ?? {};
  const hoplospheres = eq0.hoplospheres ?? [];

  const candidates = useMemo(() => {
    return getEquipmentItems(player).map(({ item, isWeapon }) => {
      const tier =
        SLOT_TIERS.find((tr) => tr.value === (item.slots ?? "alpha")) ??
        SLOT_TIERS[0];
      const used = usedSlots(item.slotted ?? [], hoplospheres);
      const sphereSlots = sphere?.requiredSlots ?? 1;
      const hasRoom = used + sphereSlots <= tier.slots;
      const alreadySlotted = (item.slotted ?? []).includes(sphere?.id);
      return { item, isWeapon, tier, used, hasRoom, alreadySlotted };
    });
  }, [player, sphere, hoplospheres]);

  const available = candidates.filter((c) => c.hasRoom && !c.alreadySlotted);
  const unavailable = candidates.filter((c) => !c.hasRoom || c.alreadySlotted);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle variant="h3" sx={{ fontWeight: "bold", pr: 6 }}>
        {t("Slot Into Equipment")}
      </DialogTitle>
      <IconButton
        onClick={onClose}
        size="small"
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>
      <DialogContent dividers sx={{ pt: 1.5, pb: 1.5 }}>
        {candidates.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t("No equipment with slots found.")}
          </Typography>
        ) : (
          <List disablePadding>
            {available.map(({ item, tier, used }) => (
              <ListItemButton
                key={item.id ?? item.name}
                onClick={() => {
                  onSlot(item);
                  onClose();
                }}
                sx={{ borderRadius: 1, mb: 0.5, minHeight: 56, gap: 1 }}
              >
                <ListItemText
                  primary={item.name}
                  secondary={`${tier.label} · ${used}/${tier.slots} ${t("slots used")}`}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
                <Chip
                  label={`${used}/${tier.slots}`}
                  size="small"
                  color="primary"
                  sx={{ flexShrink: 0 }}
                />
              </ListItemButton>
            ))}
            {unavailable.length > 0 && available.length > 0 && (
              <Box
                sx={{
                  my: 1,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              />
            )}
            {unavailable.map(({ item, tier, used, alreadySlotted }) => (
              <ListItemButton
                key={item.id ?? item.name}
                disabled
                sx={{ borderRadius: 1, mb: 0.5, minHeight: 56, gap: 1 }}
              >
                <ListItemText
                  primary={item.name}
                  secondary={
                    alreadySlotted
                      ? t("Already slotted")
                      : `${t("Full")} · ${used}/${tier.slots} ${t("slots used")}`
                  }
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
                <Chip
                  label={alreadySlotted ? t("Slotted") : t("Full")}
                  size="small"
                  sx={{ flexShrink: 0 }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
      </DialogActions>
    </Dialog>
  );
}
