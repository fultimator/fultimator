import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Grid,
  TextField,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import { Delete, Close } from "@mui/icons-material";

export default function EditFreeBenefitsModal({
  open,
  onClose,
  benefits,
  onBenefitChange,
  onRitualChange,
  onMartialChange,
  onCustomBenefitChange,
  onSaveBenefits,
  onAddCustomBenefit,
  onRemoveCustomBenefit,
  t,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: "80%", maxWidth: "lg" } }}
    >
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {t("Edit Benefits")}
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
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField
              label={t("HP Modifier")}
              type="number"
              fullWidth
              value={benefits.hpplus}
              onChange={(e) =>
                onBenefitChange("hpplus", parseInt(e.target.value))
              }
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label={t("MP Modifier")}
              type="number"
              fullWidth
              value={benefits.mpplus}
              onChange={(e) =>
                onBenefitChange("mpplus", parseInt(e.target.value))
              }
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label={t("IP Modifier")}
              type="number"
              fullWidth
              value={benefits.ipplus}
              onChange={(e) =>
                onBenefitChange("ipplus", parseInt(e.target.value))
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
                      onRitualChange("ritualism", e.target.checked)
                    }
                  />
                }
                label={
                  <Typography>
                    {t(
                      "You may perform Rituals whose effects fall within the Ritualism discipline."
                    )}
                  </Typography>
                }
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={benefits.martials.melee}
                    onChange={(e) => onMartialChange("melee", e.target.checked)}
                  />
                }
                label={
                  <Typography>
                    {t("Gain the ability to equip martial melee weapons.")}
                  </Typography>
                }
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
                      onMartialChange("ranged", e.target.checked)
                    }
                  />
                }
                label={
                  <Typography>
                    {t("Gain the ability to equip martial ranged weapons.")}
                  </Typography>
                }
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
                      onMartialChange("shields", e.target.checked)
                    }
                  />
                }
                label={
                  <Typography>
                    {t("Gain the ability to equip martial shields.")}
                  </Typography>
                }
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={benefits.martials.armor}
                    onChange={(e) => onMartialChange("armor", e.target.checked)}
                  />
                }
                label={
                  <Typography>
                    {t("Gain the ability to equip martial armor.")}
                  </Typography>
                }
              />
            </FormGroup>
          </Grid>
        </Grid>
        {benefits.custom.length > 0 && (
          <>
            <Grid
              item
              xs={12}
              sx={{ marginTop: "20px", fontWeight: "bold", fontSize: "1.2rem" }}
            >
              {t("Custom Benefits")}
            </Grid>
            {benefits.custom.map((custombenefit, index) => (
              <Grid container sx={{ marginTop: "10px" }} key={index}>
                <Grid item xs={2} sm={1}>
                  <IconButton onClick={() => onRemoveCustomBenefit(index)}>
                    <Delete />
                  </IconButton>
                </Grid>
                <Grid item xs={10} sx={11}>
                  <TextField
                    sx={{ width: "100%" }}
                    label={t("Custom Benefit") + " " + (index + 1)}
                    value={custombenefit}
                    onChange={(e) =>
                      onCustomBenefitChange(index, e.target.value)
                    }
                    inputProps={{ maxLength: 1000 }}
                  />
                </Grid>
              </Grid>
            ))}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="quaternary"
          onClick={onAddCustomBenefit}
        >
          {t("Add Custom Benefit")}
        </Button>
        <Button variant="contained" color="primary" onClick={onSaveBenefits}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
