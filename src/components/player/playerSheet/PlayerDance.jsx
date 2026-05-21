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
import { SharedDanceCard } from "../../shared/itemCards";
import ItemNameRow from "./ItemNameRow";
import { useChatMessagesStore } from "../../../store/chatMessagesStore";

export default function PlayerDance({ player }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  const [selectedDance, setSelectedDance] = useState(null);
  const [_selectedDanceSpell, setSelectedDanceSpell] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = (danceSpell, dance) => {
    setSelectedDance(dance);
    setSelectedDanceSpell(danceSpell);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedDance(null);
    setSelectedDanceSpell(null);
  };

  const sendToChat = (danceSpell, dance) => {
    addMessage({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      speaker: player?.name || "Player",
      kind: "display",
      itemType: "spell",
      name: dance.name === "dance_custom_name" ? dance.customName : t(dance.name),
      tags: [t("Dance"), danceSpell.className || t("Unknown")],
      description: dance.description || "",
    });
  };

  /* All dance spells from all classes */
  const danceSpells = player.classes
    .flatMap((c) => c.spells.map((spell) => ({ ...spell, className: c.name })))
    .filter(
      (spell) =>
        spell !== undefined &&
        spell.spellType === "dance" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined),
    )
    .sort((a, b) => a.className.localeCompare(b.className));

  return (
    <>
      {danceSpells.length > 0 && (
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
              {t("dance_dance")}
            </Typography>
            <Grid
              container
              spacing={1}
              sx={{ padding: "1em", flex: 1, width: "100%" }}
            >
              {danceSpells.map((danceSpell, dsIndex) => (
                <React.Fragment key={dsIndex}>
                  {danceSpell.dances &&
                    danceSpell.dances.map((dance, dIndex) => (
                      <ItemNameRow
                        key={`${dsIndex}-${dIndex}`}
                        name={dance.name === "dance_custom_name" ? dance.customName : t(dance.name)}
                      >
                        <Tooltip title={t("Info")}>
                          <IconButton
                            sx={{ padding: "0px" }}
                            onClick={() => handleOpenModal(danceSpell, dance)}
                          >
                            <Info />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("Send to chat")}>
                          <IconButton
                            sx={{ padding: "0px", marginLeft: "5px" }}
                            onClick={() => sendToChat(danceSpell, dance)}
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
                {selectedDance && (
                  <SharedDanceCard
                    item={{
                      ...selectedDance,
                      spellType: "dance",
                      name:
                        selectedDance.name === "dance_custom_name"
                          ? selectedDance.customName
                          : selectedDance.name,
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
