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
import { Info, ChatOutlined } from "@mui/icons-material";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import { SharedSymbolCard } from "../../shared/itemCards";
import ItemNameRow from "./ItemNameRow";
import { useChatMessagesStore } from "../../../store/chatMessagesStore";

export default function PlayerSymbol({ player }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

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

  const sendToChat = (symbolSpell, sym) => {
    addMessage({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      speaker: player?.name || "Player",
      kind: "display",
      itemType: "spell",
      name: sym.name === "symbol_custom_name" ? sym.customName : t(sym.name),
      tags: [t("Symbol"), symbolSpell.className || t("Unknown")],
      description: sym.description || "",
    });
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
                      <ItemNameRow
                        key={`${ssIndex}-${sIndex}`}
                        name={sym.name === "symbol_custom_name" ? sym.customName : t(sym.name)}
                      >
                        <Tooltip title={t("Info")}>
                          <IconButton
                            sx={{ padding: "0px" }}
                            onClick={() => handleOpenModal(symbolSpell, sym)}
                          >
                            <Info />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("Send to chat")}>
                          <IconButton
                            sx={{ padding: "0px", marginLeft: "5px" }}
                            onClick={() => sendToChat(symbolSpell, sym)}
                          >
                            <ChatOutlined />
                          </IconButton>
                        </Tooltip>
                      </ItemNameRow>
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
