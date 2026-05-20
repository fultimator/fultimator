import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Radio,
  Typography,
  Box,
  Divider,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import LockIcon from "@mui/icons-material/Lock";
import CloseIcon from "@mui/icons-material/Close";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslate } from "../../../../translation/translate";
import { resolveEffectiveSlot } from "./equipmentSlots";
import {
  equipItemToSlot,
  clearSlotAction,
  getEquipConflicts,
} from "./loadoutActions";
import attributes from "../../../../libs/attributes";

function moduleStatLine(module, t) {
  if (!module) return "-";
  if (module.type === "pilot_module_weapon") {
    if (module.isShield)
      return `DEF +${module.def ?? 0}  MDEF +${module.mdef ?? 0}`;
    const a1Key = module.accuracy?.attr1;
    const a2Key = module.accuracy?.attr2;
    const a1 = attributes[a1Key]?.shortcaps ?? a1Key ?? "";
    const a2 = attributes[a2Key]?.shortcaps ?? a2Key ?? "";
    const hands = module.cumbersome ? "2H" : "1H";
    const parts = [];
    if (a1 && a2) {
      parts.push(`${a1}+${a2}`);
    } else if (module.category) {
      parts.push(t(module.category));
    }
    const damageType = module.damage?.type;
    parts.push(`${module.damage?.value ?? "?"} ${t(damageType ?? "")}`.trim());
    if (module.range) parts.push(t(module.range));
    parts.push(hands);
    return parts.join(" / ");
  }
  if (module.type === "pilot_module_armor") {
    return `DEF +${module.def ?? 0}  MDEF +${module.mdef ?? 0}`;
  }
  if (module.description) return t(module.description).slice(0, 40);
  if (module.category) return t(module.category);
  return "-";
}

// Customizations that make a custom weapon martial
const MARTIAL_CUSTOMIZATIONS = [
  "weapon_customization_quick",
  "weapon_customization_magicdefenseboost",
  "weapon_customization_powerful",
];

const resolveDef = (item) => item.def || 0;
const resolveMdef = (item) => item.mdef || 0;

/**
 * slot: 'mainHand' | 'offHand' | 'armor' | 'accessory'
 * open, onClose, player, setPlayer
 * vehicleModules - modules available for this slot when a vehicle is active (pass [] when none)
 * onSelectModule(originalIndex) - activate a vehicle module for this slot
 * onDisableModule() - disable the active vehicle module for this slot
 * openModuleOverride - start with the module override view open (when slot already has an active module)
 * onClearOtherHandModule - called when an item is selected and the other hand has an active module
 */
export default function SlotPickerDialog({
  open,
  onClose,
  slot,
  player,
  setPlayer,
  vehicleModules = [],
  onSelectModule,
  onDisableModule,
  openModuleOverride = false,
  onClearOtherHandModule,
  onImportFromCompendium,
  onCreateNewItem,
}) {
  const { t } = useTranslate();
  const getModuleLabel = (module) =>
    module?.customName ||
    (module?.name ? t(module.name) : "") ||
    (module?.category ? t(module.category) : "") ||
    t("Unnamed");
  const [hoveredCandidate, setHoveredCandidate] = useState(null);
  const [pendingCandidate, setPendingCandidate] = useState(null);

  const [moduleOverrideOpen, setModuleOverrideOpen] = useState(false);
  const [hoveredModule, setHoveredModule] = useState(null);
  const [pendingModule, setPendingModule] = useState(null);
  const [createMenuAnchorEl, setCreateMenuAnchorEl] = useState(null);
  const wasOpenRef = useRef(false);

  const currentlyEquipped = useMemo(() => {
    if (!open || !player?.equippedSlots?.[slot]) return null;
    const currentRef = player.equippedSlots[slot];
    const inv = player?.equipment?.[0] || {};

    let candidates = [];
    if (slot === "mainHand") {
      candidates = [
        ...(inv.weapons ?? []).map((w, i) => ({
          label: w.name,
          source: "weapons",
          index: i,
          item: w,
        })),
        ...(inv.customWeapons ?? []).map((w, i) => ({
          label: w.name,
          source: "customWeapons",
          index: i,
          item: w,
        })),
      ];
    } else if (slot === "offHand") {
      candidates = [
        ...(inv.weapons ?? []).map((w, i) => ({
          label: w.name,
          source: "weapons",
          index: i,
          item: w,
        })),
        ...(inv.shields ?? []).map((s, i) => ({
          label: s.name,
          source: "shields",
          index: i,
          item: s,
        })),
      ];
    } else if (slot === "armor") {
      candidates = (inv.armor ?? []).map((a, i) => ({
        label: a.name,
        source: "armor",
        index: i,
        item: a,
      }));
    } else if (slot === "accessory") {
      candidates = (inv.accessories ?? []).map((a, i) => ({
        label: a.name,
        source: "accessories",
        index: i,
        item: a,
      }));
    }

    return (
      candidates.find((c) => {
        if (c.source !== currentRef?.source) return false;
        if (c.label !== currentRef?.name) return false;
        if (currentRef.index !== undefined) return c.index === currentRef.index;
        return true;
      }) ?? null
    );
  }, [open, slot, player]);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setModuleOverrideOpen(openModuleOverride);
      setHoveredModule(null);
      setPendingModule(null);
      if (currentlyEquipped) {
        setPendingCandidate(currentlyEquipped);
      } else {
        setPendingCandidate(null);
      }
    }
    wasOpenRef.current = open;
  }, [open, openModuleOverride, currentlyEquipped]);

  const hasDualShieldBearer =
    player?.classes?.some((cls) =>
      cls.skills?.some(
        (sk) => sk.specialSkill === "Dual Shieldbearer" && sk.currentLvl === 1,
      ),
    ) ?? false;

  const inv = player?.equipment?.[0] || {};

  const handleCreateForSlot = (kind) => {
    if (!onCreateNewItem) return;
    onCreateNewItem(kind, slot);
  };
  const defaultCreateKind =
    slot === "armor" ? "armor" : slot === "accessory" ? "accessory" : "weapon";
  const showCreateMenu = slot === "mainHand" || slot === "offHand";

  const mainHandHasTwoHanded = (() => {
    const res = resolveEffectiveSlot(player, "mainHand");
    if (res?.kind === "vehicleModule") return res.module.cumbersome ?? false;

    const ref = player?.equippedSlots?.mainHand;
    if (!ref) return false;
    if (ref.source === "customWeapons") return true; // always two-handed
    const w =
      ref.index !== undefined
        ? inv?.weapons?.[ref.index]
        : inv?.weapons?.find((x) => x.name === ref.name);
    return w?.hands === 2 || w?.isTwoHand || false;
  })();

  const otherHandHasWeaponModule = (() => {
    if (slot !== "mainHand" && slot !== "offHand") return false;
    const otherSlot = slot === "mainHand" ? "offHand" : "mainHand";
    const res = resolveEffectiveSlot(player, otherSlot);
    return res?.kind === "vehicleModule";
  })();

  // Martial proficiency check

  /**
   * Returns true if the player is proficient with the candidate item,
   * or if the item is not martial (so no restriction applies).
   */
  const checkMartialProficiency = (candidate) => {
    const { item, source } = candidate;
    if (source === "accessories") return true; // no martial concept

    let isMartial = false;
    let itemType = null; // 'meleeWeapon' | 'rangedWeapon' | 'shield' | 'armor'

    if (source === "customWeapons") {
      isMartial = (item.customizations ?? []).some((c) =>
        MARTIAL_CUSTOMIZATIONS.includes(c.name),
      );
      itemType =
        item.range === "weapon_range_ranged" ? "rangedWeapon" : "meleeWeapon";
    } else if (source === "weapons") {
      isMartial = item.martial ?? false;
      itemType = item.ranged ? "rangedWeapon" : "meleeWeapon";
    } else if (source === "shields") {
      isMartial = item.martial ?? false;
      itemType = "shield";
    } else if (source === "armor") {
      isMartial = item.martial ?? false;
      itemType = "armor";
    }

    if (!isMartial) return true;

    const isTechnospheresStandard =
      player?.settings?.optionalRules?.technospheres &&
      ["standard", "hoplospheres"].includes(
        player?.settings?.optionalRules?.technospheresVariant ?? "standard",
      );
    if (
      isTechnospheresStandard &&
      (itemType === "meleeWeapon" || itemType === "rangedWeapon")
    )
      return true;

    for (const cls of player?.classes ?? []) {
      const martials = cls.benefits?.martials;
      if (!martials) continue;
      if (itemType === "meleeWeapon" && martials.melee) return true;
      if (itemType === "rangedWeapon" && martials.ranged) return true;
      if (itemType === "shield" && martials.shield) return true;
      if (itemType === "armor" && martials.armor) return true;
    }
    return false;
  };

  const isUnarmedStrike = (candidate) =>
    candidate?.source === "weapons" &&
    candidate?.item?.name === "Unarmed Strike";

  const slotKeys = ["mainHand", "offHand", "armor", "accessory"];
  const candidateMatchesRef = (candidate, ref) => {
    if (!ref || ref.source !== candidate.source) return false;
    if (ref.index !== undefined && candidate.index !== undefined)
      return ref.index === candidate.index;
    return ref.name === candidate.label;
  };

  /** Build the list of items valid for the given slot. */
  function getCandidates() {
    const formatWeapon = (w) => {
      const acc = w.accuracy;
      const dmg = w.damage;
      const att1 =
        attributes[acc?.attr1 ?? w.att1]?.shortcaps ?? acc?.attr1 ?? w.att1;
      const att2 =
        attributes[acc?.attr2 ?? w.att2]?.shortcaps ?? acc?.attr2 ?? w.att2;
      const atts = `${att1}+${att2}`;
      const damage = dmg?.value ?? w.dmg ?? w.damage ?? "?";
      const damageType = dmg?.type ?? w.type ?? "";
      const hands = w.hands === 2 || w.isTwoHand ? "2H" : "1H";
      return `${atts} / ${damage} ${t(damageType)} / ${hands}`;
    };
    const formatCustomWeapon = (w) => {
      const isSecondary = w.activeForm === "secondary";
      const accuracy = isSecondary
        ? (w.secondAccuracy ?? w.accuracy)
        : w.accuracy;
      const damage = isSecondary ? (w.secondDamage ?? w.damage) : w.damage;
      const range = isSecondary ? w.secondSelectedRange : w.range;
      const att1 =
        attributes[accuracy?.attr1]?.shortcaps ?? accuracy?.attr1 ?? "?";
      const att2 =
        attributes[accuracy?.attr2]?.shortcaps ?? accuracy?.attr2 ?? "?";
      const hands = "2H";
      const rangeLabel =
        range === "weapon_range_ranged" ? t("Ranged") : t("Melee");
      return `${att1}+${att2} / ${damage?.value ?? "?"} ${t(damage?.type || "")} / ${rangeLabel} / ${hands}`;
    };

    switch (slot) {
      case "mainHand": {
        const weapons = (inv.weapons ?? []).map((w, i) => ({
          label: w.name,
          sub: formatWeapon(w),
          source: "weapons",
          item: w,
          index: i,
        }));
        const customs = (inv.customWeapons ?? []).map((w, i) => {
          const isSecondary = w.activeForm === "secondary";
          const label = isSecondary
            ? w.secondWeaponName || w.name || t("Unnamed")
            : w.name || t("Unnamed");
          return {
            label,
            sub: formatCustomWeapon(w),
            source: "customWeapons",
            item: w,
            index: i,
          };
        });
        const shields = hasDualShieldBearer
          ? (inv.shields ?? []).map((s, i) => ({
              label: s.name,
              sub: `DEF +${resolveDef(s)}`,
              source: "shields",
              item: s,
              index: i,
            }))
          : [];
        return [...weapons, ...customs, ...shields];
      }
      case "offHand": {
        if (mainHandHasTwoHanded) return [];
        const oneHanded = (inv.weapons ?? [])
          .filter((w) => !(w.hands === 2 || w.isTwoHand))
          .map((w, _, _arr) => {
            const i = (inv.weapons ?? []).indexOf(w);
            return {
              label: w.name,
              sub: formatWeapon(w),
              source: "weapons",
              item: w,
              index: i,
            };
          });
        const shields = (inv.shields ?? []).map((s, i) => ({
          label: s.name,
          sub: `DEF +${resolveDef(s)}  MDEF +${resolveMdef(s)}`,
          source: "shields",
          item: s,
          index: i,
        }));
        return [...oneHanded, ...shields];
      }
      case "armor":
        return (inv.armor ?? []).map((a, i) => ({
          label: a.name,
          sub: `DEF +${resolveDef(a)}  MDEF +${resolveMdef(a)}  INIT ${(a.init ?? 0) >= 0 ? "+" : ""}${a.init ?? 0}`,
          source: "armor",
          item: a,
          index: i,
        }));
      case "accessory":
        return (inv.accessories ?? []).map((a, i) => ({
          label: a.name,
          sub: a.quality || "-",
          source: "accessories",
          item: a,
          index: i,
        }));
      default:
        return [];
    }
  }

  const rawCandidates = getCandidates();
  const currentRef = player?.equippedSlots?.[slot];
  const slots = player?.equippedSlots ?? {};

  const candidates = rawCandidates
    .map((c) => {
      const assignedSlots = slotKeys.filter((slotKey) =>
        candidateMatchesRef(c, slots[slotKey]),
      );
      const inCurrentSlot = assignedSlots.includes(slot);
      const inOtherSlot = assignedSlots.some((slotKey) => slotKey !== slot);
      return {
        ...c,
        inCurrentSlot,
        inOtherSlot,
        assignedSlots,
      };
    })
    .filter((c) => {
      // Allow re-selecting current slot occupant.
      if (c.inCurrentSlot) return true;
      // Prevent duplicates across slots, except Unarmed Strike which can be both hands.
      if (c.inOtherSlot && !isUnarmedStrike(c)) return false;
      return true;
    });
  const shouldShowEmptyPrompt = candidates.length === 0;
  const getCandidateSubText = (candidate) => candidate?.sub;
  const isTransformingCustomWeapon = (candidate) =>
    candidate?.source === "customWeapons" &&
    (candidate?.item?.customizations ?? []).some(
      (c) => c.name === "weapon_customization_transforming",
    );

  const handleSwapCustomWeaponForm = (candidate) => {
    if (
      candidate?.source !== "customWeapons" ||
      candidate?.index === undefined ||
      candidate?.index === null
    )
      return;
    setPlayer((prev) => {
      const prevEq0 = prev?.equipment?.[0] ?? {};
      const updatedCustomWeapons = [...(prevEq0.customWeapons ?? [])];
      const cw = updatedCustomWeapons[candidate.index];
      if (!cw) return prev;
      updatedCustomWeapons[candidate.index] = {
        ...cw,
        activeForm: cw.activeForm === "secondary" ? "primary" : "secondary",
      };
      const eq0New = { ...prevEq0, customWeapons: updatedCustomWeapons };
      const equipment = prev?.equipment
        ? [eq0New, ...prev.equipment.slice(1)]
        : [eq0New];
      return { ...prev, equipment };
    });
  };

  const candidateConflicts = useMemo(() => {
    const map = new Map();
    for (const c of candidates) {
      const conflicts = getEquipConflicts(player, slot, c);
      if (conflicts.length > 0) map.set(c, conflicts);
    }
    return map;
  }, [candidates, player, slot]);

  const handleSelect = (candidate) => {
    if (candidateConflicts.has(candidate)) return;
    setPlayer((prev) => equipItemToSlot(prev, slot, candidate));
    if (otherHandHasWeaponModule) onClearOtherHandModule?.();
    onClose();
  };

  const handleClear = () => {
    if (!currentRef) {
      onClose();
      return;
    }
    setPlayer((prev) => clearSlotAction(prev, slot));
    onClose();
  };

  const handleAccept = () => {
    if (!pendingCandidate || candidateConflicts.has(pendingCandidate)) {
      onClose();
      return;
    }
    handleSelect(pendingCandidate);
  };

  const slotLabel =
    {
      mainHand: t("Main Hand"),
      offHand: t("Off Hand"),
      armor: t("Armor"),
      accessory: t("Accessory"),
    }[slot] ?? slot;

  // Visually-selected item: pending click wins over the currently equipped one
  const selectedCandidate =
    pendingCandidate ??
    candidates.find((c) => {
      if (c.source !== currentRef?.source || c.label !== currentRef?.name)
        return false;
      if (currentRef.index !== undefined) return c.index === currentRef.index;
      return true;
    }) ??
    null;

  // Preview: last hovered (latches: no onMouseLeave so no flicker), falls back to selection
  const previewCandidate = hoveredCandidate ?? selectedCandidate ?? null;

  // Module preview: hovered module wins, falls back to the currently active one
  const activeModule =
    vehicleModules.find(
      (m) =>
        m.enabled &&
        ((slot === "mainHand" &&
          (m.equippedSlot === "main" || m.equippedSlot === "both")) ||
          (slot === "offHand" &&
            (m.equippedSlot === "off" || m.equippedSlot === "both")) ||
          (slot === "armor" && m.equippedSlot === "armor")),
    ) ?? null;
  const previewModule = hoveredModule ?? pendingModule ?? activeModule ?? null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        {moduleOverrideOpen ? (
          /* Module override view */
          <>
            <DialogTitle
              sx={{
                fontWeight: "bold",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <PrecisionManufacturingIcon color="success" fontSize="small" />
              {t("Slot - Module Override")}
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
              {/* Module preview panel */}
              <Box sx={{ px: 2, py: 1, height: 108 }}>
                {previewModule ? (
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: "action.selected",
                      borderRadius: 1,
                      height: "100%",
                      overflow: "hidden",
                    }}
                  >
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      {getModuleLabel(previewModule)}
                    </Typography>
                    <Typography
                      variant="caption"
                      noWrap
                      sx={{
                        color: "text.secondary",
                        display: "block",
                      }}
                    >
                      {moduleStatLine(previewModule, t)}
                    </Typography>
                    {previewModule.description && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.primary",
                          display: "block",
                          mt: 0.5,
                          fontStyle: "italic",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {t(previewModule.description)}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.disabled",
                        fontStyle: "italic",
                      }}
                    >
                      {t("Hover a module to preview")}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Divider />
              <List dense disablePadding>
                {vehicleModules.map((m) => {
                  const isActive =
                    m.enabled &&
                    ((slot === "mainHand" &&
                      (m.equippedSlot === "main" ||
                        m.equippedSlot === "both")) ||
                      (slot === "offHand" &&
                        (m.equippedSlot === "off" ||
                          m.equippedSlot === "both")) ||
                      (slot === "armor" && m.equippedSlot === "armor"));
                  const isPending =
                    pendingModule?.originalIndex === m.originalIndex;
                  const isChecked = isPending || (!pendingModule && isActive);
                  return (
                    <ListItem
                      key={m.originalIndex}
                      disablePadding
                      onMouseEnter={() => setHoveredModule(m)}
                    >
                      <ListItemButton
                        onClick={() => setPendingModule(m)}
                        onDoubleClick={() => {
                          onSelectModule?.(m.originalIndex);
                          onClose();
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Radio
                            edge="start"
                            checked={isChecked}
                            disableRipple
                            size="small"
                            color="success"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={getModuleLabel(m)}
                          secondary={moduleStatLine(m, t)}
                          slotProps={{
                            primary: {
                              variant: "body2",
                              fontWeight: isPending || isActive ? 700 : 400,
                            },
                            secondary: { variant: "caption" },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </DialogContent>
            <DialogActions
              sx={{ justifyContent: "space-between", px: 3, py: 2 }}
            >
              <Button
                size="small"
                color="error"
                variant="contained"
                onClick={() => {
                  onDisableModule?.();
                  onClose();
                }}
              >
                {t("Disable Module")}
              </Button>
              <Box>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ mr: 1 }}
                  onClick={() => {
                    onDisableModule?.();
                    setModuleOverrideOpen(false);
                  }}
                >
                  {t("Use Regular Equipment")}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ mr: 1 }}
                  onClick={onClose}
                >
                  {t("Cancel")}
                </Button>
                <Button
                  size="small"
                  color="success"
                  variant="contained"
                  disabled={!pendingModule}
                  onClick={() => {
                    onSelectModule?.(pendingModule.originalIndex);
                    onClose();
                  }}
                >
                  {t("Accept")}
                </Button>
              </Box>
            </DialogActions>
          </>
        ) : (
          /* Regular item picker view */
          <>
            <DialogTitle
              variant="h3"
              sx={{ fontWeight: "bold", textTransform: "uppercase" }}
            >
              {t("Choose item for")}: {slotLabel}
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
              {/* Item preview panel */}
              <Box sx={{ px: 2, py: 1, height: 108 }}>
                {previewCandidate ? (
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: "action.selected",
                      borderRadius: 1,
                      height: "100%",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        {previewCandidate.label}
                      </Typography>
                      {!checkMartialProficiency(previewCandidate) && (
                        <Tooltip
                          title={t("Not proficient with this martial item")}
                        >
                          <ErrorIcon
                            sx={{ fontSize: 14, color: "error.main" }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      noWrap
                      sx={{
                        color: "text.secondary",
                        display: "block",
                      }}
                    >
                      {getCandidateSubText(previewCandidate)}
                    </Typography>
                    {previewCandidate.item?.quality &&
                      previewCandidate.item.quality !==
                        previewCandidate.sub && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.primary",
                            display: "block",
                            mt: 0.5,
                            fontStyle: "italic",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {t(previewCandidate.item.quality)}
                        </Typography>
                      )}
                    {candidateConflicts.has(previewCandidate) && (
                      <Typography
                        variant="caption"
                        sx={{ color: "error.main", display: "block", mt: 0.5 }}
                      >
                        {t("Skill conflict")}:{" "}
                        {candidateConflicts.get(previewCandidate).join(", ")}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.disabled",
                        fontStyle: "italic",
                      }}
                    >
                      {t("Hover an item to preview")}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Divider />
              {otherHandHasWeaponModule && (
                <Typography
                  sx={{
                    px: 2,
                    pt: 1.5,
                    pb: 0.5,
                    color: "warning.main",
                    fontSize: "0.75rem",
                  }}
                >
                  {t(
                    "Slot is restricted by a weapon module in the other hand.",
                  )}{" "}
                  {t("Equipping item will clear slots")}
                </Typography>
              )}
              {shouldShowEmptyPrompt ? (
                <Box sx={{ p: 2 }}>
                  <Typography sx={{ color: "text.secondary" }}>
                    {mainHandHasTwoHanded && slot === "offHand"
                      ? t("Off Hand is locked by a two-handed weapon.")
                      : t("No items available for this slot.")}
                  </Typography>
                </Box>
              ) : (
                <List dense disablePadding>
                  {candidates.map((c, i) => {
                    const isPending =
                      pendingCandidate?.label === c.label &&
                      pendingCandidate?.source === c.source &&
                      pendingCandidate?.index === c.index;
                    const isEquipped =
                      currentRef?.name === c.label &&
                      currentRef?.source === c.source &&
                      (currentRef.index === undefined ||
                        currentRef.index === c.index);
                    const isChecked =
                      selectedCandidate?.label === c.label &&
                      selectedCandidate?.source === c.source &&
                      selectedCandidate?.index === c.index;
                    const isProficient = checkMartialProficiency(c);
                    const conflicts = candidateConflicts.get(c);
                    const hasConflict = !!conflicts;
                    return (
                      <ListItem
                        key={i}
                        disablePadding
                        onMouseEnter={() => setHoveredCandidate(c)}
                      >
                        <ListItemButton
                          onClick={() => !hasConflict && setPendingCandidate(c)}
                          onDoubleClick={() => !hasConflict && handleSelect(c)}
                          disabled={hasConflict}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Radio
                              edge="start"
                              checked={isChecked}
                              disableRipple
                              size="small"
                              color="primary"
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box
                                component="span"
                                sx={{
                                  display: "flex",
                                  gap: 0.5,
                                  alignItems: "center",
                                }}
                              >
                                <span>{c.label}</span>
                                {(c.inCurrentSlot || c.inOtherSlot) && (
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    sx={{
                                      color: "text.secondary",
                                    }}
                                  >
                                    ({t("Equipped")})
                                  </Typography>
                                )}
                                {!isProficient && (
                                  <Tooltip
                                    title={t(
                                      "Not proficient with this martial item",
                                    )}
                                  >
                                    <ErrorIcon
                                      sx={{
                                        fontSize: 13,
                                        color: "error.main",
                                        verticalAlign: "middle",
                                      }}
                                    />
                                  </Tooltip>
                                )}
                                {hasConflict && (
                                  <Tooltip
                                    title={`${t("Skill conflict")}: ${conflicts.join(", ")}`}
                                  >
                                    <LockIcon
                                      sx={{
                                        fontSize: 13,
                                        color: "error.main",
                                        verticalAlign: "middle",
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              </Box>
                            }
                            secondary={getCandidateSubText(c)}
                            slotProps={{
                              primary: {
                                variant: "body2",
                                fontWeight:
                                  isPending || isEquipped ? 700 : 400,
                                component: "div",
                              },
                              secondary: { variant: "caption" },
                            }}
                          />
                          {isChecked && isTransformingCustomWeapon(c) && (
                            <Tooltip
                              title={t("weapon_customization_swap_form")}
                            >
                              <IconButton
                                size="small"
                                sx={{ ml: 0.5 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSwapCustomWeaponForm(c);
                                }}
                                onDoubleClick={(e) => e.stopPropagation()}
                              >
                                <SwapHorizIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </DialogContent>
            <DialogActions
              sx={{ justifyContent: "space-between", px: 3, py: 2 }}
            >
              <Box>
                {currentRef && (
                  <Button
                    onClick={handleClear}
                    color="error"
                    variant="contained"
                    size="small"
                  >
                    {t("Unequip")}
                  </Button>
                )}
                {!(mainHandHasTwoHanded && slot === "offHand") && (
                  <>
                    <Tooltip title={t("Create New")}>
                      <span>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={(e) => {
                            if (showCreateMenu) {
                              setCreateMenuAnchorEl(e.currentTarget);
                              return;
                            }
                            handleCreateForSlot(defaultCreateKind);
                          }}
                          disabled={!onCreateNewItem}
                          sx={{ ml: currentRef ? 1 : 0, minWidth: 32, px: 0.75 }}
                        >
                          <AddIcon fontSize="small" />
                        </Button>
                      </span>
                    </Tooltip>
                    <Menu
                      anchorEl={createMenuAnchorEl}
                      open={Boolean(createMenuAnchorEl)}
                      onClose={() => setCreateMenuAnchorEl(null)}
                    >
                      <MenuItem
                        onClick={() => {
                          setCreateMenuAnchorEl(null);
                          handleCreateForSlot("weapon");
                        }}
                      >
                        {t("Create New Weapon")}
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setCreateMenuAnchorEl(null);
                          handleCreateForSlot("custom-weapon");
                        }}
                      >
                        {t("Create New Custom Weapon")}
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setCreateMenuAnchorEl(null);
                          handleCreateForSlot("shield");
                        }}
                      >
                        {t("Create New Shield")}
                      </MenuItem>
                    </Menu>
                    <Tooltip title={t("Import from Compendium")}>
                      <span>
                        <Button
                          size="small"
                          variant="outlined"
                          color="secondary"
                          onClick={() => onImportFromCompendium?.(slot)}
                          disabled={!onImportFromCompendium}
                          sx={{ minWidth: 32, px: 0.75, ml: 0.75 }}
                        >
                          <SearchIcon fontSize="small" />
                        </Button>
                      </span>
                    </Tooltip>
                  </>
                )}
                {vehicleModules.length > 0 && (
                  <Button
                    onClick={() => {
                      setHoveredModule(null);
                      setPendingModule(null);
                      setModuleOverrideOpen(true);
                    }}
                    color="success"
                    size="small"
                    sx={{ ml: currentRef ? 1 : 0 }}
                  >
                    {t("Use Module Equipment")}
                  </Button>
                )}
              </Box>
              <Box>
                <Button
                  onClick={onClose}
                  size="small"
                  variant="outlined"
                  sx={{ mr: 1 }}
                >
                  {t("Cancel")}
                </Button>
                <Button
                  onClick={handleAccept}
                  color="primary"
                  variant="contained"
                  size="small"
                  disabled={!pendingCandidate}
                >
                  {t("Accept")}
                </Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
