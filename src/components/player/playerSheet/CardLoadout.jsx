import React, { useState } from "react";
import { Box, Typography, ButtonBase, Tooltip } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import { useTranslate } from "../../../translation/translate";
import { useTheme } from "@mui/material/styles";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import {
  resolveEffectiveSlot,
  isTwoHandedEquipped,
  getActiveVehicle,
} from "../equipment/slots/equipmentSlots";
import SlotPickerDialog from "../equipment/slots/SlotPickerDialog";

const SLOT_LABEL = (t) => ({
  mainHand:  t("Main Hand"),
  offHand:   t("Off Hand"),
  armor:     t("Armor"),
  accessory: t("Accessory"),
});

function resolvedName(resolved, locked, t) {
  if (locked) return t("2-Handed");
  if (!resolved) return "—";
  if (resolved.kind === "vehicleModule") {
    return resolved.module.customName || t(resolved.module.name);
  }
  const item = resolved.item;
  if ("accuracyCheck" in item && item.activeForm === "secondary") {
    return item.secondWeaponName || `${item.name} (Alt)`;
  }
  return item?.name ?? "—";
}

export default function CardLoadout({ player, setPlayer, isEditMode, isOwner }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const [pickerSlot, setPickerSlot] = useState(null);

  const activeVehicle = getActiveVehicle(player);

  const mainHandResolved = resolveEffectiveSlot(player, "mainHand");
  const offHandResolved  = resolveEffectiveSlot(player, "offHand");

  const offHandLocked = (() => {
    if (mainHandResolved?.kind === "vehicleModule") {
      return mainHandResolved.module.cumbersome;
    }
    return isTwoHandedEquipped(player);
  })();

  const SLOTS = [
    { key: "mainHand",  resolved: mainHandResolved,                        locked: false },
    { key: "offHand",   resolved: offHandResolved,                         locked: offHandLocked },
    { key: "armor",     resolved: resolveEffectiveSlot(player, "armor"),    locked: false },
    { key: "accessory", resolved: resolveEffectiveSlot(player, "accessory"),locked: false },
  ];

  const primary = theme.palette.primary.main;
  const divider = theme.palette.divider;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        borderLeft: `1px solid ${divider}`,
        pl: "6px",
        ml: "4px",
        height: "100%",
        width: "100%",
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: primary,
          px: "4px",
          py: "1px",
          mb: "3px",
          borderRadius: "2px",
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontFamily: "Antonio",
            fontSize: "1rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            whiteSpace: "nowrap",
          }}
        >
          {t("Loadout")}
        </Typography>
      </Box>

      {/* Slot rows */}
      {SLOTS.map(({ key, resolved, locked }) => {
        const isEmpty = !locked && !resolved;
        const isVehicle = resolved?.kind === "vehicleModule";
        const name = resolvedName(resolved, locked, t);
        const clickable = (isEditMode || isOwner) && !locked;

        const inner = (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "1px",
              py: "1px",
              minWidth: 0,
              width: "100%",
            }}
          >
            {/* Slot abbreviation */}
            <Typography
              sx={{
                fontFamily: "Antonio",
                fontSize: { xs: "0.6rem", sm: "0.68rem" },
                fontWeight: 700,
                textTransform: "uppercase",
                color: theme.palette.text.secondary,
                whiteSpace: "nowrap",
                flexShrink: 0,
                width: { xs: "35px", sm: "50px" },
              }}
            >
              {SLOT_LABEL(t)[key]}
            </Typography>

            {/* Lock / vehicle icon */}
            {locked && (
              <LockIcon sx={{ fontSize: { xs: "0.5rem", sm: "0.6rem" }, color: "text.disabled", flexShrink: 0 }} />
            )}
            {isVehicle && !locked && (
              <PrecisionManufacturingIcon sx={{ fontSize: { xs: "0.5rem", sm: "0.6rem" }, color: "success.main", flexShrink: 0 }} />
            )}

            {/* Item name */}
            <Tooltip title={isEmpty || locked ? "" : name} placement="top" enterDelay={600}>
              <Typography
                noWrap
                sx={{
                  fontFamily: "Antonio",
                  fontSize: { xs: "0.75rem", sm: "0.82rem" },
                  fontWeight: isEmpty || locked ? 400 : 600,
                  color: locked
                    ? theme.palette.text.disabled
                    : isEmpty
                    ? theme.palette.text.disabled
                    : isVehicle
                    ? theme.palette.success.main
                    : theme.palette.text.primary,
                  fontStyle: isEmpty || locked ? "italic" : "normal",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  flex: 1,
                  minWidth: 0,
                  lineHeight: 1.3,
                }}
              >
                {name}
              </Typography>
            </Tooltip>
          </Box>
        );

        return clickable ? (
          <ButtonBase
            key={key}
            onClick={() => setPickerSlot(key)}
            sx={{
              display: "block",
              textAlign: "left",
              width: "100%",
              borderRadius: "2px",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            {inner}
          </ButtonBase>
        ) : (
          <Box key={key}>{inner}</Box>
        );
      })}

      {/* Slot picker dialog */}
      {pickerSlot && (
        <SlotPickerDialog
          open
          onClose={() => setPickerSlot(null)}
          slot={pickerSlot}
          player={player}
          setPlayer={setPlayer}
        />
      )}
    </Box>
  );
}
