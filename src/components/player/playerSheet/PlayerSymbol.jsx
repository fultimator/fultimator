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
import { SharedSymbolCard } from "../../shared/itemCards";

export default function PlayerSymbol({ player }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [_selectedSymbolSpell, setSelectedSymbolSpell] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = (symbolSpell, sym) => {
    setSelectedSymbol(sym);
    setSelectedSymbolSpell(symbolSpell);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedSymbol(null);
    setSelectedSymbolSpell(null);
  };

  /* All symbol spells from all classes */
  const symbolSpells = player.classes
    .flatMap((c) => c.spells.map((spell) => ({ ...spell, className: c.name })))
    .filter(
      (spell) =>
        spell !== undefined &&
        spell.spellType === "symbol" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined),
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
                color: custom.white,
                borderRadius: "0 8px 8px 0",
                transform: "rotate(180deg)",
                fontSize: "2em",
              }}
              align="center"
            >
              {t("symbol_symbols")}
            </Typography>
            <Grid
              container
              spacing={1}
              sx={{ padding: "1em", flex: 1, width: "100%" }}
            >
              {symbolSpells.map((symbolSpell, ssIndex) => (
                <React.Fragment key={ssIndex}>
                  {/* Individual Symbols */}
                  {symbolSpell.symbols &&
                    symbolSpell.symbols.map((sym, sIndex) => (
                      <Grid
                        container
                        spacing={0}
                        key={`${ssIndex}-${sIndex}`}
                        sx={{
                          display: "flex",
                          alignItems: "stretch",
                          maxHeight: "40px",
                        }}
                        size={{
                          xs: 12,
                          md: 6,
                        }}
                      >
                        <Grid sx={{ display: "flex" }} size={10}>
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
                            {sym.name === "symbol_custom_name"
                              ? sym.customName
                              : t(sym.name)}
                          </Typography>
                        </Grid>
                        <Grid
                          sx={{
                            display: "flex",
                            alignItems: "stretch",
                            maxHeight: "40px",
                          }}
                          size={2}
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
                                onClick={() =>
                                  handleOpenModal(symbolSpell, sym)
                                }
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
                paper: { sx: { width: { xs: "90%", md: "80%" } } },
              }}
            >
              <DialogContent sx={{ p: 0 }}>
                {selectedSymbol && (
                  <SharedSymbolCard
                    item={{
                      ...selectedSymbol,
                      spellType: "symbol",
                      name:
                        selectedSymbol.name === "symbol_custom_name"
                          ? selectedSymbol.customName
                          : selectedSymbol.name,
                    }}
                  />
                )}
              </DialogContent>
              <DialogActions>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCloseModal}
                >
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
