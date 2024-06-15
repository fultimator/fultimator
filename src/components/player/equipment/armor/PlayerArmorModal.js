import React, { useState, useEffect } from "react";
import { useTranslate } from "../../../../translation/translate";
import {
  Grid,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import armor from "../../../../libs/armor";
import qualities from "../../../../routes/equip/ArmorShield/qualities";
import ChangeBase from "./ChangeBase";
import SelectQuality from "../../../../routes/equip/ArmorShield/SelectQuality";
import ChangeName from "../../../../routes/equip/common/ChangeName";
import ChangeQuality from "../../../../routes/equip/common/ChangeQuality";
import ApplyRework from "../../../../routes/equip/common/ApplyRework";
import PrettyArmor from "./PrettyArmor";

export default function PlayerArmorModal({
  open,
  onClose,
  editArmorIndex,
  armorPlayer,
  setArmorPlayer,
  onAddArmor,
  onDeleteArmor,
}) {
  const { t } = useTranslate();

  const [base, setBase] = useState(armorPlayer?.base || armor[0]);
  const [name, setName] = useState(armorPlayer?.name || armor[0].name);
  const [quality, setQuality] = useState(armorPlayer?.quality || "");
  const [martial, setMartial] = useState(armorPlayer?.martial || false);
  const [qualityCost, setQualityCost] = useState(armorPlayer?.qualityCost || 0);
  const [selectedQuality, setSelectedQuality] = useState(
    armorPlayer?.selectedQuality || ""
  );
  const [init, setInit] = useState(armorPlayer?.init || 0);
  const [rework, setRework] = useState(armorPlayer?.rework || false);
  const [isEquipped, setIsEquipped] = useState(
    armorPlayer?.isEquipped || false
  );

  useEffect(() => {
    setBase(armorPlayer?.base || armor[0]);
    setName(armorPlayer?.name || armor[0].name);
    setQuality(armorPlayer?.quality || "");
    setMartial(armorPlayer?.martial || false);
    setQualityCost(armorPlayer?.qualityCost || 0);
    setSelectedQuality(armorPlayer?.selectedQuality || "");
    setInit(armorPlayer?.init || 0);
    setRework(armorPlayer?.rework || false);
    setIsEquipped(armorPlayer?.isEquipped || false);
  }, [armorPlayer]);

  function calcCost() {
    let cost = base.cost;
    // Quality
    cost += parseInt(qualityCost);
    return cost;
  }

  const cost = calcCost();

  const handleClearFields = () => {
    setBase(armor[0]);
    setName(armor[0].name);
    setMartial(armor[0].martial);
    setQuality("");
    setQualityCost(0);
    setSelectedQuality("");
    setInit(armor[0].init);
    setRework(false);
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
      isEquipped: /* if martial has changed then false */ martial !== armorPlayer?.martial ? false : isEquipped,
      cost,
      category: t("Armor", true),
      def: base.def,
      mdef: base.mdef,
    };

    onAddArmor(updatedArmor);
  };

  const handleDelete = (armorIndex) => {
    if (armorIndex !== null) {
      onDeleteArmor(armorIndex);
    }
    onClose();
  };

  return (
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
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
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
        <Grid container spacing={2} alignItems="center">
          {/* Form */}

          {/* Change Base */}
          <Grid item xs={12} md={4}>
            <ChangeBase
              value={base.name}
              onChange={(e) => {
                const base = armor.find((el) => el.name === e.target.value);

                setBase(base);
                setName(base.name);
                setMartial(base.martial);
                setInit(base.init);
              }}
            />
          </Grid>
          {/* <Grid item xs={2}>
                <ChangeMartial martial={martial} setMartial={setMartial} />
              </Grid> */}
          <Grid item xs={12} md={4}>
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

          <Grid item xs={12} md={4}>
            <ChangeName
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <ChangeQuality
              quality={quality}
              setQuality={(e) => setQuality(e.target.value)}
              qualityCost={qualityCost}
              setQualityCost={(e) => setQualityCost(e.target.value)}
            />
            <Divider />
          </Grid>
          <Grid item xs={12} sx={{ py: 0 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Button variant="outlined" onClick={handleClearFields}>
                  {t("Clear All Fields")}
                </Button>
              </Grid>
              {/* Rework */}
              <Grid item xs>
                <ApplyRework rework={rework} setRework={setRework} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
        </Grid>
        {/* Pretty */}
        <Grid item xs={12} sm={6}>
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
            }}
          />
        </Grid>
      </DialogContent>
      <DialogActions>
        {editArmorIndex !== null && (
          <Button onClick={() => handleDelete(editArmorIndex)} color="error">
            {t("Delete")}
          </Button>
        )}
        <Button onClick={handleSave} color="primary">
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
