import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Typography,
} from "@mui/material";
import { useTranslate } from "../../../../translation/translate";
import weapons from "../../../../libs/weapons";
import { Close } from "@mui/icons-material";
import { SharedWeaponCard } from "../../../../components/shared/itemCards";
import { useDeleteConfirmation } from "../../../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../../common/DeleteConfirmationDialog";
import {
  getWeaponAttr1,
  getWeaponAttr2,
  getWeaponPrec,
  getWeaponRange,
  getWeaponType,
  normalizeWeaponLike,
  calcWeaponCost,
  calcWeaponDamage,
  calcWeaponPrec,
} from "../../../../libs/weaponNormalization";
import { validateWeaponPersisted } from "../../../../forms/schema/itemSchemas/weapon";
import { SchemaFieldRenderer } from "../../../../forms/rendering/SchemaFieldRenderer";
import { weaponFieldConfig } from "../../../../forms/rendering/config/itemConfigs/weapon";

function buildInitialState(weapon) {
  const weaponAccuracy = weapon?.accuracy ?? {};
  const weaponDamage =
    weapon?.damage && typeof weapon.damage === "object" ? weapon.damage : {};
  const base = weapon?.base || weapons[0];
  return {
    base,
    name: weapon?.name || weapons[0].name,
    category: weapon?.category || "",
    type: weaponDamage.type || weapon?.type || getWeaponType(weapons[0]),
    hands: weapon?.hands || weapons[0].hands,
    att1: weaponAccuracy.attr1 || weapon?.att1 || getWeaponAttr1(weapons[0]),
    att2: weaponAccuracy.attr2 || weapon?.att2 || getWeaponAttr2(weapons[0]),
    martial: weapon?.martial || false,
    damageHrZero: weaponDamage.hrZero === true,
    damageBonus: weapon?.damageBonus || false,
    damageReworkBonus: weapon?.damageReworkBonus || false,
    precBonus: weapon?.precBonus || false,
    rareBonuses: {
      precBonus: weapon?.precBonus || false,
      damageBonus: weapon?.damageBonus || false,
      damageReworkBonus: weapon?.damageReworkBonus || false,
    },
    rework: weapon?.rework || false,
    quality: weapon?.quality || "",
    range: weapon?.range || getWeaponRange(base),
    qualityName: weapon?.qualityName || weapon?.selectedQuality || "",
    qualityCost: weapon?.qualityCost || 0,
    totalBonus: weapon?.totalBonus || 0,
    selectedQuality: weapon?.selectedQuality || "",
    precModifier: weapon?.modifiers?.accuracy ?? weapon?.precModifier ?? 0,
    damageModifier: weapon?.modifiers?.damage ?? weapon?.damageModifier ?? 0,
    defModifier: weapon?.modifiers?.def ?? weapon?.defModifier ?? 0,
    mDefModifier: weapon?.modifiers?.mdef ?? weapon?.mDefModifier ?? 0,
    isEquipped: weapon?.isEquipped || false,
  };
}

export default function PlayerWeaponModal({
  open,
  onClose,
  editWeaponIndex,
  weapon,
  onAddWeapon,
  onDeleteWeapon,
}) {
  const { t } = useTranslate();
  const [formState, setFormState] = useState(() => buildInitialState(weapon));
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormState(buildInitialState(weapon));
  }, [weapon]);

  const {
    base,
    name,
    category,
    type,
    hands,
    att1,
    att2,
    martial,
    damageHrZero,
    damageBonus,
    damageReworkBonus,
    precBonus,
    rework,
    quality,
    qualityName,
    qualityCost,
    totalBonus,
    selectedQuality,
    precModifier,
    damageModifier,
    defModifier,
    mDefModifier,
    isEquipped,
  } = formState;

  const cost = calcWeaponCost({
    base,
    type,
    att1,
    att2,
    rework,
    damageBonus,
    precBonus,
    qualityCost,
  });
  const damage = calcWeaponDamage({
    base,
    hands,
    rework,
    damageBonus,
    damageReworkBonus,
    damageModifier,
    cost,
  });
  const prec = calcWeaponPrec({ base, rework, precBonus, precModifier });

  // Keep totalBonus in sync with cost (mirrors the old useEffect).
  useEffect(() => {
    const bonus = Math.floor(cost / 1000) * 2;
    setFormState((prev) => ({ ...prev, totalBonus: bonus }));
  }, [damageReworkBonus, cost, qualityCost, rework]);

  const set = (key, value) =>
    setFormState((prev) => ({ ...prev, [key]: value }));

  const {
    isOpen: deleteDialogOpen,
    closeDialog: setDeleteDialogOpen,
    handleDelete,
  } = useDeleteConfirmation({
    onConfirm: () => {
      if (editWeaponIndex !== null) {
        onDeleteWeapon(editWeaponIndex);
      }
      onClose();
    },
  });

  const handleFileUpload = (data) => {
    if (data) {
      const normalized = normalizeWeaponLike(data);
      const {
        base: newBase,
        name: newName,
        accuracy,
        martial: newMartial,
        category: newCategory,
        damage: newDamage,
        hand,
        hands: newHands,
        quality: newQuality,
        qualityCost: newQualityCost,
        damageBonus: newDamageBonus,
        damageReworkBonus: newDamageReworkBonus,
        precBonus: newPrecBonus,
        rework: newRework,
        defModifier: newDefModifier,
        mDefModifier: newMDefModifier,
        precModifier: newPrecModifier,
        damageModifier: newDamageModifier,
      } = normalized;

      const defaults = buildInitialState(null);
      const next = { ...defaults };

      if (newBase) next.base = newBase;
      if (newName) next.name = newName;
      if (accuracy?.attr1) next.att1 = accuracy.attr1;
      if (accuracy?.attr2) next.att2 = accuracy.attr2;
      if (newMartial) next.martial = newMartial;
      if (newCategory) next.category = newCategory;
      if (newDamage?.type) next.type = newDamage.type;
      next.damageHrZero = newDamage?.hrZero === true;
      if (hand || newHands) next.hands = hand ?? newHands;
      if (newQuality) {
        next.selectedQuality = "";
        next.quality = newQuality;
      }
      if (newQualityCost) next.qualityCost = newQualityCost;
      if (newDamageBonus) next.damageBonus = newDamageBonus;
      if (newDamageReworkBonus) next.damageReworkBonus = newDamageReworkBonus;
      if (newPrecBonus) next.precBonus = newPrecBonus;
      if (newRework) next.rework = newRework;
      if (newDefModifier) next.defModifier = newDefModifier;
      if (newMDefModifier) next.mDefModifier = newMDefModifier;
      if (newPrecModifier) next.precModifier = newPrecModifier;
      if (newDamageModifier) next.damageModifier = newDamageModifier;

      setFormState(next);
    }
    fileInputRef.current.value = null;
  };

  const handleSave = () => {
    const savedCost = calcWeaponCost({
      base,
      type,
      att1,
      att2,
      rework,
      damageBonus,
      precBonus,
      qualityCost,
    });
    const savedDamage = calcWeaponDamage({
      base,
      hands,
      rework,
      damageBonus,
      damageReworkBonus,
      damageModifier,
      cost: savedCost,
    });
    const savedPrec = calcWeaponPrec({ base, rework, precBonus, precModifier });

    const updatedWeapon = normalizeWeaponLike({
      base,
      name,
      category,
      range: getWeaponRange(base),
      type,
      hands,
      att1,
      att2,
      martial,
      damageBonus,
      damageReworkBonus,
      precBonus,
      rework,
      quality,
      qualityName,
      qualityCost,
      totalBonus,
      selectedQuality,
      cost: savedCost,
      damage: { value: savedDamage, type, hrZero: damageHrZero },
      prec: savedPrec,
      defModifier: parseInt(defModifier),
      mDefModifier: parseInt(mDefModifier),
      precModifier: parseInt(precModifier),
      damageModifier: parseInt(damageModifier),
      isEquipped:
        (weapon?.hands || weapons[0].hands) !== hands ||
        (weapon?.martial || false) !== martial
          ? false
          : isEquipped,
    });

    if (import.meta.env.DEV) {
      const result = validateWeaponPersisted(updatedWeapon);
      if (!result.success) {
        console.warn(
          "[PlayerWeaponModal] weapon schema validation failed",
          result.error.issues,
        );
      }
    }
    onAddWeapon(updatedWeapon);
  };

  const handleClearFields = () => {
    setFormState(buildInitialState(null));
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: "100%",
              maxWidth: "lg",
            },
          },
        }}
      >
        <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
          {t("Add Weapon")}
        </DialogTitle>
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
          <Close />
        </IconButton>
        <DialogContent>
          <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
            {/* Left column: form fields */}
            <Grid size={{ xs: 12, md: 7 }}>
              {/* Core: base, name, category, hands, martial */}
              <Grid container spacing={2} sx={{ mb: 2, alignItems: "center" }}>
                <SchemaFieldRenderer
                  config={weaponFieldConfig}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="core"
                  label={t("Weapon")}
                  cols={2}
                />
              </Grid>

              {/* Accuracy: att1, att2 */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <SchemaFieldRenderer
                  config={weaponFieldConfig}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="accuracy"
                  label={t("Accuracy")}
                  cols={2}
                />
              </Grid>

              {/* Damage: type, hrZero */}
              <Grid container spacing={2} sx={{ mb: 2, alignItems: "center" }}>
                <SchemaFieldRenderer
                  config={weaponFieldConfig}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="damage"
                  label={t("Damage")}
                  cols={2}
                />
              </Grid>

              {/* Quality: preset, text, cost */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <SchemaFieldRenderer
                  config={weaponFieldConfig}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="quality"
                  label={t("Quality")}
                  cols={2}
                />
              </Grid>

              {/* Rare bonuses */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <SchemaFieldRenderer
                  config={weaponFieldConfig}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="rareBonus"
                  label={t("Rare Weapon Options")}
                  cols={1}
                  extraProps={{
                    rework,
                    totalBonus,
                    basePrec: getWeaponPrec(base),
                  }}
                />
                <SchemaFieldRenderer
                  config={weaponFieldConfig}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="rare"
                  cols={2}
                />
                <SchemaFieldRenderer
                  config={weaponFieldConfig}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="modifiers"
                  label={t("Modifiers")}
                  cols={2}
                />
              </Grid>

              {/* Controls: upload, clear */}
              <Grid container spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                <Grid>
                  <Button
                    variant="outlined"
                    onClick={() => fileInputRef.current.click()}
                  >
                    {t("Upload JSON")}
                  </Button>
                </Grid>
                <Grid>
                  <Button variant="outlined" onClick={handleClearFields}>
                    {t("Clear All Fields")}
                  </Button>
                </Grid>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const result = JSON.parse(reader.result);
                        handleFileUpload(result);
                      };
                      reader.readAsText(file);
                    }
                  }}
                  style={{ display: "none" }}
                />
              </Grid>
            </Grid>

            {/* Right column: preview card (sticky so it stays visible while scrolling) */}
            <Grid size={{ xs: 12, md: 5 }} sx={{ position: "sticky", top: 0 }}>
              <SharedWeaponCard
                item={{
                  base,
                  name,
                  att1,
                  att2,
                  martial,
                  type,
                  hands,
                  category,
                  range: getWeaponRange(base),
                  cost,
                  damage: { value: damage, type, hrZero: damageHrZero },
                  prec,
                  quality,
                  qualityCost,
                  damageBonus,
                  damageReworkBonus,
                  precBonus,
                  rework,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          {editWeaponIndex !== null && (
            <Button onClick={handleDelete} color="error" variant="contained">
              {t("Delete")}
            </Button>
          )}
          <Button
            onClick={handleSave}
            color="primary"
            variant="contained"
            disabled={weapon?.magicannon}
          >
            {t("Save Changes")}
          </Button>
        </DialogActions>
      </Dialog>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={setDeleteDialogOpen}
        onConfirm={() => {
          if (editWeaponIndex !== null) {
            onDeleteWeapon(editWeaponIndex);
          }
          onClose();
        }}
        title={t("Confirm Deletion")}
        message={t("Are you sure you want to delete this weapon?")}
        itemPreview={
          <Box>
            <Typography variant="h4">{name}</Typography>
            <Typography variant="body2">
              {t(category)} - {cost} {t("zenit")}
            </Typography>
          </Box>
        }
      />
    </>
  );
}
