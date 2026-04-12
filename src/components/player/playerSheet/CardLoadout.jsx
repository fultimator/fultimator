import React, { useState, useEffect } from "react";
import { Box, Typography, ButtonBase, Tooltip } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import { useTranslate } from "../../../translation/translate";
import { useTheme } from "@mui/material/styles";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import {
  resolveEffectiveSlot,
  getActiveVehicle,
} from "../equipment/slots/equipmentSlots";
import {
  getSlotLocks,
  getEquippedModulesForSlot,
  getEquippedModuleForSlot,
  getEquippedSupportModules,
} from "../equipment/slots/loadoutSelectors";
import { useLoadoutStore } from "../../../store/playerLoadoutStore";
import SlotPickerDialog from "../equipment/slots/SlotPickerDialog";

const SLOT_LABEL_KEY = {
  mainHand: "MAIN",
  offHand: "OFF",
  armor: "ARM",
  accessory: "ACC",
};

function resolvedName(resolved, locked, t) {
  if (locked) return t("2-Handed");
  if (!resolved) return " - ";
  if (resolved.kind === "vehicleModule") {
    return resolved.module.customName || t(resolved.module.name);
  }
  const item = resolved.item;
  if ("accuracyCheck" in item && item.activeForm === "secondary") {
    return item.secondWeaponName || `${item.name} (Alt)`;
  }
  return item?.name ?? " - ";
}

export default function CardLoadout({
  player,
  setPlayer,
  isEditMode,
  isOwner,
  showHeader = true,
  showSideDivider = true,
  showSupportColumn = false,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const [pickerSlot, setPickerSlot] = useState(null);
  const [pickerOpenModuleOverride, setPickerOpenModuleOverride] = useState(false);

  const store = useLoadoutStore();
  useEffect(() => { store.init(setPlayer); }, [setPlayer]);

  const activeVehicle = getActiveVehicle(player);
  const { mainHandLocked, offHandLocked } = getSlotLocks(player);
  const supportModules = getEquippedSupportModules(player);
  const hasSupportColumn = showSupportColumn && supportModules.length > 0;

  const mainHandResolved = resolveEffectiveSlot(player, "mainHand");
  const offHandResolved  = resolveEffectiveSlot(player, "offHand");

  const SLOTS = [
    { key: "mainHand",  resolved: mainHandResolved,                        locked: mainHandLocked },
    { key: "offHand",   resolved: offHandResolved,                         locked: offHandLocked },
    { key: "armor",     resolved: resolveEffectiveSlot(player, "armor"),    locked: false },
    { key: "accessory", resolved: resolveEffectiveSlot(player, "accessory"),locked: false },
  ];

  const handleSlotClick = (slot) => {
    const hasModule =
      ["mainHand", "offHand", "armor"].includes(slot) &&
      Boolean(getEquippedModuleForSlot(player, slot));
    setPickerOpenModuleOverride(hasModule);
    setPickerSlot(slot);
  };

  const primary = theme.palette.primary.main;
  const divider = theme.palette.divider;
  const supportLabel = t("pilot_module_support");

  const renderSlotRow = ({ key, resolved, locked }) => {
    const isEmpty = !locked && !resolved;
    const isVehicle = resolved?.kind === "vehicleModule";
    const hasModule = !locked && !!getEquippedModuleForSlot(player, key);
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
          height: "100%",
        }}
      >
        {/* Slot abbreviation */}
        <Typography
          sx={{
            fontFamily: "Antonio",
            fontSize: { xs: "0.64rem", sm: "0.74rem", lg: "0.78rem" },
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: theme.palette.text.secondary,
            whiteSpace: "nowrap",
            flexShrink: 0,
            width: { xs: "26px", sm: "34px", lg: "52px" },
          }}
        >
          {t(SLOT_LABEL_KEY[key])}
        </Typography>

        {/* Lock / vehicle icon */}
        {locked && (
          <LockIcon sx={{ fontSize: { xs: "0.5rem", sm: "0.6rem" }, color: "text.disabled", flexShrink: 0 }} />
        )}
        {isVehicle && !locked && (
          <PrecisionManufacturingIcon sx={{ fontSize: { xs: "0.5rem", sm: "0.6rem" }, color: "success.main", flexShrink: 0 }} />
        )}
        {hasModule && !isVehicle && !isEmpty && !locked && (
          <PrecisionManufacturingIcon sx={{ fontSize: { xs: "0.5rem", sm: "0.6rem" }, color: "success.light", opacity: 0.6, flexShrink: 0 }} />
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
        onClick={() => handleSlotClick(key)}
        sx={{
          display: "flex",
          textAlign: "left",
          width: "100%",
          height: "100%",
          flex: 1,
          borderRadius: "2px",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        {inner}
      </ButtonBase>
    ) : (
      <Box key={key} sx={{ flex: 1, width: "100%", height: "100%", display: "flex" }}>{inner}</Box>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        borderLeft: showSideDivider ? `1px solid ${divider}` : "none",
        pl: showSideDivider ? "6px" : 0,
        ml: showSideDivider ? "4px" : 0,
        height: "100%",
        width: "100%",
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      {showHeader && (
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
      )}

      {/* Slot rows (+ optional support column) */}
      {hasSupportColumn ? (
        <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(84px, 42%)", columnGap: "6px", alignItems: "stretch", flex: 1, width: "100%", height: "100%" }}>
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
            {SLOTS.map(renderSlotRow)}
          </Box>
          <Box sx={{ minWidth: 0, borderLeft: `0.5px solid ${divider}`, pl: "6px" }}>
            <Typography
              sx={{
                fontFamily: "Antonio",
                fontSize: { xs: "0.58rem", sm: "0.66rem" },
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: theme.palette.text.secondary,
                mb: "2px",
                lineHeight: 1.1,
              }}
            >
              {supportLabel}
            </Typography>
            {supportModules.map((module, idx) => {
              const displayName = module.customName || t(module.name);
              return (
                <Tooltip key={`${module.originalIndex}-${module.name}-${idx}`} title={displayName || ""} placement="top" enterDelay={600}>
                  <Typography
                    noWrap
                    sx={{
                      fontFamily: "Antonio",
                      fontSize: { xs: "0.66rem", sm: "0.74rem" },
                      fontWeight: module.enabled ? 600 : 400,
                      color: module.enabled ? theme.palette.text.primary : theme.palette.text.disabled,
                      fontStyle: module.enabled ? "normal" : "italic",
                      lineHeight: 1.2,
                      py: "1px",
                    }}
                  >
                    {displayName || " - "}
                  </Typography>
                </Tooltip>
              );
            })}
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1, width: "100%" }}>
          {SLOTS.map(renderSlotRow)}
        </Box>
      )}

      {/* Slot picker dialog : with full module override wiring */}
      {pickerSlot && (
        <SlotPickerDialog
          open
          onClose={() => { setPickerSlot(null); setPickerOpenModuleOverride(false); }}
          slot={pickerSlot}
          player={player}
          setPlayer={setPlayer}
          vehicleModules={
            activeVehicle && ["mainHand", "offHand", "armor"].includes(pickerSlot)
              ? getEquippedModulesForSlot(player, pickerSlot)
              : []
          }
          onSelectModule={(idx) => store.selectModule(pickerSlot, idx)}
          onDisableModule={() => store.disableModule(pickerSlot)}
          openModuleOverride={pickerOpenModuleOverride}
          onClearOtherHandModule={
            activeVehicle && ["mainHand", "offHand"].includes(pickerSlot)
              ? () => store.disableModule(pickerSlot === "mainHand" ? "offHand" : "mainHand")
              : undefined
          }
        />
      )}
    </Box>
  );
}
