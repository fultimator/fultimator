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
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import { Close } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";

const invocationsByWellspring = {
  Air: [
    { name: "invoker_aero_blast", type: "Blast", effect: "invoker_aero_blast_desc" },
    { name: "invoker_aero_hex", type: "Hex", effect: "invoker_aero_hex_desc" },
    { name: "invoker_breeze", type: "Utility", effect: "invoker_breeze_desc" },
    { name: "invoker_twister", type: "Utility", effect: "invoker_twister_desc" },
  ],
  Earth: [
    { name: "invoker_geo_blast", type: "Blast", effect: "invoker_geo_blast_desc" },
    { name: "invoker_geo_hex", type: "Hex", effect: "invoker_geo_hex_desc" },
    { name: "invoker_growth", type: "Utility", effect: "invoker_growth_desc" },
    { name: "invoker_quicksand", type: "Utility", effect: "invoker_quicksand_desc" },
  ],
  Fire: [
    { name: "invoker_pyro_blast", type: "Blast", effect: "invoker_pyro_blast_desc" },
    { name: "invoker_pyro_hex", type: "Hex", effect: "invoker_pyro_hex_desc" },
    { name: "invoker_burst", type: "Utility", effect: "invoker_burst_desc" },
    { name: "invoker_smoke", type: "Utility", effect: "invoker_smoke_desc" },
  ],
  Lightning: [
    { name: "invoker_electro_blast", type: "Blast", effect: "invoker_electro_blast_desc" },
    { name: "invoker_electro_hex", type: "Hex", effect: "invoker_electro_hex_desc" },
    { name: "invoker_static", type: "Utility", effect: "invoker_static_desc" },
    { name: "invoker_thunder", type: "Utility", effect: "invoker_thunder_desc" },
  ],
  Water: [
    { name: "invoker_hydro_blast", type: "Blast", effect: "invoker_hydro_blast_desc" },
    { name: "invoker_hydro_hex", type: "Hex", effect: "invoker_hydro_hex_desc" },
    { name: "invoker_chill", type: "Utility", effect: "invoker_chill_desc" },
    { name: "invoker_frostbite", type: "Utility", effect: "invoker_frostbite_desc" },
  ],
};

export default function SpellInvokerInvocationsModal({
  open,
  onClose,
  onSave,
  onDelete,
  invoker,
}) {
  const { t } = useTranslate();
  
  // Initialize state variables
  const [selectedSkillLevel, setSelectedSkillLevel] = useState(invoker?.skillLevel || 1);
  const [showInPlayerSheet, setShowInPlayerSheet] = useState(
    invoker ? !!invoker.showInPlayerSheet : true
  );
  const [innerWellspring, setInnerWellspring] = useState(invoker?.innerWellspring || false);
  const [chosenWellspring, setChosenWellspring] = useState(invoker?.chosenWellspring || "");

  // Get available invocations based on skill level
  const getAvailableInvocations = (skillLevel) => {
    const availableTypes = [];
    
    switch (skillLevel) {
      case 1:
        availableTypes.push("Blast");
        break;
      case 2:
        availableTypes.push("Blast", "Hex");
        break;
      case 3:
        availableTypes.push("Blast", "Hex", "Utility");
        break;
      default:
        return [];
    }

    // Get all invocations that match the available types
    const availableInvocations = [];
    Object.entries(invocationsByWellspring).forEach(([wellspring, invocations]) => {
      invocations.forEach(invocation => {
        if (availableTypes.includes(invocation.type)) {
          availableInvocations.push({
            ...invocation,
            name: t(invocation.name),
            effect: t(invocation.effect),
            wellspring
          });
        }
      });
    });

    return availableInvocations;
  };

  useEffect(() => {
    if (invoker) {
      setShowInPlayerSheet(!!invoker.showInPlayerSheet);
      setSelectedSkillLevel(invoker.skillLevel || 1);
      setInnerWellspring(invoker.innerWellspring || false);
      setChosenWellspring(invoker.chosenWellspring || "");
    }
  }, [invoker]);

  const handleSave = () => {
    // Generate available invocations based on selected skill level
    const availableInvocations = getAvailableInvocations(selectedSkillLevel);
    
    onSave(invoker.index, {
      ...invoker,
      skillLevel: selectedSkillLevel,
      availableInvocations: availableInvocations,
      showInPlayerSheet: showInPlayerSheet,
      innerWellspring: innerWellspring,
      chosenWellspring: chosenWellspring,
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(invoker.index);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: "90%", maxWidth: "xl" } }}
    >
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {t("invoker_select_sl")}
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
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="skill-level-select-label">{t("invoker_select_sl")}</InputLabel>
              <Select
                labelId="skill-level-select-label"
                id="skill-level-select"
                value={selectedSkillLevel}
                label={t("invoker_select_sl")}
                onChange={(e) => setSelectedSkillLevel(e.target.value)}
                fullWidth
              >
                <MenuItem value={1}>SL 1 - {t("invoker_select_sl_1")}</MenuItem>
                <MenuItem value={2}>SL 2 - {t("invoker_select_sl_2")}</MenuItem>
                <MenuItem value={3}>SL 3 - {t("invoker_select_sl_3")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Preview of available invocations */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              {t("invoker_available_sl")} {selectedSkillLevel}:
            </Typography>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {getAvailableInvocations(selectedSkillLevel).map((invocation) => (
                <div key={`${invocation.wellspring}-${invocation.name}`} style={{ 
                  padding: '8px', 
                  margin: '4px 0', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <Typography variant="body2" component="div">
                    <strong>{invocation.wellspring} - {invocation.name}</strong> ({invocation.type})
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <ReactMarkdown>{invocation.effect}</ReactMarkdown>
                  </Typography>
                </div>
              ))}
            </div>
          </Grid>

          <Grid item xs={6}>
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
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={innerWellspring}
                  onChange={(e) => setInnerWellspring(e.target.checked)}
                />
              }
              label={t("invoker_invocation_inner_wellspring")}
            />
          </Grid>
          {innerWellspring && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="chosen-wellspring-select-label">
                  {t("invoker_invocation_chosen_wellspring")}
                </InputLabel>
                <Select
                  labelId="chosen-wellspring-select-label"
                  id="chosen-wellspring-select"
                  value={chosenWellspring}
                  label={t("invoker_invocation_chosen_wellspring")}
                  onChange={(e) => setChosenWellspring(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="Air">{t("Air")}</MenuItem>
                  <MenuItem value="Earth">{t("Earth")}</MenuItem>
                  <MenuItem value="Fire">{t("Fire")}</MenuItem>
                  <MenuItem value="Lightning">{t("Lightning")}</MenuItem>
                  <MenuItem value="Water">{t("Water")}</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                {t("invoker_invocation_chosen_wellspring_hint")}
              </Typography>
            </Grid>
          )}
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
    </Dialog>
  );
}