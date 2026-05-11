import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  ToggleButton,
  Select,
  MenuItem,
  ListItemText,
  Box,
  IconButton,
  FormControlLabel,
  Switch,
  Tooltip,
  Autocomplete,
} from "@mui/material";
import attributes from "../../../libs/attributes";
import types from "../../../libs/types";
import { TypeIcon } from "../../types";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import { OffensiveSpellIcon } from "../../icons";
import { Close } from "@mui/icons-material";
import { useDeleteConfirmation } from "../../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../common/DeleteConfirmationDialog";

export default function SpellDefaultModal({
  open,
  onClose,
  onSave,
  onDelete,
  spell,
}) {
  const { t } = useTranslate();
  const [editedSpell, setEditedSpell] = useState(spell || {});
  const {
    isOpen: deleteDialogOpen,
    closeDialog: setDeleteDialogOpen,
    handleDelete,
  } = useDeleteConfirmation({
    onConfirm: () => {},
  });
  const duration = [t("Scene"), t("Instantaneous"), t("Special")];

  const target = [
    t("Self"),
    t("One creature"),
    t("Up to two creatures"),
    t("Up to three creatures"),
    t("Up to four creatures"),
    t("Up to five creatures"),
    t("One equipped weapon"),
    t("Special"),
  ];

  useEffect(() => {
    if (spell) {
      setEditedSpell(spell || {});
    }
  }, [spell]);

  const singleTargetDescriptions = [
    t("One creature"),
    t("Self"),
    t("One equipped weapon"),
  ];

  const handleChange = (field, value) => {
    setEditedSpell((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "targetDescription") {
        if (singleTargetDescriptions.includes(value)) {
          next.cost = {
            ...(prev.cost ?? { resource: "mp", amount: 0 }),
            perTarget: false,
          };
        } else if (value.startsWith(t("Up to"))) {
          next.cost = {
            ...(prev.cost ?? { resource: "mp", amount: 0 }),
            perTarget: true,
          };
        }
      }
      return next;
    });
  };

  const handleSave = () => {
    onSave(spell.index, editedSpell);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted={false}
      slotProps={{
        paper: {
          sx: {
            width: "80%",
            maxWidth: "lg",
          },
        },
      }}
    >
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {t("Edit Spell")}
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
          <Grid
            size={{
              xs: 12,
              sm: 7,
            }}
          >
            <TextField
              label={t("Spell Name")}
              variant="outlined"
              fullWidth
              value={editedSpell.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              slotProps={{
                htmlInput: { maxLength: 50 },
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 1,
            }}
          >
            <FormControl
              variant="standard"
              fullWidth
              style={{ height: "100%" }}
            >
              <ToggleButton
                value={editedSpell.isOffensive || false}
                selected={editedSpell.isOffensive}
                onChange={() =>
                  handleChange("isOffensive", !editedSpell.isOffensive)
                }
                aria-label="offensive-toggle"
                style={{
                  height: "100%",
                }}
              >
                <OffensiveSpellIcon />
              </ToggleButton>
            </FormControl>
          </Grid>
          <Grid
            size={{
              xs: 6,
              sm: 2,
            }}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <TextField
              type="number"
              label={editedSpell.cost?.perTarget ? t("MP x Target") : t("MP")}
              variant="outlined"
              sx={{ flex: 1 }}
              value={
                editedSpell.cost?.amount === null ||
                editedSpell.cost?.amount === undefined
                  ? ""
                  : editedSpell.cost.amount.toString()
              }
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "" ||
                  (/^\d+$/.test(value) && +value >= 0 && +value <= 999)
                ) {
                  handleChange("cost", {
                    ...(editedSpell.cost ?? {
                      resource: "mp",
                      perTarget: true,
                    }),
                    amount: value === "" ? 0 : parseInt(value, 10),
                  });
                }
              }}
              onBlur={(e) => {
                let value = parseInt(e.target.value, 10);
                if (isNaN(value) || value < 0) {
                  value = 0;
                } else if (value > 999) {
                  value = 999;
                }
                handleChange("cost", {
                  ...(editedSpell.cost ?? { resource: "mp", perTarget: true }),
                  amount: value,
                });
              }}
            />
            <Tooltip title={t("Cost is per target hit")}>
              <Switch
                size="small"
                checked={editedSpell.cost?.perTarget ?? true}
                onChange={(e) =>
                  handleChange("cost", {
                    ...(editedSpell.cost ?? { resource: "mp", amount: 0 }),
                    perTarget: e.target.checked,
                  })
                }
              />
            </Tooltip>
          </Grid>
          <Grid
            size={{
              xs: 6,
              sm: 2,
            }}
          >
            <TextField
              type="number"
              label={t("Max Targets")}
              variant="outlined"
              fullWidth
              value={
                editedSpell.maxTargets === null ||
                editedSpell.maxTargets === undefined
                  ? ""
                  : editedSpell.maxTargets.toString()
              }
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "" ||
                  (/^\d+$/.test(value) && +value >= 0 && +value <= 999)
                ) {
                  handleChange(
                    "maxTargets",
                    value === "" ? 0 : parseInt(value, 10),
                  );
                }
              }}
              onBlur={(e) => {
                let value = parseInt(e.target.value, 10);
                if (isNaN(value) || value < 0) {
                  value = 0;
                } else if (value > 999) {
                  value = 999;
                }
                handleChange("maxTargets", value);
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Autocomplete
              options={target}
              value={editedSpell.targetDescription || ""}
              onChange={(_, newValue) =>
                handleChange("targetDescription", newValue ?? "")
              }
              onInputChange={(_, newValue) =>
                handleChange("targetDescription", newValue)
              }
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("Target Description")}
                  fullWidth
                  inputProps={{ ...params.inputProps, maxLength: 100 }}
                  InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
                />
              )}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Autocomplete
              options={duration}
              value={editedSpell.duration || ""}
              onChange={(_, newValue) =>
                handleChange("duration", newValue ?? "")
              }
              onInputChange={(_, newValue) =>
                handleChange("duration", newValue)
              }
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("Duration")}
                  fullWidth
                  inputProps={{ ...params.inputProps, maxLength: 50 }}
                  InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
                />
              )}
            />
          </Grid>
          {editedSpell.isOffensive ? (
            <>
              <Grid size={{ xs: 6, sm: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>{t("Attr 1")}</InputLabel>
                  <Select
                    value={editedSpell.accuracy?.attr1 || "insight"}
                    label={t("Attr 1")}
                    onChange={(e) =>
                      handleChange("accuracy", {
                        ...(editedSpell.accuracy ?? {
                          attr2: "will",
                          value: 0,
                          defense: "mdef",
                        }),
                        attr1: e.target.value,
                      })
                    }
                  >
                    {Object.keys(attributes).map((a) => (
                      <MenuItem key={a} value={a}>
                        {attributes[a].shortcaps}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>{t("Attr 2")}</InputLabel>
                  <Select
                    value={editedSpell.accuracy?.attr2 || "will"}
                    label={t("Attr 2")}
                    onChange={(e) =>
                      handleChange("accuracy", {
                        ...(editedSpell.accuracy ?? {
                          attr1: "insight",
                          value: 0,
                          defense: "mdef",
                        }),
                        attr2: e.target.value,
                      })
                    }
                  >
                    {Object.keys(attributes).map((a) => (
                      <MenuItem key={a} value={a}>
                        {attributes[a].shortcaps}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  type="number"
                  label={t("Damage")}
                  fullWidth
                  value={editedSpell.damage?.value ?? ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    handleChange("damage", {
                      ...(editedSpell.damage ?? {
                        type: "physical",
                        hrZero: false,
                      }),
                      value: isNaN(val) ? 0 : val,
                    });
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>{t("Damage Type")}</InputLabel>
                  <Select
                    value={editedSpell.damage?.type ?? "physical"}
                    label={t("Damage Type")}
                    onChange={(e) =>
                      handleChange("damage", {
                        ...(editedSpell.damage ?? { value: 0, hrZero: false }),
                        type: e.target.value,
                      })
                    }
                  >
                    {Object.keys(types).map((dmg) => (
                      <MenuItem
                        key={dmg}
                        value={dmg}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          paddingY: "6px",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <TypeIcon type={dmg} />
                          <ListItemText sx={{ textTransform: "capitalize" }}>
                            {types[dmg].long}
                          </ListItemText>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editedSpell.damage?.hrZero === true}
                      onChange={(e) =>
                        handleChange("damage", {
                          ...(editedSpell.damage ?? {
                            value: 0,
                            type: "physical",
                          }),
                          hrZero: e.target.checked,
                        })
                      }
                    />
                  }
                  label="HR0"
                />
              </Grid>
            </>
          ) : null}
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <CustomTextarea
              label={t("Description")}
              fullWidth
              value={editedSpell.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              maxRows={10}
              maxLength={1500}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={
                    editedSpell.showInPlayerSheet === undefined ||
                    editedSpell.showInPlayerSheet ||
                    false
                  }
                  onChange={(e) =>
                    handleChange("showInPlayerSheet", e.target.checked)
                  }
                />
              }
              label={t("Show in Character Sheet")}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={editedSpell.isMagisphere || false}
                  onChange={(e) =>
                    handleChange("isMagisphere", e.target.checked)
                  }
                />
              }
              label={t("Is a Magisphere?")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={handleDelete}>
          {t("Delete Spell")}
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={setDeleteDialogOpen}
        onConfirm={() => onDelete(spell.index)}
        title={t("Delete")}
        message={t("Are you sure you want to delete this spell?")}
      />
    </Dialog>
  );
}
