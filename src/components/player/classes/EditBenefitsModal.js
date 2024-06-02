import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Button,
  Grid,
  TextField,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";

export default function EditBenefitsModal({
  open,
  onClose,
  benefits,
  handleBenefitChange,
  handleRitualChange,
  handleMartialChange,
  onSaveBenefits,
}) {
  const { t } = useTranslate();

  const handleSaveBenefits = () => {
    onSaveBenefits();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "80%", // Adjust width as needed
          maxWidth: "lg", // Adjust maximum width as needed
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
        {t("Edit Free Benefits")}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ marginTop: "10px" }}>
          <Grid item xs={12} sm={4}>
            <TextField
              label={t("HP Modifier")}
              type="number"
              fullWidth
              value={benefits.hpplus}
              onChange={(e) =>
                handleBenefitChange("hpplus", parseInt(e.target.value))
              }
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label={t("MP Modifier")}
              type="number"
              fullWidth
              value={benefits.mpplus}
              onChange={(e) =>
                handleBenefitChange("mpplus", parseInt(e.target.value))
              }
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label={t("IP Modifier")}
              type="number"
              fullWidth
              value={benefits.ipplus}
              onChange={(e) =>
                handleBenefitChange("ipplus", parseInt(e.target.value))
              }
            />
          </Grid>
          <Grid item xs={12}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={benefits.rituals.ritualism}
                    onChange={(e) =>
                      handleRitualChange("ritualism", e.target.checked)
                    }
                  />
                }
                label={t(
                  "You may perform Rituals whose effects fall within the Ritualism discipline."
                )}
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={benefits.martials.melee}
                    onChange={(e) =>
                      handleMartialChange("melee", e.target.checked)
                    }
                  />
                }
                label={t("Gain the ability to equip martial melee weapons.")}
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={benefits.martials.ranged}
                    onChange={(e) =>
                      handleMartialChange("ranged", e.target.checked)
                    }
                  />
                }
                label={t("Gain the ability to equip martial ranged weapons.")}
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={benefits.martials.shields}
                    onChange={(e) =>
                      handleMartialChange("shields", e.target.checked)
                    }
                  />
                }
                label={t("Gain the ability to equip martial shields.")}
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={benefits.martials.armor}
                    onChange={(e) =>
                      handleMartialChange("armor", e.target.checked)
                    }
                  />
                }
                label={t("Gain the ability to equip martial armor.")}
              />
            </FormGroup>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSaveBenefits}
        >
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
