import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import { OffensiveSpellIcon } from "../../icons";

export default function SpellDefaultModal({
  open,
  onClose,
  onSave,
  spell
}) {
  const { t } = useTranslate();
  const [isOffensiveSpell, setIsOffensiveSpell] = React.useState(false);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "80%",
          maxWidth: "lg",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
        {t("Edit Spell")}
      </DialogTitle>
      <DialogContent>
      <Grid container spacing={2}>
              <Grid item xs={12} sm={7}>
                <TextField
                  label={t("Spell Name")}
                  variant="outlined"
                  fullWidth
                  inputProps={{ maxLength: 50 }}
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <FormControl variant="standard" fullWidth>
                  <ToggleButtonGroup
                    size="large"
                    value={isOffensiveSpell}
                    exclusive
                    onChange={(event, newValue) =>
                      setIsOffensiveSpell(newValue)
                    }
                    aria-label="text alignment"
                  >
                    <ToggleButton value="offensive" aria-label="left aligned">
                      <OffensiveSpellIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  type="number"
                  label={t("MP x Target")}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  type="number"
                  label={t("Max Targets")}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t("Target Description")}
                  variant="outlined"
                  fullWidth
                  inputProps={{ maxLength: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t("Duration")}
                  variant="outlined"
                  fullWidth
                  inputProps={{ maxLength: 100 }}
                />
              </Grid>
              {isOffensiveSpell ? (
                <>
                  <Grid item xs={12} sm={6}>
                    <Select fullWidth defaultValue={"dexterity"}>
                      <MenuItem value={"dexterity"}>{t("Dex")}</MenuItem>
                      <MenuItem value={"insight"}>{t("Ins")}</MenuItem>
                      <MenuItem value={"might"}>{t("Mig")}</MenuItem>
                      <MenuItem value={"will"}>{t("Wil")}</MenuItem>
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Select fullWidth defaultValue={"dexterity"}>
                      <MenuItem value={"dexterity"}>{t("Dex")}</MenuItem>
                      <MenuItem value={"insight"}>{t("Ins")}</MenuItem>
                      <MenuItem value={"might"}>{t("Mig")}</MenuItem>
                      <MenuItem value={"will"}>{t("Wil")}</MenuItem>
                    </Select>
                  </Grid>
                </>
              ) : null}
              <Grid item xs={12} sm={12}>
                <CustomTextarea label={t("Description")} fullWidth />
              </Grid>
            </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="secondary" onClick={onSave}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
