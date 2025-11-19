import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import { Close, Delete } from "@mui/icons-material";
import CustomTextarea from "../../common/CustomTextarea";

const availableGifts = [
  {
    name: "esper_gift_atmokinesis",
    event: "esper_event_you_deal_damage",
    effect: "esper_gift_atmokinesis_desc",
  },
  {
    name: "esper_gift_clairvoyance",
    event: "esper_event_npc_focus_or_bond",
    effect: "esper_gift_clairvoyance_desc",
  },
  {
    name: "esper_gift_gravitokinesis",
    event: "esper_event_you_deal_damage",
    effect: "esper_gift_gravitokinesis_desc",
  },
  {
    name: "esper_gift_life_transference",
    event: "When you **cause one or more enemies to lose HP**",
    effect: "esper_gift_life_transference_desc",
  },
  {
    name: "esper_gift_photokinesis",
    event: "esper_event_you_deal_damage",
    effect: "esper_gift_photokinesis_desc",
  },
  {
    name: "esper_gift_psychic_backlash",
    event: "esper_event_succ_opp_check_lose_hp",
    effect: "esper_gift_psychic_backlash_desc",
  },
  {
    name: "esper_gift_psychic_shield",
    event: "esper_event_enemy_acc_mag_check",
    effect: "esper_gift_psychic_shield_desc",
  },
  {
    name: "esper_gift_reassuring_presence",
    event: "esper_event_cover_ally",
    effect: "esper_gift_reassuring_presence_desc",
  },
  {
    name: "esper_gift_thermokinesis",
    event: "esper_event_you_deal_damage",
    effect: "esper_gift_thermokinesis_desc",
  },
  {
    name: "esper_gift_custom_name",
    event: "",
    effect: "",
    customName: "",
  },
];

export default function SpellGiftGiftsModal({
  open,
  onClose,
  onSave,
  gift,
}) {
  const { t } = useTranslate();
  const [currentGifts, setCurrentGifts] = useState(gift?.gifts || []);
  const [showInPlayerSheet, setShowInPlayerSheet] = useState(
    gift ? !!gift.showInPlayerSheet : true
  );

  useEffect(() => {
    if (gift) {
      setShowInPlayerSheet(!!gift.showInPlayerSheet);
    }
    setCurrentGifts(gift?.gifts || []);
  }, [gift]);

  const handleAddGift = () => {
    setCurrentGifts([
      ...currentGifts,
      {
        name: "esper_gift_custom_name",
        event: "",
        effect: "",
        customName: "",
      },
    ]);
  };

  const handleGiftChange = (index, field, value) => {
    const updatedGifts = [...currentGifts];

    if (field === "name") {
      const selectedGift = availableGifts.find((gift) => gift.name === value);

      if (selectedGift) {
        updatedGifts[index] = {
          ...selectedGift,
          customName:
            selectedGift.name === "esper_gift_custom_name"
              ? updatedGifts[index].customName
              : "",
          event:
            selectedGift.name === "esper_gift_custom_name"
              ? updatedGifts[index].event
              : selectedGift.event,
        };
      }
    } else {
      updatedGifts[index][field] = value;
    }

    setCurrentGifts(updatedGifts);
  };

  const handleDeleteGift = (index) => {
    setCurrentGifts(currentGifts.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(gift.index, {
      ...gift,
      gifts: currentGifts,
      showInPlayerSheet: showInPlayerSheet,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: "80%", maxWidth: "lg" } }}
    >
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {t("esper_settings_modal")}
      </DialogTitle>
      <Button
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
      </Button>
      <DialogContent>
        <Grid container spacing={2}>
          {currentGifts.map((gift, index) => (
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={12}
              key={index}
              container
              spacing={1}
              alignItems="flex-start"
            >
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>{t("Gift Type")}</InputLabel>
                  <Select
                    value={gift.name}
                    onChange={(e) =>
                      handleGiftChange(index, "name", e.target.value)
                    }
                  >
                    {availableGifts.map((availableGift) => (
                      <MenuItem key={availableGift.name} value={availableGift.name}>
                        {availableGift.name === "esper_gift_custom_name"
                          ? t("Custom Gift")
                          : t(availableGift.name)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label={t("Event")}
                  value={
                    gift.name === "esper_gift_custom_name" 
                      ? gift.event || ""
                      : gift.event && gift.event.startsWith("esper_event_") 
                        ? t(gift.event)
                        : gift.event || ""
                  }
                  onChange={(e) =>
                    handleGiftChange(index, "event", e.target.value)
                  }
                  readOnly={gift.name !== "esper_gift_custom_name"}
                />
              </Grid>

              {gift.name === "esper_gift_custom_name" && (
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={t("esper_gift_custom_name")}
                    value={gift.customName}
                    onChange={(e) =>
                      handleGiftChange(index, "customName", e.target.value)
                    }
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={4}>
                <CustomTextarea
                  label={t("Gift Effect")}
                  value={
                    gift.name === "esper_gift_custom_name" ? gift.effect : t(gift.effect)
                  }
                  readOnly={gift.name !== "esper_gift_custom_name"}
                  onChange={(e) =>
                    gift.name === "esper_gift_custom_name" &&
                    handleGiftChange(index, "effect", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={12} sm={1}>
                <Button
                  onClick={() => handleDeleteGift(index)}
                  variant="outlined"
                  color="error"
                  sx={{ minWidth: "auto", padding: 1 }}
                >
                  <Delete />
                </Button>
              </Grid>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Button onClick={handleAddGift} variant="outlined" fullWidth>
              {t("Add Gift")}
            </Button>
          </Grid>

          <Grid item xs={12} sm={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={showInPlayerSheet}
                  onChange={(e) => setShowInPlayerSheet(e.target.checked)}
                />
              }
              label={t("Show in Character Sheet")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          {t("Cancel")}
        </Button>
        <Button onClick={handleSave} variant="contained">
          {t("Save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}