import React, { useState, useEffect, useRef } from "react";
import { useTranslate } from "../../../../translation/translate";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Typography,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import armor from "../../../../libs/armor";
import qualities from "../../../../routes/equip/ArmorShield/qualities";
import ChangeBase from "./ChangeBase";
import SelectQuality from "../../../../routes/equip/ArmorShield/SelectQuality";
import ChangeName from "../../../../routes/equip/common/ChangeName";
import ChangeQuality from "../../../../routes/equip/common/ChangeQuality";
import ApplyRework from "../../../../routes/equip/common/ApplyRework";
import ChangeModifiers from "../ChangeModifiers";
import SlotTierPicker from "../technospheres/SlotTierPicker";
import { SLOT_TIERS } from "../technospheres/slotTiers";
import SlotEditor from "../technospheres/SlotEditor";
import { SharedArmorCard } from "../../../../components/shared/itemCards";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useUploadJSON from "../../../../hooks/useUploadJSON";
import { useEquipmentForm } from "../../common/hooks/useEquipmentForm";
import { useDeleteConfirmation } from "../../../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../../common/DeleteConfirmationDialog";
import { buildSphereData } from "../../../../libs/technospheres";

export default function PlayerArmorModal({
  open,
  onClose,
  editArmorIndex,
  armorPlayer,
  onAddArmor,
  onDeleteArmor,
  player,
  setPlayer,
}) {
  const { t } = useTranslate();
  const isTechnospheres =
    player?.settings?.optionalRules?.technospheres ?? false;

  const [base, setBase] = useState(armorPlayer?.base || armor[0]);
  const [name, setName] = useState(armorPlayer?.name || t(armor[0].name));
  const [quality, setQuality] = useState(armorPlayer?.quality || "");
  const [martial, setMartial] = useState(armorPlayer?.martial || false);
  const [qualityCost, setQualityCost] = useState(armorPlayer?.qualityCost || 0);
  const [selectedQuality, setSelectedQuality] = useState(
    armorPlayer?.selectedQuality || "",
  );
  const [init, setInit] = useState(armorPlayer?.init || 0);
  const [rework, setRework] = useState(armorPlayer?.rework || false);
  const [slots, setSlots] = useState(armorPlayer?.slots ?? "alpha");
  const [slotted, setSlotted] = useState(armorPlayer?.slotted ?? []);
  const [paidSlots, setPaidSlots] = useState(armorPlayer?.slots ?? "alpha");
  const {
    defModifier,
    setDefModifier,
    mDefModifier,
    setMDefModifier,
    initModifier,
    setInitModifier,
    magicModifier,
    setMagicModifier,
    precModifier,
    setPrecModifier,
    damageMeleeModifier,
    setDamageMeleeModifier,
    damageRangedModifier,
    setDamageRangedModifier,
    isEquipped,
    _setIsEquipped,
    modifiersExpanded,
    setModifiersExpanded,
    expandModifiers,
    modifiers,
    clearModifiers,
  } = useEquipmentForm(armorPlayer);

  const fileInputRef = useRef(null);

  const {
    isOpen: deleteDialogOpen,
    closeDialog: setDeleteDialogOpenFalse,
    handleDelete: handleDeleteWithConfirm,
  } = useDeleteConfirmation({
    onConfirm: () => {
      if (editArmorIndex !== null) {
        onDeleteArmor(editArmorIndex);
      }
      onClose();
    },
  });

  useEffect(() => {
    setBase(armorPlayer?.base || armor[0]);
    setName(armorPlayer?.name || t(armor[0].name));
    setQuality(armorPlayer?.quality || "");
    setMartial(armorPlayer?.martial || false);
    setQualityCost(armorPlayer?.qualityCost || 0);
    setSelectedQuality(armorPlayer?.selectedQuality || "");
    setInit(armorPlayer?.init || 0);
    setRework(armorPlayer?.rework || false);
    setSlots(armorPlayer?.slots ?? "alpha");
    setSlotted(armorPlayer?.slotted ?? []);
    setPaidSlots(armorPlayer?.slots ?? "alpha");
    // modifier fields are handled by useEquipmentForm
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armorPlayer]);

  const { handleFileUpload } = useUploadJSON((data) => {
    if (data) {
      const {
        base,
        name,
        quality,
        martial,
        qualityCost,
        init,
        rework,
        defModifier,
        mDefModifier,
        initModifier,
        magicModifier,
        precModifier,
        damageMeleeModifier,
        damageRangedModifier,
      } = data;

      if (base.category === "Armor") {
        handleClearFields();

        if (base) {
          setBase(base);
        }
        if (name) {
          setName(name);
        }
        if (quality) {
          setQuality(quality);
        }
        if (martial) {
          setMartial(martial);
        }
        if (qualityCost) {
          setQualityCost(qualityCost);
        }
        if (init) {
          setInit(init);
        }
        if (rework) {
          setRework(rework);
        }
        if (defModifier) {
          setDefModifier(defModifier);
          expandModifiers();
        }
        if (mDefModifier) {
          setMDefModifier(mDefModifier);
          expandModifiers();
        }
        if (initModifier) {
          setInitModifier(initModifier);
          expandModifiers();
        }
        if (magicModifier) {
          setMagicModifier(magicModifier);
          expandModifiers();
        }
        if (precModifier) {
          setPrecModifier(precModifier);
          expandModifiers();
        }
        if (damageMeleeModifier) {
          setDamageMeleeModifier(damageMeleeModifier);
          expandModifiers();
        }
        if (damageRangedModifier) {
          setDamageRangedModifier(damageRangedModifier);
          expandModifiers();
        }
      }
    }
    fileInputRef.current.value = null;
  });

  function calcCost() {
    let cost = base.cost;
    // Quality
    cost += parseInt(qualityCost);
    return cost;
  }

  const cost = calcCost();

  const paidSlotTier =
    SLOT_TIERS.find((t) => t.value === paidSlots) ?? SLOT_TIERS[0];
  const selectedSlotTier =
    SLOT_TIERS.find((t) => t.value === slots) ?? SLOT_TIERS[0];
  const slotCostDelta = isTechnospheres
    ? selectedSlotTier.cost - paidSlotTier.cost
    : 0;
  const currentZenit = player?.info?.zenit ?? 0;
  const cannotAffordSlotTier = slotCostDelta > currentZenit;
  const slotCostChangeLabel =
    slotCostDelta > 0
      ? `${t("Deduct on save")}: ${slotCostDelta}z`
      : slotCostDelta < 0
        ? `${t("Refund on save")}: ${Math.abs(slotCostDelta)}z`
        : "";
  const currentZenitLabel = `${t("Current Zenit")}: ${currentZenit}z`;

  const handleClearFields = () => {
    setBase(armor[0]);
    setName(armor[0].name);
    setMartial(armor[0].martial);
    setQuality("");
    setQualityCost(0);
    setSelectedQuality("");
    setInit(armor[0].init);
    setRework(false);
    setSlots("alpha");
    setSlotted([]);
    clearModifiers();
  };

  const handleSave = () => {
    const updatedArmor = {
      base,
      name,
      quality,
      martial,
      qualityCost,
      selectedQuality,
      init,
      rework,
      cost,
      category: "Armor",
      def: base.def,
      mdef: base.mdef,
      ...modifiers(),
      isEquipped: martial !== armorPlayer?.martial ? false : isEquipped,
      ...(isTechnospheres || armorPlayer?.slots || armorPlayer?.slotted
        ? { slots, slotted }
        : {}),
    };

    onAddArmor(updatedArmor);
    if (slotCostDelta !== 0 && setPlayer) {
      setPlayer((prev) => ({
        ...prev,
        info: {
          ...prev.info,
          zenit: Math.max(0, (prev.info?.zenit ?? 0) - slotCostDelta),
        },
      }));
    }
  };

  const handleDelete = handleDeleteWithConfirm;

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
          {t("Add Armor")}
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
          <Grid container spacing={2} sx={{ alignItems: "center" }}>
            {/* Form */}

            {/* Change Base */}
            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <ChangeBase
                value={base.name}
                onChange={(e) => {
                  const base = armor.find((el) => el.name === e.target.value);

                  setBase(base);
                  setName(t(base.name));
                  setMartial(base.martial);
                  setInit(base.init);
                }}
              />
            </Grid>
            {/* <Grid size={2}>
                  <ChangeMartial martial={martial} setMartial={setMartial} />
                </Grid> */}
            {isTechnospheres ? (
              <>
                <Grid size={{ xs: 12, md: 8 }}>
                  <SlotTierPicker
                    value={slots}
                    onChange={(tier) => {
                      const newTier = SLOT_TIERS.find((t) => t.value === tier);
                      const hoplospheres =
                        player?.equipment?.[0]?.hoplospheres ?? [];
                      const kept = [];
                      let cost = 0;
                      for (const id of slotted) {
                        const hoplo = hoplospheres.find((h) => h.id === id);
                        const slotCost = hoplo?.requiredSlots ?? 1;
                        if (cost + slotCost <= (newTier?.slots ?? 1)) {
                          kept.push(id);
                          cost += slotCost;
                        }
                      }
                      setSlots(tier);
                      setSlotted(kept);
                    }}
                    isWeapon={false}
                  />
                </Grid>
                <Grid size={12}>
                  <SlotEditor
                    item={{ slots, slotted }}
                    onChange={(updated) => setSlotted(updated.slotted)}
                    player={player}
                    isWeapon={false}
                    onAddToBank={
                      setPlayer
                        ? (item, type) => {
                            const key =
                              type === "mnemospheres"
                                ? "mnemospheres"
                                : "hoplospheres";
                            const genId = () =>
                              Math.random().toString(36).slice(2) +
                              Date.now().toString(36);
                            setPlayer((prev) => {
                              const prevEq0 = prev?.equipment?.[0] ?? {};
                              const eq0New = {
                                ...prevEq0,
                                [key]: [
                                  ...(prevEq0[key] ?? []),
                                  { ...item, id: item.id ?? genId() },
                                ],
                              };
                              const equipment = prev?.equipment
                                ? [eq0New, ...prev.equipment.slice(1)]
                                : [eq0New];
                              return { ...prev, equipment };
                            });
                          }
                        : undefined
                    }
                  />
                </Grid>
              </>
            ) : (
              <Grid
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <SelectQuality
                  quality={selectedQuality}
                  setQuality={(e) => {
                    const quality = qualities.find(
                      (el) => el.name === e.target.value,
                    );
                    setSelectedQuality(quality.name);
                    setQuality(quality.quality);
                    setQualityCost(quality.cost);
                  }}
                />
              </Grid>
            )}

            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <ChangeName
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            {!isTechnospheres && (
              <Grid size={12}>
                <ChangeQuality
                  quality={quality}
                  setQuality={(e) => setQuality(e.target.value)}
                  qualityCost={qualityCost}
                  setQualityCost={(e) => setQualityCost(e.target.value)}
                />
              </Grid>
            )}
            <Accordion
              sx={{ width: "100%", marginLeft: "10px" }}
              expanded={modifiersExpanded}
              onChange={() => setModifiersExpanded(!modifiersExpanded)}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>{t("Modifiers")}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid
                    size={{
                      xs: 6,
                      md: 4,
                    }}
                  >
                    <ChangeModifiers
                      label={"DEF Modifier"}
                      value={defModifier}
                      onChange={(e) => setDefModifier(e.target.value)}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 6,
                      md: 4,
                    }}
                  >
                    <ChangeModifiers
                      label={"MDEF Modifier"}
                      value={mDefModifier}
                      onChange={(e) => setMDefModifier(e.target.value)}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 6,
                      md: 4,
                    }}
                  >
                    <ChangeModifiers
                      label={"INIT Modifier"}
                      value={initModifier}
                      onChange={(e) => setInitModifier(e.target.value)}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 6,
                      md: 4,
                    }}
                  >
                    <ChangeModifiers
                      label={"Magic Modifier"}
                      value={magicModifier}
                      onChange={(e) => setMagicModifier(e.target.value)}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 6,
                      md: 4,
                    }}
                  >
                    <ChangeModifiers
                      label={"Precision Modifier"}
                      value={precModifier}
                      onChange={(e) => setPrecModifier(e.target.value)}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 6,
                      md: 4,
                    }}
                  >
                    <ChangeModifiers
                      label={"Damage (Melee) Modifier"}
                      value={damageMeleeModifier}
                      onChange={(e) => setDamageMeleeModifier(e.target.value)}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 6,
                      md: 4,
                    }}
                  >
                    <ChangeModifiers
                      label={"Damage (Ranged) Modifier"}
                      value={damageRangedModifier}
                      onChange={(e) => setDamageRangedModifier(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
            <Grid size={12}>
              <Divider />
            </Grid>
            <Grid sx={{ py: 0 }} size={12}>
              <Grid container spacing={2} sx={{ alignItems: "center" }}>
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
                {/* Rework */}
                <Grid size="grow">
                  <ApplyRework rework={rework} setRework={setRework} />
                </Grid>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </Grid>
            </Grid>
            <Grid size={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
          </Grid>
          {/* Pretty */}
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <SharedArmorCard
              item={{
                base,
                ...base,
                name: name,
                cost: cost,
                martial: martial,
                quality: quality,
                init: init,
                rework: rework,
                defModifier: parseInt(defModifier),
                mDefModifier: parseInt(mDefModifier),
                initModifier: parseInt(initModifier),
                slots,
                slotted,
              }}
              sphereData={buildSphereData({ slots, slotted }, player)}
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          {editArmorIndex !== null && (
            <Button onClick={handleDelete} color="error" variant="contained">
              {t("Delete")}
            </Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {slotCostChangeLabel && (
            <Typography
              variant="body2"
              color={cannotAffordSlotTier ? "error" : "text.secondary"}
            >
              {slotCostChangeLabel} ({currentZenitLabel})
              {cannotAffordSlotTier ? ` - ${t("Not enough Zenit")}` : ""}
            </Typography>
          )}
          <Button onClick={onClose} color="secondary">
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleSave}
            color="primary"
            variant="contained"
            disabled={cannotAffordSlotTier}
          >
            {t("Save Changes")}
          </Button>
        </DialogActions>
      </Dialog>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={setDeleteDialogOpenFalse}
        onConfirm={() => {
          if (editArmorIndex !== null) {
            onDeleteArmor(editArmorIndex);
          }
          onClose();
        }}
        title={t("Confirm Deletion")}
        message={t("Are you sure you want to delete this armor?")}
        itemPreview={
          <Box>
            <Typography variant="h4">{name}</Typography>
            <Typography variant="body2">
              {t("Armor")} - {cost} {t("zenit")}
            </Typography>
          </Box>
        }
      />
    </>
  );
}
