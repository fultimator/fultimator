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
import armor from "../../../../libs/armor";
import qualities from "../../../../routes/equip/ArmorShield/qualities";
import ChangeBase from "./ChangeBase";
import SelectQuality from "../../../../routes/equip/ArmorShield/SelectQuality";
import ChangeName from "../../../../routes/equip/common/ChangeName";
import ChangeQuality from "../../../../routes/equip/common/ChangeQuality";
import ApplyRework from "../../../../routes/equip/common/ApplyRework";
import ChangeModifiers from "../ChangeModifiers";
import PrettyArmor from "./PrettyArmor";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useUploadJSON from "../../../../hooks/useUploadJSON";

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
  const [defModifier, setDefModifier] = useState(armorPlayer?.defModifier || 0);
  const [mDefModifier, setMDefModifier] = useState(
    armorPlayer?.mDefModifier || 0
  );
  const [initModifier, setInitModifier] = useState(
    armorPlayer?.initModifier || 0
  );
  const [magicModifier, setMagicModifier] = useState(
    armorPlayer?.magicModifier || 0
  );
  const [precModifier, setPrecModifier] = useState(
    armorPlayer?.precModifier || 0
  );
  const [damageMeleeModifier, setDamageMeleeModifier] = useState(
    armorPlayer?.damageMeleeModifier || 0
  );
  const [damageRangedModifier, setDamageRangedModifier] = useState(
    armorPlayer?.damageRangedModifier || 0
  );
  const [isEquipped, setIsEquipped] = useState(
    armorPlayer?.isEquipped || false
  );

  const [modifiersExpanded, setModifiersExpanded] = useState(false);

  const fileInputRef = useRef(null);

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
    setDefModifier(armorPlayer?.defModifier || 0);
    setMDefModifier(armorPlayer?.mDefModifier || 0);
    setInitModifier(armorPlayer?.initModifier || 0);
    setMagicModifier(armorPlayer?.magicModifier || 0);
    setPrecModifier(armorPlayer?.precModifier || 0);
    setDamageMeleeModifier(armorPlayer?.damageMeleeModifier || 0);
    setDamageRangedModifier(armorPlayer?.damageRangedModifier || 0);
    setModifiersExpanded(
      (armorPlayer?.defModifier && armorPlayer?.defModifier !== 0) ||
        (armorPlayer?.mDefModifier && armorPlayer?.mDefModifier !== 0) ||
        (armorPlayer?.initModifier && armorPlayer?.initModifier !== 0) ||
        (armorPlayer?.magicModifier && armorPlayer?.magicModifier !== 0) ||
        (armorPlayer?.precModifier && armorPlayer?.precModifier !== 0) ||
        (armorPlayer?.damageMeleeModifier &&
          armorPlayer?.damageMeleeModifier !== 0) ||
        (armorPlayer?.damageRangedModifier &&
          armorPlayer?.damageRangedModifier !== 0)
        ? true
        : false
    );
  }, [armorPlayer]);

  const { handleFileUpload } = useUploadJSON((data) => {
    if (data) {
      const {
        base,
        name,
        quality,
        martial,
        cost,
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
        if (cost) {
          setQualityCost(cost);
        }
        if (init) {
          setInit(init);
        }
        if (rework) {
          setRework(rework);
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
    setBase(armor[0]);
    setName(armor[0].name);
    setMartial(armor[0].martial);
    setQuality("");
    setQualityCost(0);
    setSelectedQuality("");
    setInit(armor[0].init);
    setRework(false);
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
    const updatedArmor = {
      base,
      name,
      quality,
      martial,
      qualityCost,
      selectedQuality,
      init,
      rework,
      isEquipped: martial !== armorPlayer?.martial ? false : isEquipped,
      cost,
      category: "Armor",
      def: base.def,
      mdef: base.mdef,
      defModifier: parseInt(defModifier),
      mDefModifier: parseInt(mDefModifier),
      initModifier: parseInt(initModifier),
      magicModifier: parseInt(magicModifier),
      precModifier: parseInt(precModifier),
      damageMeleeModifier: parseInt(damageMeleeModifier),
      damageRangedModifier: parseInt(damageRangedModifier),
    };

    onAddArmor(updatedArmor);
  };

  const handleDelete = (armorIndex) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this armor?"
    );
    if (confirmDelete) {
      if (armorIndex !== null) {
        onDeleteArmor(armorIndex);
      }
      onClose();
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
              {/* Rework */}
              <Grid item xs>
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
              defModifier: parseInt(defModifier),
              mDefModifier: parseInt(mDefModifier),
              initModifier: parseInt(initModifier),
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
