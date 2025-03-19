// DamageHealDialog.js
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemText,
  FormControlLabel,
  Checkbox,
  Box,
} from "@mui/material";
import { IoShield } from "react-icons/io5";
import { TypeIcon } from "../../components/types";
import ReactMarkdown from "react-markdown";
import { t } from "../../translation/translate";
import { useTheme } from "@mui/material/styles";

const DamageHealDialog = ({
  open,
  handleClose,
  handleSubmit,
  handleChange,
  statType,
  npcClicked,
  typesList,
  value,
  setValue,
  isHealing,
  setIsHealing,
  damageType,
  setDamageType,
  isGuarding,
  setIsGuarding,
  inputRef,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // Calculate damage with affinities
  function calculateDamage(
    npc,
    damageValue,
    damageType = "",
    isGuarding = false
  ) {
    const affinities = npc.affinities || {};
    const damage = parseInt(damageValue, 10) || 0;

    // Default damage value
    let finalDamage = damage;

    if (affinities[damageType]) {
      switch (affinities[damageType]) {
        case "vu": // Vulnerable (x2)
          finalDamage = isGuarding ? damage : damage * 2;
          break;
        case "rs": // Resistant (x0.5, rounded down)
          finalDamage = Math.floor(damage * 0.5);
          break;
        case "ab": // Absorb (turn damage into healing)
          finalDamage = -damage;
          break;
        case "im": // Immune (no damage)
          finalDamage = 0;
          break;
        default:
          break;
      }
    } else if (isGuarding) {
      finalDamage = Math.floor(damage * 0.5);
    }

    if (isGuarding && damageType === "") {
      finalDamage = Math.floor(damage * 0.5);
    }

    return finalDamage;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        {statType === "HP" ? t("combat_sim_edit_hp") : t("combat_sim_edit_mp")}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 1,
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, mt: -2 }}>
            {npcClicked?.name}
          </Typography>
          <ToggleButtonGroup
            value={isHealing ? "heal" : "damage"}
            exclusive
            onChange={(event, newValue) => {
              if (newValue !== null) {
                setIsHealing(newValue === "heal");
              }
            }}
            sx={{ mb: 2 }}
          >
            <ToggleButton value="heal" color="success">
              {t("combat_sim_healing")}
            </ToggleButton>
            <ToggleButton value="damage" color="error">
              {t("combat_sim_damage")}
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            fullWidth
            type="text"
            label={t("combat_sim_amount")}
            value={value}
            onChange={handleChange}
            onBlur={() => setValue(value === "" ? "" : Number(value))}
            margin="normal"
            inputRef={inputRef}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              },
            }}
          />
          {statType === "HP" && !isHealing && (
            <>
              <FormControl
                fullWidth
                sx={{
                  mt: 2,
                  mb: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                <InputLabel id="damage-type-label">
                  {t("combat_sim_damage_type")}
                </InputLabel>
                <Select
                  label={t("combat_sim_damage_type")}
                  value={damageType}
                  onChange={(e) => {
                    setDamageType(e.target.value);
                  }}
                  sx={{
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: isDarkMode ? "#fff" : "primary",
                    },
                  }}
                >
                  <MenuItem value="">
                    <ListItemText>{t("combat_sim_none")}</ListItemText>
                  </MenuItem>
                  {typesList.map((type) => (
                    <MenuItem
                      key={type}
                      value={type}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        paddingY: "6px",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          minWidth: 70,
                        }}
                      >
                        <TypeIcon type={type} />
                        <ListItemText
                          sx={{
                            ml: 1,
                            marginBottom: 0,
                            textTransform: "capitalize",
                          }}
                        >
                          {t(type)}
                        </ListItemText>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isGuarding}
                    onChange={(e) => {
                      setIsGuarding(e.target.checked);
                    }}
                    sx={{
                      mt: 0,
                      "& .MuiSvgIcon-root": { fontSize: "1.5rem" },
                      "&.Mui-checked": {
                        color: isDarkMode
                          ? "white !important"
                          : "primary !important",
                      },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IoShield size={20} color={isGuarding ? "green" : "gray"} />
                    {t("combat_sim_is_guarding")}?
                  </Box>
                }
              />
              {npcClicked &&
                (damageType !== "" || isGuarding) &&
                value !== "" && (
                  <Typography variant="body2" sx={{ mt: 1, display: "inline" }}>
                    {t("combat_sim_calculated_damage")}:{" "}
                    <strong
                      style={{
                        color: (() => {
                          const calculated = calculateDamage(
                            npcClicked,
                            value,
                            damageType,
                            isGuarding
                          );
                          return calculated < 0 ? "green" : "#cc0000";
                        })(),
                      }}
                    >
                      <ReactMarkdown
                        components={{ p: (props) => <span {...props} /> }}
                      >
                        {(() => {
                          const calculated = calculateDamage(
                            npcClicked,
                            value,
                            damageType,
                            isGuarding
                          );
                          return calculated < 0
                            ? `${Math.abs(calculated)} ${damageType} healing`
                            : `${calculated} ${
                                damageType
                                  ? t(damageType + "_damage")
                                  : t("notype_damage")
                              }`;
                        })()}
                      </ReactMarkdown>
                    </strong>
                  </Typography>
                )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            onClick={handleClose}
            color={isDarkMode ? "white" : "primary"}
            sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
          >
            {t("Cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
          >
            {t("OK")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DamageHealDialog;
