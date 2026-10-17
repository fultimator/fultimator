import { useState } from "react";
import {
  Paper,
  Grid,
  Typography,
  Box,
  TextField,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "/src/translation/translate";
import ActorEditModal from "/src/forms/ui/ActorEditModal";

const zenitIcon = "/assets/icons/resources/zenit.png";

function ZenitDialog({ open, onClose, currentValue, onApply, t }) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("+");

  const handleSubmit = () => {
    const val = parseInt(amount, 10) || 0;
    onApply(type === "+" ? val : -val);
    setAmount("");
    onClose();
  };

  return (
    <ActorEditModal
      open={open}
      onClose={onClose}
      onConfirm={handleSubmit}
      title={t("Update Zenit")}
      maxWidth="xs"
      actions={
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          <Button onClick={onClose} color="secondary" variant="contained">
            {t("Cancel")}
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {t("Apply")}
          </Button>
        </Box>
      }
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t("Current")}: {currentValue}
        </Typography>
        <ToggleButtonGroup
          value={type}
          exclusive
          onChange={(_, v) => v !== null && setType(v)}
          sx={{ mb: 2 }}
        >
          <ToggleButton
            value="+"
            color="success"
            sx={{ px: 3, fontSize: "1.2rem", fontWeight: "bold" }}
          >
            +
          </ToggleButton>
          <ToggleButton
            value="-"
            color="error"
            sx={{ px: 3, fontSize: "1.2rem", fontWeight: "bold" }}
          >
            -
          </ToggleButton>
        </ToggleButtonGroup>
        <TextField
          fullWidth
          type="number"
          label={t("Amount")}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
        />
      </Box>
    </ActorEditModal>
  );
}

export default function PcNumbers({ pc, isInteractive = false, onUpdate }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const [zenitOpen, setZenitOpen] = useState(false);

  const handleZenitApply = (delta) => {
    onUpdate?.((prev) => ({
      ...prev,
      info: {
        ...prev.info,
        zenit: Math.max(0, (parseInt(prev.info.zenit, 10) || 0) + delta),
      },
    }));
  };

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
        display: "flex",
        overflow: "hidden",
      }}
    >
      <Grid
        container
        spacing={{ xs: 1, md: 2 }}
        sx={{ padding: "1em", alignItems: "center", width: "100%" }}
      >
        <Grid size={12}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: isInteractive ? "pointer" : "default",
            }}
            onClick={isInteractive ? () => setZenitOpen(true) : undefined}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: "0.8rem", md: "1rem" },
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                {t("Zenit")}
              </Typography>
              <img
                src={zenitIcon}
                alt="Zenit"
                style={{ width: "18px", height: "18px" }}
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {pc.info.zenit}
            </Typography>
          </Box>
        </Grid>
      </Grid>
      {isInteractive && (
        <ZenitDialog
          open={zenitOpen}
          onClose={() => setZenitOpen(false)}
          currentValue={pc.info.zenit}
          onApply={handleZenitApply}
          t={t}
        />
      )}
    </Paper>
  );
}
