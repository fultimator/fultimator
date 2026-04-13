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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { Info } from "@mui/icons-material";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import { NonStaticSpellCard } from "../../compendium/ItemCards";

export default function PlayerTherioforms({ player }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [selectedTherioform, setSelectedTherioform] = useState(null);
  const [selectedMutantSpell, setSelectedMutantSpell] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = (mutantSpell, therioform) => {
    setSelectedTherioform(therioform);
    setSelectedMutantSpell(mutantSpell);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedTherioform(null);
    setSelectedMutantSpell(null);
  };

  /* All therioform spells from all classes */
  const therioformSpells = player.classes
    .flatMap((c) => c.spells.map((spell) => ({ ...spell, className: c.name })))
    .filter(
      (spell) =>
        spell !== undefined &&
        spell.spellType === "therioform" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
    )
    .sort((a, b) => a.className.localeCompare(b.className));

  return (
    <>
      {therioformSpells.length > 0 && (
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
              {t("mutant_therioforms")}
            </Typography>
            <Grid container spacing={1} sx={{ padding: "1em" }}>
              {therioformSpells.map((mutantSpell, msIndex) => (
                <React.Fragment key={msIndex}>
                  {mutantSpell.therioforms && mutantSpell.therioforms.map((therioform, tIndex) => (
                    <Grid
                      container
                      key={`${msIndex}-${tIndex}`}
                      sx={{ display: "flex", alignItems: "stretch" }}
                      size={{
                        xs: 12,
                        md: 6
                      }}>
                      <Grid  sx={{ display: "flex" }} size={10}>
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
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          {therioform.name === "mutant_therioform_custom_name" ? therioform.customName : t(therioform.name)}
                        </Typography>
                      </Grid>
                      <Grid sx={{ display: "flex", alignItems: "stretch" }} size={2}>
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
                              onClick={() => handleOpenModal(mutantSpell, therioform)}
                            >
                              <Info />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </Grid>
                    </Grid>
                  ))}
                </React.Fragment>
              ))}
            </Grid>
            <Dialog
              open={openModal}
              onClose={handleCloseModal}
              slotProps={{
                paper: { sx: { width: { xs: "90%", md: "80%" } } }
              }}
            >
              <DialogContent sx={{ p: 0 }}>
                {selectedTherioform && (
                  <NonStaticSpellCard item={{
                    ...selectedTherioform,
                    spellType: "therioform",
                    name: selectedTherioform.name === "mutant_therioform_custom_name" ? selectedTherioform.customName : selectedTherioform.name,
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
