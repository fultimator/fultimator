import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormGroup, FormControlLabel, Grid, TextField, Button, Typography } from "@mui/material";

export default function EditFreeBenefitsModal({
  open,
  onClose,
  benefits,
  onBenefitChange,
  onRitualChange,
  onMartialChange,
  onSaveBenefits,
  t,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: "80%", maxWidth: "lg" } }}
    >
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
        {t("Edit Benefits")}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ marginTop: "10px" }}>
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
                    onChange={(e) =>
                      onMartialChange("melee", e.target.checked)
                    }
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
                    onChange={(e) =>
                      onMartialChange("armor", e.target.checked)
                    }
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
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="secondary" onClick={onSaveBenefits}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
