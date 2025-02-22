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
import SpellSymbolist from "../spells/SpellSymbolist";

export default function PlayerSymbol({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = (sym) => {
    setSelectedSymbol(sym);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedSymbol(null);
  };

  /* All symbol spells from all classes */
  const symbolSpells = player.classes
    .flatMap((c) => c.spells.map((spell) => ({ ...spell, className: c.name })))
    .filter(
      (spell) =>
        spell !== undefined &&
        spell.spellType === "symbol" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
    )
    .sort((a, b) => a.className.localeCompare(b.className));

  return (
    <>
      {symbolSpells.length > 0 && (
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
                color: ternary,
                borderRadius: "0 8px 8px 0",
                transform: "rotate(180deg)",
                fontSize: "2em",
              }}
              align="center"
            >
              {t("symbol_symbols")}
            </Typography>
            <Grid container spacing={1} sx={{ padding: "1em" }}>
              {symbolSpells.map((sym, index) => (
                <Grid
                  item
                  container
                  xs={12}
                  md={6}
                  key={index}
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
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      {t("symbol_symbol") + " - " + t(sym.className)}
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
                          onClick={() => handleOpenModal(sym)}
                        >
                          <Info />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </Grid>
                </Grid>
              ))}
            </Grid>
            <Dialog
              open={openModal}
              onClose={handleCloseModal}
              PaperProps={{
                sx: {
                  width: "80%",
                  maxWidth: "lg",
                },
              }}
            >
              <DialogContent>
                {selectedSymbol !== null && (
                  <SpellSymbolist
                    symbol={selectedSymbol}
                    isEditMode={false}
                  />
                )}
              </DialogContent>
              <DialogActions>
                <Button variant="contained" onClick={handleCloseModal}>
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
