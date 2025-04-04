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
} from "@mui/material";
import { Close } from "@mui/icons-material";
import qualities from "../../../../routes/equip/Accessories/qualities";
import SelectQuality from "../../../../routes/equip/Accessories/SelectQuality";
import ChangeName from "../../../../routes/equip/common/ChangeName";
import ChangeQuality from "../../../../routes/equip/common/ChangeQuality";
import ChangeModifiers from "../ChangeModifiers";
import PrettyAccessory from "./PrettyAccessory";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useUploadJSON from "../../../../hooks/useUploadJSON";

export default function PlayerAccessoryModal({
  open,
  onClose,
  editAccIndex,
  accessory,
  onAddAccessory,
  onDeleteAccessory,
}) {
  const { t } = useTranslate();

  const [name, setName] = useState(accessory?.name || "");
  const [quality, setQuality] = useState(accessory?.quality || "");
  const [qualityCost, setQualityCost] = useState(accessory?.qualityCost || 0);
  const [selectedQuality, setSelectedQuality] = useState(
    accessory?.selectedQuality || ""
  );
  const [defModifier, setDefModifier] = useState(accessory?.defModifier || 0);
  const [mDefModifier, setMDefModifier] = useState(
    accessory?.mDefModifier || 0
  );
  const [initModifier, setInitModifier] = useState(
    accessory?.initModifier || 0
  );
  const [magicModifier, setMagicModifier] = useState(
    accessory?.magicModifier || 0
  );
  const [precModifier, setPrecModifier] = useState(
    accessory?.precModifier || 0
  );
  const [damageMeleeModifier, setDamageMeleeModifier] = useState(
    accessory?.damageMeleeModifier || 0
  );
  const [damageRangedModifier, setDamageRangedModifier] = useState(
    accessory?.damageRangedModifier || 0
  );
  const [isEquipped, setIsEquipped] = useState(accessory?.isEquipped || false);

  const [modifiersExpanded, setModifiersExpanded] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    setName(accessory?.name || "");
    setQuality(accessory?.quality || "");
    setQualityCost(accessory?.qualityCost || 0);
    setSelectedQuality(accessory?.selectedQuality || "");
    setIsEquipped(accessory?.isEquipped || false);
    setDefModifier(accessory?.defModifier || 0);
    setMDefModifier(accessory?.mDefModifier || 0);
    setInitModifier(accessory?.initModifier || 0);
    setMagicModifier(accessory?.magicModifier || 0);
    setPrecModifier(accessory?.precModifier || 0);
    setDamageMeleeModifier(accessory?.damageMeleeModifier || 0);
    setDamageRangedModifier(accessory?.damageRangedModifier || 0);
    setModifiersExpanded(
      (accessory?.defModifier && accessory?.defModifier !== 0) ||
        (accessory?.mDefModifier && accessory?.mDefModifier !== 0) ||
        (accessory?.initModifier && accessory?.initModifier !== 0) ||
        (accessory?.magicModifier && accessory?.magicModifier !== 0) ||
        (accessory?.precModifier && accessory?.precModifier !== 0) ||
        (accessory?.damageMeleeModifier &&
          accessory?.damageMeleeModifier !== 0) ||
        (accessory?.damageRangedModifier &&
          accessory?.damageRangedModifier !== 0)
        ? true
        : false
    );
  }, [accessory]);

  const { handleFileUpload } = useUploadJSON((data) => {
    if (data) {
      const {
        name,
        quality,
        qualityCost,
        defModifier,
        mDefModifier,
        initModifier,
        magicModifier,
        precModifier,
        damageMeleeModifier,
        damageRangedModifier,
      } = data;

      if (name) {
        setName(name);
      }
      if (quality) {
        setSelectedQuality("");
        setQuality(quality);
      }
      if (qualityCost) {
        setQualityCost(qualityCost);
      }
      if (defModifier) {
        setDefModifier(defModifier);
        setModifiersExpanded(true);
      }
      if (mDefModifier) {
        setMDefModifier(mDefModifier);
        setModifiersExpanded(true);
      }
      if (initModifier) {
        setInitModifier(initModifier);
        setModifiersExpanded(true);
      }
      if (magicModifier) {
        setMagicModifier(magicModifier);
        setModifiersExpanded(true);
      }
      if (precModifier) {
        setPrecModifier(precModifier);
        setModifiersExpanded(true);
      }
      if (damageMeleeModifier) {
        setDamageMeleeModifier(damageMeleeModifier);
        setModifiersExpanded(true);
      }
      if (damageRangedModifier) {
        setDamageRangedModifier(damageRangedModifier);
        setModifiersExpanded(true);
      }
    }
    fileInputRef.current.value = null;
  });

  function calcCost() {
    return parseInt(qualityCost);
  }

  const cost = calcCost();

  const handleClearFields = () => {
    setName("");
    setQuality("");
    setQualityCost(0);
    setSelectedQuality("");
    setDefModifier(0);
    setMDefModifier(0);
    setInitModifier(0);
    setMagicModifier(0);
    setPrecModifier(0);
    setDamageMeleeModifier(0);
    setDamageRangedModifier(0);
    setModifiersExpanded(false);
  };

  const handleSave = () => {
    const updatedAccessory = {
      name,
      quality,
      qualityCost,
      selectedQuality,
      cost,
      isEquipped,
      defModifier: parseInt(defModifier),
      mDefModifier: parseInt(mDefModifier),
      initModifier: parseInt(initModifier),
      magicModifier: parseInt(magicModifier),
      precModifier: parseInt(precModifier),
      damageMeleeModifier: parseInt(damageMeleeModifier),
      damageRangedModifier: parseInt(damageRangedModifier),
    };

    onAddAccessory(updatedAccessory);
  };

  const handleDelete = async (accIndex) => {
    const confirmed = window.confirm(t("Are you sure you want to delete this accessory?"));

    if (confirmed) {
      if (accIndex !== null) {
        onDeleteAccessory(accIndex); // Call the delete function if confirmed
      }
      onClose(); // Close the dialog or perform any necessary cleanup
    }
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
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {t("Add Accessory")}
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
          <Grid item xs={6}>
            <ChangeName
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
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
          <Grid item xs={12}>
            <ChangeQuality
              quality={quality}
              setQuality={(e) => setQuality(e.target.value)}
              qualityCost={qualityCost}
              setQualityCost={(e) => setQualityCost(e.target.value)}
            />
            <Divider />
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
                <Grid item xs={6} md={4}>
                  <ChangeModifiers
                    label={"DEF Modifier"}
                    value={defModifier}
                    onChange={(e) => setDefModifier(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} md={4}>
                  <ChangeModifiers
                    label={"MDEF Modifier"}
                    value={mDefModifier}
                    onChange={(e) => setMDefModifier(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} md={4}>
                  <ChangeModifiers
                    label={"INIT Modifier"}
                    value={initModifier}
                    onChange={(e) => setInitModifier(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} md={4}>
                  <ChangeModifiers
                    label={"Magic Modifier"}
                    value={magicModifier}
                    onChange={(e) => setMagicModifier(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} md={4}>
                  <ChangeModifiers
                    label={"Precision Modifier"}
                    value={precModifier}
                    onChange={(e) => setPrecModifier(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} md={4}>
                  <ChangeModifiers
                    label={"Damage (Melee) Modifier"}
                    value={damageMeleeModifier}
                    onChange={(e) => setDamageMeleeModifier(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} md={4}>
                  <ChangeModifiers
                    label={"Damage (Ranged) Modifier"}
                    value={damageRangedModifier}
                    onChange={(e) => setDamageRangedModifier(e.target.value)}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12} sx={{ py: 0 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={() => fileInputRef.current.click()}
                >
                  {t("Upload JSON")}
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" onClick={handleClearFields}>
                  {t("Clear All Fields")}
                </Button>
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
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
        </Grid>
        {/* Pretty */}
        <Grid item xs={12} sm={6}>
          <PrettyAccessory
            accessory={{
              name: name,
              cost: cost,
              quality: quality,
            }}
          />
        </Grid>
      </DialogContent>
      <DialogActions>
        {editAccIndex !== null && (
          <Button onClick={() => handleDelete(editAccIndex)} color="error" variant="contained" >
            {t("Delete")}
          </Button>
        )}
        <Button
          onClick={handleSave}
          color= "primary"
          variant="contained"
        >
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
