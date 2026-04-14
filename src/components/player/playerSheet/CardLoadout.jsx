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
  const [pickerSlot, setPickerSlot] = useState(null);
  const [pickerOpenModuleOverride, setPickerOpenModuleOverride] = useState(false);

  const store = useLoadoutStore();
  useEffect(() => { store.init(setPlayer); }, [setPlayer]);

  const activeVehicle = getActiveVehicle(player);
  const { mainHandLocked, offHandLocked } = getSlotLocks(player);
  const supportModules = getEquippedSupportModules(player).filter(m => m.enabled);
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
          gap: 0.45,
          px: 0.65,
          py: 0.45,
          minWidth: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {/* Slot abbreviation */}
        <Typography
          sx={{
            fontFamily: "Antonio",
            fontSize: { xs: "0.66rem", sm: "0.74rem", lg: "0.78rem" },
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: theme.palette.text.secondary,
            whiteSpace: "nowrap",
            flexShrink: 0,
            width: { xs: "28px", sm: "34px", lg: "52px" },
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
              fontSize: { xs: "0.8rem", sm: "0.88rem" },
              fontWeight: isEmpty || locked ? 500 : 700,
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
              lineHeight: 1.2,
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
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        {inner}
      </ButtonBase>
    ) : (
      <Box
        key={key}
        sx={{
          flex: 1,
          width: "100%",
          height: "100%",
          display: "flex",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.015)",
        }}
      >
        {inner}
      </Box>
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
              fontSize: { xs: "0.96rem", sm: "1rem" },
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
            }}
          >
            {t("Loadout")}
          </Typography>
        </Box>
      )}

      {/* Slot rows (+ optional support column) */}
      {hasSupportColumn ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr) minmax(88px, 38%)",
              sm: "minmax(0, 1fr) minmax(96px, 40%)",
              md: "minmax(0, 1fr) minmax(110px, 36%)",
            },
            "@media (max-width:430px)": {
              gridTemplateColumns: "1fr",
            },
            columnGap: 0.65,
            rowGap: 0.55,
            alignItems: "start",
            flex: 1,
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.45, width: "100%" }}>
            {SLOTS.map(renderSlotRow)}
          </Box>
          <Box
            sx={{
              minWidth: 0,
              borderLeft: `1px solid ${divider}`,
              pl: 0.65,
              pt: 0,
              "@media (max-width:430px)": {
                borderLeft: "none",
                borderTop: `1px solid ${divider}`,
                pl: 0,
                pt: 0.5,
              },
            }}
          >
            <Typography
              sx={{
                fontFamily: "Antonio",
                fontSize: { xs: "0.66rem", sm: "0.72rem" },
                fontWeight: 800,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: theme.palette.text.secondary,
                mb: 0.3,
                lineHeight: 1.1,
              }}
            >
              {supportLabel}
            </Typography>
            {supportModules.map((module, idx) => {
              const displayName = module.customName || t(module.name);
              return (
                <Tooltip key={`${module.originalIndex}-${module.name}-${idx}`} title={displayName || ""} placement="top" enterDelay={600}>
                  <Box
                    sx={{
                      px: 0.55,
                      py: 0.35,
                      mb: 0.35,
                      borderRadius: 0.8,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.015)",
                    }}
                  >
                    <Typography
                      noWrap
                      sx={{
                        fontFamily: "Antonio",
                        fontSize: { xs: "0.74rem", sm: "0.8rem" },
                        fontWeight: module.enabled ? 700 : 500,
                        color: module.enabled ? theme.palette.text.primary : theme.palette.text.disabled,
                        fontStyle: module.enabled ? "normal" : "italic",
                        lineHeight: 1.15,
                      }}
                    >
                      {displayName || " - "}
                    </Typography>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.45, flex: 1, width: "100%" }}>
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
