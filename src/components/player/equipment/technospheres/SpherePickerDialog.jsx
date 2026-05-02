import React, { useState, useMemo } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Typography,
  Chip,
  Tooltip,
} from "@mui/material";
import { Close, Search } from "@mui/icons-material";
import { useTranslate } from "../../../../translation/translate";
import {
  SharedMnemosphereCard,
  SharedHoplosphereCard,
} from "../../../shared/itemCards";
import CompendiumViewerModal from "../../../compendium/CompendiumViewerModal";
import { SLOT_TIERS } from "./slotTiers";
import { usedSlots } from "./sphereUtils";
import { getHoplosphereCoagKey } from "../../../../libs/technospheres";

const EMPTY_ARRAY = [];

function mnemoCount(slotted, mnemospheres) {
  return (slotted ?? []).filter((id) =>
    (mnemospheres ?? []).some((m) => m.id === id),
  ).length;
}

export default function SpherePickerDialog({
  open,
  onClose,
  item,
  player,
  isWeapon,
  onAdd,
  onAddToBank,
}) {
  const { t } = useTranslate();
  const [tab, setTab] = useState(0);
  const [selected, setSelected] = useState(null);
  const [compendiumType, setCompendiumType] = useState(null);

  const eq0 = player?.equipment?.[0] ?? {};
  const mnemospheres = eq0.mnemospheres ?? EMPTY_ARRAY;
  const hoplospheres = eq0.hoplospheres ?? EMPTY_ARRAY;
  const rawSlotted = item?.slotted;
  const slotted = rawSlotted ?? EMPTY_ARRAY;

  const tier =
    SLOT_TIERS.find((t) => t.value === (item?.slots ?? "alpha")) ??
    SLOT_TIERS[0];
  const used = usedSlots(slotted, hoplospheres);
  const currentMnemoCount = mnemoCount(slotted, mnemospheres);

  const slottedMnemoSkillKeys = useMemo(() => {
    const keys = new Set();
    for (const id of rawSlotted ?? []) {
      const m = mnemospheres.find((m) => m.id === id);
      if (!m) continue;
      for (const sk of m.skills ?? []) {
        if (sk.specialSkill) keys.add(sk.specialSkill);
      }
      for (const h of m.heroic ?? []) {
        if (h.specialSkill) keys.add(h.specialSkill);
      }
    }
    return keys;
  }, [rawSlotted, mnemospheres]);

  const filteredMnemospheres = useMemo(() => {
    if (currentMnemoCount >= tier.mnemoMax) return [];
    if (used + 1 > tier.slots) return [];
    return mnemospheres.map((m) => {
      const alreadySlotted = slotted.includes(m.id);
      const conflict = [...(m.skills ?? []), ...(m.heroic ?? [])].some(
        (sk) => sk.specialSkill && slottedMnemoSkillKeys.has(sk.specialSkill),
      );
      const disabled = alreadySlotted || conflict;
      return {
        item: m,
        disabled,
        reason: alreadySlotted
          ? t("Already slotted")
          : conflict
            ? t("Skill conflict")
            : null,
      };
    });
  }, [
    mnemospheres,
    currentMnemoCount,
    tier,
    used,
    slottedMnemoSkillKeys,
    slotted,
    t,
  ]);

  const filteredHoplospheres = useMemo(() => {
    return hoplospheres.map((h) => {
      const wouldUse = used + h.requiredSlots;
      const tooLarge = wouldUse > tier.slots;
      const weaponOnly = h.socketable === "weapon" && !isWeapon;
      const alreadySlotted = slotted.includes(h.id);
      const disabled = tooLarge || weaponOnly || alreadySlotted;
      const candidateKey = getHoplosphereCoagKey(h);
      const coagCount =
        slotted.filter((id) => {
          const slottedHoplo = hoplospheres.find((hoplo) => hoplo.id === id);
          return (
            slottedHoplo && getHoplosphereCoagKey(slottedHoplo) === candidateKey
          );
        }).length + 1;
      return {
        item: h,
        disabled,
        coagCount,
        reason: alreadySlotted
          ? t("Already slotted")
          : weaponOnly
            ? t("Weapon only")
            : tooLarge
              ? t("Not enough slots")
              : null,
      };
    });
  }, [hoplospheres, used, tier, isWeapon, slotted, t]);

  const handleConfirm = () => {
    if (!selected) return;
    onAdd(selected);
    setSelected(null);
    onClose();
  };

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  const handleCompendiumAdd = (item, type) => {
    if (onAddToBank) onAddToBank(item, type);
  };

  const compendiumTypeForTab = tab === 0 ? "mnemospheres" : "hoplospheres";

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
          {t("Add Sphere")}
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {used}/{tier.slots} {t("slots used")}
          </Typography>
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
        <DialogContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Tabs
              value={tab}
              onChange={(_e, v) => {
                setTab(v);
                setSelected(null);
              }}
              sx={{ flex: 1 }}
            >
              <Tab label={t("Mnemospheres")} />
              <Tab label={t("Hoplospheres")} />
            </Tabs>
            {onAddToBank && (
              <Tooltip
                title={
                  tab === 0
                    ? t("Browse mnemospheres in compendium")
                    : t("Browse hoplospheres in compendium")
                }
              >
                <IconButton
                  size="small"
                  onClick={() => setCompendiumType(compendiumTypeForTab)}
                  sx={{ ml: 1 }}
                >
                  <Search />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {tab === 0 &&
            (filteredMnemospheres.length === 0 ? (
              <Typography color="text.secondary" sx={{ p: 2 }}>
                {currentMnemoCount >= tier.mnemoMax
                  ? t("Mnemosphere cap reached for this tier")
                  : t("No mnemospheres available")}
              </Typography>
            ) : (
              <List dense disablePadding>
                {filteredMnemospheres.map(({ item: m, disabled, reason }) => (
                  <ListItem key={m.id} disablePadding>
                    <ListItemButton
                      selected={selected?.id === m.id}
                      disabled={disabled}
                      onClick={() => !disabled && setSelected(m)}
                      sx={{ flexDirection: "column", alignItems: "flex-start" }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          width: "100%",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <ListItemText primary={`${m.class} Lv.${m.lvl}`} />
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.5,
                            alignItems: "center",
                          }}
                        >
                          {reason && (
                            <Chip label={reason} size="small" color="error" />
                          )}
                          <Typography variant="caption">
                            {500 + m.lvl * 300}z
                          </Typography>
                        </Box>
                      </Box>
                      {selected?.id === m.id && (
                        <Box sx={{ width: "100%", mt: 1 }}>
                          <SharedMnemosphereCard
                            item={m}
                            variant="compact"
                            showCard={true}
                          />
                        </Box>
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ))}

          {tab === 1 &&
            (filteredHoplospheres.length === 0 ? (
              <Typography color="text.secondary" sx={{ p: 2 }}>
                {t("No hoplospheres available")}
              </Typography>
            ) : (
              <List dense disablePadding>
                {filteredHoplospheres.map(
                  ({ item: h, disabled, coagCount, reason }) => (
                    <ListItem key={`${h.id}-${coagCount}`} disablePadding>
                      <ListItemButton
                        selected={selected?.id === h.id}
                        disabled={disabled}
                        onClick={() => !disabled && setSelected(h)}
                        sx={{
                          flexDirection: "column",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            width: "100%",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <ListItemText primary={h.name} />
                          <Box
                            sx={{
                              display: "flex",
                              gap: 0.5,
                              alignItems: "center",
                            }}
                          >
                            {reason && (
                              <Chip label={reason} size="small" color="error" />
                            )}
                            {coagCount > 1 && (
                              <Chip
                                label={`Coag ×${coagCount}`}
                                size="small"
                                color="primary"
                              />
                            )}
                            <Typography variant="caption">{h.cost}z</Typography>
                          </Box>
                        </Box>
                        {selected?.id === h.id && (
                          <Box sx={{ width: "100%", mt: 1 }}>
                            <SharedHoplosphereCard
                              item={h}
                              coagCount={coagCount}
                              variant="compact"
                              showCard={true}
                            />
                          </Box>
                        )}
                      </ListItemButton>
                    </ListItem>
                  ),
                )}
              </List>
            ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("Cancel")}</Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={!selected}
          >
            {t("Add")}
          </Button>
        </DialogActions>
      </Dialog>

      {onAddToBank && (
        <CompendiumViewerModal
          open={Boolean(compendiumType)}
          onClose={() => setCompendiumType(null)}
          onAddItem={handleCompendiumAdd}
          initialType={compendiumType ?? "mnemospheres"}
          restrictToTypes={compendiumType ? [compendiumType] : []}
          context="player"
        />
      )}
    </>
  );
}
