import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { t } from "../../translation/translate";

const SettingsDialog = ({
  open,
  onClose,
  onSave,
  settings,
  onSettingChange,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const { autoUseMP, autoOpenLogs, useDragAndDrop } = settings;

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    onSettingChange(name, checked);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{ "& .MuiDialog-paper": { borderRadius: 3, padding: 2 } }}
    >
      <DialogTitle
        variant="h4"
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          borderBottom: "1px solid #ddd",
          pb: 1,
        }}
      >
        {t("combat_sim_settings")}
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "left",
          mt: 1,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              name="autoUseMP"
              checked={autoUseMP}
              onChange={handleCheckboxChange}
              sx={{
                mt: 0,
                "& .MuiSvgIcon-root": { fontSize: "1.5rem" },
                "&.Mui-checked": {
                  color: isDarkMode ? "white !important" : "primary !important",
                },
              }}
            />
          }
          label={t("combat_sim_auto_use_mp")}
        />
        <FormControlLabel
          control={
            <Checkbox
              name="autoOpenLogs"
              checked={autoOpenLogs}
              onChange={handleCheckboxChange}
              sx={{
                mt: 0,
                "& .MuiSvgIcon-root": { fontSize: "1.5rem" },
                "&.Mui-checked": {
                  color: isDarkMode ? "white !important" : "primary !important",
                },
              }}
            />
          }
          label={t("combat_sim_auto_open_logs")}
        />
        <FormControlLabel
          control={
            <Checkbox
              name="useDragAndDrop"
              checked={useDragAndDrop}
              onChange={handleCheckboxChange}
              sx={{
                mt: 0,
                "& .MuiSvgIcon-root": { fontSize: "1.5rem" },
                "&.Mui-checked": {
                  color: isDarkMode ? "white !important" : "primary !important",
                },
              }}
            />
          }
          label={t("combat_sim_use_drag_and_drop")}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button
          onClick={onClose}
          color={isDarkMode ? "white" : "primary"}
          sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
        >
          {t("Close")}
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          color="primary"
          sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
        >
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
