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
import { SharedTherioformCard } from "../../shared/itemCards";
import ItemNameRow from "./ItemNameRow";
import { useChatMessagesStore } from "../../../store/chatMessagesStore";

export default function PlayerTherioforms({ player }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  const [selectedTherioform, setSelectedTherioform] = useState(null);
  const [_selectedMutantSpell, setSelectedMutantSpell] = useState(null);
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

  const sendToChat = (mutantSpell, therioform) => {
    addMessage({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      speaker: player?.name || "Player",
      kind: "display",
      itemType: "spell",
      name: therioform.name === "mutant_therioform_custom_name" ? therioform.customName : t(therioform.name),
      tags: [t("Therioform"), mutantSpell.className || t("Unknown")],
      description: therioform.description || "",
    });
  };

  /* All therioform spells from all classes */
  const therioformSpells = player.classes
    .flatMap((c) => c.spells.map((spell) => ({ ...spell, className: c.name })))
    .filter(
      (spell) =>
        spell !== undefined &&
        spell.spellType === "therioform" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined),
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
            <Grid
              container
              spacing={1}
              sx={{ padding: "1em", flex: 1, width: "100%" }}
            >
              {therioformSpells.map((mutantSpell, msIndex) => (
                <React.Fragment key={msIndex}>
                  {mutantSpell.therioforms &&
                    mutantSpell.therioforms.map((therioform, tIndex) => (
                      <ItemNameRow
                        key={`${msIndex}-${tIndex}`}
                        name={therioform.name === "mutant_therioform_custom_name" ? therioform.customName : t(therioform.name)}
                      >
                        <Tooltip title={t("Info")}>
                          <IconButton
                            sx={{ padding: "0px" }}
                            onClick={() => handleOpenModal(mutantSpell, therioform)}
                          >
                            <Info />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("Send to chat")}>
                          <IconButton
                            sx={{ padding: "0px", marginLeft: "5px" }}
                            onClick={() => sendToChat(mutantSpell, therioform)}
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
                {selectedTherioform && (
                  <SharedTherioformCard
                    item={{
                      ...selectedTherioform,
                      spellType: "therioform",
                      name:
                        selectedTherioform.name ===
                        "mutant_therioform_custom_name"
                          ? selectedTherioform.customName
                          : selectedTherioform.name,
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
