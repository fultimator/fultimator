import React, { useState } from "react";
import {
  Grid,
  Typography,
  Paper,
  IconButton,
  Button,
  Tooltip,
  Divider,
  Dialog,
  DialogContent,
  DialogActions,
  Chip,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import {
  Info,
  Air,
  Terrain,
  LocalFireDepartment,
  ElectricBolt,
  Water,
} from "@mui/icons-material";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import { NonStaticSpellCard } from "../../compendium/ItemCards";
import { buildInvokerAvailableInvocations } from "../spells/invokerUtils";

export default function PlayerInvoker({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [selectedInvocation, setSelectedInvocation] = useState(null);
  const [selectedInvokerSpell, setSelectedInvokerSpell] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = (invokerSpell, invocation) => {
    setSelectedInvocation(invocation);
    setSelectedInvokerSpell(invokerSpell);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedInvocation(null);
    setSelectedInvokerSpell(null);
  };

  const handleWellspringToggle = (invokerSpell, wellspring) => {
    if (!setPlayer) return;
    setPlayer((prevPlayer) => {
      const newClasses = prevPlayer.classes.map((cls) => {
        if (cls.name === invokerSpell.className) {
          const newSpells = cls.spells.map((spell) => {
            if (spell.name === invokerSpell.name) {
              let activeWellsprings = [...(spell.activeWellsprings || [])];
              if (activeWellsprings.includes(wellspring)) {
                activeWellsprings = activeWellsprings.filter((w) => w !== wellspring);
              } else {
                if (activeWellsprings.length >= 2) {
                  activeWellsprings.shift();
                }
                activeWellsprings.push(wellspring);
              }
              return { ...spell, activeWellsprings };
            }
            return spell;
          });
          return { ...cls, spells: newSpells };
        }
        return cls;
      });
      return { ...prevPlayer, classes: newClasses };
    });
  };

  /* All invoker spells from all classes */
  const invokerSpells = player.classes
    .flatMap((c) => c.spells.map((spell) => ({ ...spell, className: c.name })))
    .filter(
      (spell) =>
        spell !== undefined &&
        spell.spellType === "invocation" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
    )
    .sort((a, b) => a.className.localeCompare(b.className));

  const getWellspringColor = (wellspring) => {
    const colorMap = {
      Air: "#87cfebb9",
      Earth: "#8B4513",
      Fire: "#FF4500",
      Lightning: "#ffd900bb",
      Water: "#4682B4"
    };
    return colorMap[wellspring] || primary;
  };

  const wellspringList = [
    { name: "Air", icon: Air },
    { name: "Earth", icon: Terrain },
    { name: "Fire", icon: LocalFireDepartment },
    { name: "Lightning", icon: ElectricBolt },
    { name: "Water", icon: Water },
  ];

  return (
    <>
      {invokerSpells.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Paper
            elevation={3}
            sx={{
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
              display: "flex",
            }}
          >
            <Typography
              variant="h1"
              sx={{
                writingMode: "vertical-lr",
                textTransform: "uppercase",
                marginLeft: "-1px",
                marginRight: "10px",
                marginTop: "-1px",
                marginBottom: "-1px",
                paddingY: "10px",
                backgroundColor: primary,
                color: custom.white,
                borderRadius: "0 8px 8px 0",
                transform: "rotate(180deg)",
                fontSize: "2em",
              }}
              align="center"
            >
              {t("Invoker")}
            </Typography>
            <Grid container spacing={1} sx={{ padding: "1em" }}>
              {invokerSpells.map((invokerSpell, isIndex) => {
                const availableInvocations =
                  invokerSpell.availableInvocations && invokerSpell.availableInvocations.length > 0
                    ? invokerSpell.availableInvocations
                    : buildInvokerAvailableInvocations(invokerSpell.skillLevel);
                return (
                <React.Fragment key={isIndex}>
                  {/* Wellspring Selection Section */}
                  <Grid item xs={12} sx={{ mb: 2 }}>
                    <Typography variant="h3" sx={{ fontWeight: "bold", textTransform: "uppercase", mb: 1 }}>
                      {t("invoker_invocation_active_wellspring")} - {t(invokerSpell.className)}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {wellspringList.map((wellspring) => {
                        const wellspringColor = getWellspringColor(wellspring.name);
                        const isActive = invokerSpell.activeWellsprings?.includes(wellspring.name) || false;
                        const isInnerWellspring = invokerSpell.innerWellspring && invokerSpell.chosenWellspring === wellspring.name;
                        const IconComponent = wellspring.icon;

                        return (
                          <Chip
                            key={wellspring.name}
                            label={t(`invoker_${wellspring.name.toLowerCase()}`)}
                            icon={<IconComponent />}
                            onClick={isInnerWellspring || !setPlayer ? undefined : () => handleWellspringToggle(invokerSpell, wellspring.name)}
                            variant={isActive || isInnerWellspring ? "filled" : "outlined"}
                            sx={{
                              backgroundColor: isActive || isInnerWellspring ? wellspringColor : "transparent",
                              color: (isActive || isInnerWellspring) 
                                ? (wellspring.name === 'Air' || wellspring.name === 'Lightning' ? 'black !important' : 'white !important') 
                                : theme.palette.text.primary,
                              borderColor: isInnerWellspring ? "#4CAF50" : wellspringColor,
                              borderWidth: isActive || isInnerWellspring ? "2px" : "1px",
                              fontWeight: isActive || isInnerWellspring ? "bold" : "normal",
                              cursor: isInnerWellspring || !setPlayer ? "default" : "pointer",
                              "& .MuiChip-icon": {
                                color: (isActive || isInnerWellspring) ? (wellspring.name === 'Air' || wellspring.name === 'Lightning' ? 'black' : 'white') : wellspringColor,
                              },
                              "&:hover": {
                                backgroundColor: isInnerWellspring ? wellspringColor : isActive ? wellspringColor : `${wellspringColor}20`,
                                color: (isActive || isInnerWellspring) 
                                  ? (wellspring.name === 'Air' || wellspring.name === 'Lightning' ? 'black !important' : 'white !important') 
                                  : theme.palette.text.primary,
                              },
                              ...(isInnerWellspring && {
                                boxShadow: `0 0 0 3px #4CAF50, 0 0 8px rgba(76, 175, 80, 0.4)`,
                                border: "2px solid #2E7D32",
                              }),
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Grid>

                  {/* Available Invocations */}
                  {availableInvocations.length === 0 ? (
                    <Grid item xs={12}>
                      <Typography sx={{ fontStyle: "italic", color: "text.secondary" }}>
                        {t("invoker_no_invocation_warning")}
                      </Typography>
                    </Grid>
                  ) : (
                    availableInvocations
                      .filter((invocation) => {
                        if (invokerSpell.activeWellsprings?.includes(invocation.wellspring)) return true;
                        if (invokerSpell.innerWellspring && invokerSpell.chosenWellspring === invocation.wellspring) return true;
                        return false;
                      })
                      .map((invocation, iIndex) => (
                        <Grid
                          item
                          container
                          xs={12}
                          md={6}
                          key={`${isIndex}-${iIndex}`}
                          sx={{ display: "flex", alignItems: "stretch" }}
                        >
                          <Grid item xs={10} sx={{ display: "flex" }}>
                            <Typography
                              id="spell-left-name"
                              variant="h2"
                              sx={{
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                backgroundColor: primary,
                                padding: "5px",
                                paddingLeft: "10px",
                                color: "#fff",
                                borderRadius: "8px 0 0 8px",
                                borderLeft: `6px solid ${getWellspringColor(invocation.wellspring)}`,
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                              }}
                            >
                              {t(invocation.name)}
                            </Typography>
                          </Grid>
                          <Grid
                            item
                            xs={2}
                            sx={{ display: "flex", alignItems: "stretch" }}
                          >
                            <div
                              id="spell-right-controls"
                              style={{
                                padding: "10px",
                                backgroundColor: ternary,
                                borderRadius: "0 8px 8px 0",
                                marginRight: "15px",
                                display: "flex",
                                alignItems: "center",
                                flexDirection: "row",
                              }}
                              className="spell-right-controls"
                            >
                              <Tooltip title={t("Info")}>
                                <IconButton
                                  sx={{ padding: "0px" }}
                                  onClick={() => handleOpenModal(invokerSpell, invocation)}
                                >
                                  <Info />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </Grid>
                        </Grid>
                      ))
                  )}
                </React.Fragment>
                );
              })}
            </Grid>
            <Dialog
              open={openModal}
              onClose={handleCloseModal}
              PaperProps={{ sx: { width: { xs: "90%", md: "80%" } } }}
            >
              <DialogContent sx={{ p: 0 }}>
                {selectedInvocation && (
                  <NonStaticSpellCard item={{
                    ...selectedInvocation,
                    spellType: "invocation",
                  }} />
                )}
              </DialogContent>
              <DialogActions>
                <Button variant="contained" color="primary" onClick={handleCloseModal}>
                  OK
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </>
      )}
    </>
  );
}
