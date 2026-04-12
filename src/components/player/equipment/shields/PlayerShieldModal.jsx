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
import shields from "../../../../libs/shields";
import qualities from "../../../../routes/equip/ArmorShield/qualities";
import ChangeBase from "./ChangeBase";
import SelectQuality from "../../../../routes/equip/ArmorShield/SelectQuality";
import ChangeName from "../../../../routes/equip/common/ChangeName";
import ChangeQuality from "../../../../routes/equip/common/ChangeQuality";
import ApplyRework from "../../../../routes/equip/common/ApplyRework";
import PrettyArmor from "../armor/PrettyArmor";
import ChangeModifiers from "../ChangeModifiers";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useUploadJSON from "../../../../hooks/useUploadJSON";
import { useEquipmentForm } from "../../common/hooks/useEquipmentForm";
import DeleteConfirmationDialog from "../../../common/DeleteConfirmationDialog";

export default function PlayerShieldModal({
  open,
  onClose,
  editShieldIndex,
  shield,
  onAddShield,
  onDeleteShield,
}) {
  const { t } = useTranslate();

  const [base, setBase] = useState(shield?.base || shields[0]);
  const [name, setName] = useState(shield?.name || shields[0].name);
  const [quality, setQuality] = useState(shield?.quality || "");
  const [martial, setMartial] = useState(shield?.martial || false);
  const [qualityCost, setQualityCost] = useState(shield?.qualityCost || 0);
  const [selectedQuality, setSelectedQuality] = useState(
    shield?.selectedQuality || ""
  );
  const [init, setInit] = useState(shield?.init || 0);
  const [rework, setRework] = useState(shield?.rework || false);
  const {
    defModifier, setDefModifier,
    mDefModifier, setMDefModifier,
    initModifier, setInitModifier,
    magicModifier, setMagicModifier,
    precModifier, setPrecModifier,
    damageMeleeModifier, setDamageMeleeModifier,
    damageRangedModifier, setDamageRangedModifier,
    isEquipped, setIsEquipped,
    modifiersExpanded, setModifiersExpanded,
    expandModifiers,
    modifiers,
    clearModifiers,
  } = useEquipmentForm(shield);

  const fileInputRef = useRef(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setBase(shield?.base || shields[0]);
    setName(shield?.name || t(shields[0].name));
    setQuality(shield?.quality || "");
    setMartial(shield?.martial || false);
    setQualityCost(shield?.qualityCost || 0);
    setSelectedQuality(shield?.selectedQuality || "");
    setInit(shield?.init || 0);
    setRework(shield?.rework || false);
    // modifier fields are handled by useEquipmentForm
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shield]);

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

      if (base.category === "Shield") {
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
        if (defModifier) { setDefModifier(defModifier); expandModifiers(); }
        if (mDefModifier) { setMDefModifier(mDefModifier); expandModifiers(); }
        if (initModifier) { setInitModifier(initModifier); expandModifiers(); }
        if (magicModifier) { setMagicModifier(magicModifier); expandModifiers(); }
        if (precModifier) { setPrecModifier(precModifier); expandModifiers(); }
        if (damageMeleeModifier) { setDamageMeleeModifier(damageMeleeModifier); expandModifiers(); }
        if (damageRangedModifier) { setDamageRangedModifier(damageRangedModifier); expandModifiers(); }
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

  const handleClearFields = () => {
    setBase(shields[0]);
    setName(t(shields[0].name));
    setMartial(shields[0].martial);
    setQuality("");
    setQualityCost(0);
    setSelectedQuality("");
    setInit(shields[0].init);
    setRework(false);
    clearModifiers();
  };

  const handleSave = () => {
    const updatedShield = {
      base,
      name,
      quality,
      martial,
      qualityCost,
      selectedQuality,
      init,
      rework,
      cost,
      category: "Shield",
      def: base.def,
      mdef: base.mdef,
      ...modifiers(),
      isEquipped: martial !== shield?.martial ? false : isEquipped,
    };

    onAddShield(updatedShield);
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: "lg",
          },
        }}
      >
        <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
          {t("Add Shield")}
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
          <Grid container spacing={2} alignItems="center">
            {/* Form */}

            {/* Change Base */}
            <Grid
              size={{
                xs: 12,
                md: 4
              }}>
              <ChangeBase
                value={base.name}
                onChange={(e) => {
                  const base = shields.find((el) => el.name === e.target.value);

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
            <Grid
              size={{
                xs: 12,
                md: 4
              }}>
              <SelectQuality
                quality={selectedQuality}
                setQuality={(e) => {
                  const quality = qualities.find(
                    (el) => el.name === e.target.value
                  );
                  setSelectedQuality(quality.name);
                  setQuality(quality.quality);
                  setQualityCost(quality.cost);
                }}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 4
              }}>
              <ChangeName
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid  size={12}>
              <ChangeQuality
                quality={quality}
                setQuality={(e) => setQuality(e.target.value)}
                qualityCost={qualityCost}
                setQualityCost={(e) => setQualityCost(e.target.value)}
              />
            </Grid>
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
                      md: 4
                    }}>
                    <ChangeModifiers
                      label={"DEF Modifier"}
                      value={defModifier}
                      onChange={(e) => setDefModifier(e.target.value)}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 6,
                      md: 4
                    }}>
                    <ChangeModifiers
                      label={"MDEF Modifier"}
                      value={mDefModifier}
                      onChange={(e) => setMDefModifier(e.target.value)}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 6,
                      md: 4
                    }}>
                    <ChangeModifiers
                      label={"INIT Modifier"}
                      value={initModifier}
                      onChange={(e) => setInitModifier(e.target.value)}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 6,
                      md: 4
                    }}>
                    <ChangeModifiers
                      label={"Magic Modifier"}
                      value={magicModifier}
                      onChange={(e) => setMagicModifier(e.target.value)}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 6,
                      md: 4
                    }}>
                    <ChangeModifiers
                      label={"Precision Modifier"}
                      value={precModifier}
                      onChange={(e) => setPrecModifier(e.target.value)}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 6,
                      md: 4
                    }}>
                    <ChangeModifiers
                      label={"Damage (Melee) Modifier"}
                      value={damageMeleeModifier}
                      onChange={(e) => setDamageMeleeModifier(e.target.value)}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 6,
                      md: 4
                    }}>
                    <ChangeModifiers
                      label={"Damage (Ranged) Modifier"}
                      value={damageRangedModifier}
                      onChange={(e) => setDamageRangedModifier(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
            <Grid  size={12}>
              <Divider />
            </Grid>
            <Grid  sx={{ py: 0 }} size={12}>
              <Grid container spacing={2} alignItems="center">
                <Grid >
                  <Button
                    variant="outlined"
                    onClick={() => fileInputRef.current.click()}
                  >
                    {t("Upload JSON")}
                  </Button>
                </Grid>
                <Grid >
                  <Button variant="outlined" onClick={handleClearFields}>
                    {t("Clear All Fields")}
                  </Button>
                </Grid>
                {/* Rework */}
                <Grid  size="grow">
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
            <Grid  size={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
          </Grid>
          {/* Pretty */}
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <PrettyArmor
              armor={{
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
              }}
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          {editShieldIndex !== null && (
            <Button
              onClick={handleDelete}
              color="error"
              variant="contained"
            >
              {t("Delete")}
            </Button>
          )}
          <Button onClick={handleSave} color="primary" variant="contained">
            {t("Save Changes")}
          </Button>
        </DialogActions>
      </Dialog>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => {
          if (editShieldIndex !== null) {
            onDeleteShield(editShieldIndex);
          }
          onClose();
        }}
        title={t("Confirm Deletion")}
        message={t("Are you sure you want to delete this shield?")}
        itemPreview={
          <Box>
            <Typography variant="h4">{name}</Typography>
            <Typography variant="body2">
              {t("Shield")} - {cost} {t("zenit")}
            </Typography>
          </Box>
        }
      />
    </>
  );
}
