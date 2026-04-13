import React, { useState } from "react";
import {
  Paper,
  Grid,
  Typography,
  useMediaQuery,
  IconButton,
  TextField,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import ZenitIcon from "../../svgs/zenit.svg?react";
import ExpIcon from "../../svgs/exp.svg?react";
import FabulaIcon from "../../svgs/fabula.svg?react";

function ZenitDialog({ open, handleClose, currentValue, onApply, t }) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("+");

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(amount, 10) || 0;
    onApply(type === "+" ? val : -val);
    setAmount("");
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle variant="h4" sx={{ fontWeight: "bold", textAlign: "center", borderBottom: "1px solid #ddd", pb: 1 }}>
          {t("Update Zenit")}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 2, minWidth: 250 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t("Current")}: {currentValue}
          </Typography>
          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={(_, v) => v !== null && setType(v)}
            sx={{ mb: 2 }}
          >
            <ToggleButton value="+" color="success" sx={{ px: 3, fontSize: "1.2rem", fontWeight: "bold" }}>+</ToggleButton>
            <ToggleButton value="-" color="error" sx={{ px: 3, fontSize: "1.2rem", fontWeight: "bold" }}>-</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            fullWidth
            type="number"
            label={t("Amount")}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={handleClose} color="secondary" variant="contained">{t("Cancel")}</Button>
          <Button type="submit" variant="contained" color="primary">{t("Apply")}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function PlayerNumbers({ player, setPlayer, isEditMode, isOwner, isCharacterSheet }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [zenitOpen, setZenitOpen] = useState(false);

  const handleUpdate = (key, value) => {
    setPlayer((prev) => ({
      ...prev,
      info: { ...prev.info, [key]: value }
    }));
  };

  const handleIncrement = (key, delta) => {
    const current = parseInt(player.info[key], 10) || 0;
    handleUpdate(key, Math.max(0, current + delta));
  };

  return (
    <Paper
      elevation={3}
      sx={
        isCharacterSheet
          ? {
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
              display: "flex",
              boxShadow: "none",
            }
          : {
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
              display: "flex",
            }
      }
    >
      <Grid
        container
        spacing={{ xs: 1, md: 2 }}
        sx={{ padding: "1em", alignItems: "center", justifyContent: "center" }}
        direction={{ xs: "row", md: "row" }}
      >
        {/* Fabula Points */}
        <Grid
          size={{
            xs: 4,
            md: 4
          }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
              <Typography variant="h6" sx={{ fontSize: { xs: "0.8rem", md: "1rem" }, fontWeight: "bold", textTransform: "uppercase" }}>
                {t("Fabula Points")}
              </Typography>
              <FabulaIcon style={{ width: "18px", height: "18px" }} />
            </Box>
            {isEditMode ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton size="small" onClick={() => handleIncrement("fabulapoints", -1)}><Remove fontSize="small" /></IconButton>
                <TextField
                  value={player.info.fabulapoints}
                  onChange={(e) => handleUpdate("fabulapoints", parseInt(e.target.value, 10) || 0)}
                  size="small"
                  variant="standard"
                  slotProps={{
                    htmlInput: { style: { textAlign: "center", width: "40px", fontWeight: "bold", fontSize: "1.2rem" } }
                  }}
                />
                <IconButton size="small" onClick={() => handleIncrement("fabulapoints", 1)}><Add fontSize="small" /></IconButton>
              </Box>
            ) : (
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>{player.info.fabulapoints}</Typography>
            )}
          </Box>
        </Grid>

        {/* EXP */}
        <Grid
          size={{
            xs: 4,
            md: 4
          }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
              <Typography variant="h6" sx={{ fontSize: { xs: "0.8rem", md: "1rem" }, fontWeight: "bold", textTransform: "uppercase" }}>
                {isMobile ? "Exp" : t("Exp")}
              </Typography>
              <ExpIcon style={{ width: "18px", height: "18px" }} />
            </Box>
            {isEditMode ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton size="small" onClick={() => handleIncrement("exp", -1)}><Remove fontSize="small" /></IconButton>
                <TextField
                  value={player.info.exp}
                  onChange={(e) => handleUpdate("exp", parseInt(e.target.value, 10) || 0)}
                  size="small"
                  variant="standard"
                  slotProps={{
                    htmlInput: { style: { textAlign: "center", width: "40px", fontWeight: "bold", fontSize: "1.2rem" } }
                  }}
                />
                <IconButton size="small" onClick={() => handleIncrement("exp", 1)}><Add fontSize="small" /></IconButton>
              </Box>
            ) : (
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>{player.info.exp}</Typography>
            )}
          </Box>
        </Grid>

        {/* Zenit */}
        <Grid
          size={{
            xs: 4,
            md: 4
          }}>
          <Box 
            sx={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: isOwner ? "pointer" : "default" }}
            onClick={isOwner ? () => setZenitOpen(true) : undefined}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
              <Typography variant="h6" sx={{ fontSize: { xs: "0.8rem", md: "1rem" }, fontWeight: "bold", textTransform: "uppercase" }}>
                {t("Zenit")}
              </Typography>
              <ZenitIcon style={{ width: "18px", height: "18px" }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>{player.info.zenit}</Typography>
          </Box>
        </Grid>
      </Grid>
      <ZenitDialog
        open={zenitOpen}
        handleClose={() => setZenitOpen(false)}
        currentValue={player.info.zenit}
        onApply={(delta) => handleUpdate("zenit", Math.max(0, (parseInt(player.info.zenit, 10) || 0) + delta))}
        t={t}
      />
    </Paper>
  );
}
