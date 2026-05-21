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
  LinearProgress,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { Info, ChatOutlined } from "@mui/icons-material";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import { useChatMessagesStore } from "../../../store/chatMessagesStore";
import { SharedGiftCard } from "../../shared/itemCards";
import ItemNameRow from "./ItemNameRow";
import Clock from "./Clock";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

export default function PlayerGift({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  const [selectedGift, setSelectedGift] = useState(null);
  const [_selectedGiftSpell, setSelectedGiftSpell] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = (giftSpell, gift) => {
    setSelectedGift(gift);
    setSelectedGiftSpell(giftSpell);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedGift(null);
    setSelectedGiftSpell(null);
  };

  const sendToChat = (giftSpell, gift) => {
    addMessage({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      speaker: player?.name || "Player",
      kind: "display",
      itemType: "spell",
      name: gift.name === "esper_gift_custom_name" ? gift.customName : t(gift.name),
      tags: [t("Gift"), giftSpell.className || t("Unknown")],
      description: gift.description || "",
    });
  };

  const handleClockChange = (giftSpell, newClock) => {
    if (!setPlayer) return;
    setPlayer((prevPlayer) => {
      const newClasses = prevPlayer.classes.map((cls) => {
        if (cls.name === giftSpell.className) {
          const newSpells = cls.spells.map((spell) => {
            if (spell.name === giftSpell.name) {
              return { ...spell, clock: newClock };
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

  const incrementGiftClock = (giftSpell) => {
    const currentClock = giftSpell.clock || 0;
    if (currentClock < 4) {
      handleClockChange(giftSpell, currentClock + 1);
    }
  };

  const decrementGiftClock = (giftSpell) => {
    const currentClock = giftSpell.clock || 0;
    if (currentClock > 0) {
      handleClockChange(giftSpell, currentClock - 1);
    }
  };

  /* All gift spells from all classes */
  const giftSpells = player.classes
    .flatMap((c) => c.spells.map((spell) => ({ ...spell, className: c.name })))
    .filter(
      (spell) =>
        spell !== undefined &&
        spell.spellType === "gift" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined),
    )
    .sort((a, b) => a.className.localeCompare(b.className));

  const getClockState = (clock) => {
    const state = [false, false, false, false];
    for (let i = 0; i < clock && i < 4; i++) {
      state[i] = true;
    }
    return state;
  };

  const getClockProgress = (clock) => {
    return (clock / 4) * 100;
  };

  return (
    <>
      {giftSpells.length > 0 && (
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
              {t("esper_psychic_gifts")}
            </Typography>
            <Grid
              container
              spacing={1}
              sx={{ padding: "1em", flex: 1, width: "100%" }}
            >
              {giftSpells.map((giftSpell, gsIndex) => (
                <React.Fragment key={gsIndex}>
                  {/* Brainwave Clock Section */}
                  <Grid sx={{ mb: 2 }} size={12}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        mb: 1,
                      }}
                    >
                      {t("esper_brainwave_clock")} - {t(giftSpell.className)}
                    </Typography>
                    <Grid
                      container
                      sx={{ alignItems: "flex-start" }}
                      spacing={2}
                    >
                      <Grid>
                        <Clock
                          numSections={4}
                          size={60}
                          state={getClockState(giftSpell.clock || 0)}
                          setState={
                            isEditMode || setPlayer
                              ? (newState) => {
                                  const filledSections = newState.reduce(
                                    (count, section) =>
                                      count + (section ? 1 : 0),
                                    0,
                                  );
                                  handleClockChange(giftSpell, filledSections);
                                }
                              : undefined
                          }
                          isCharacterSheet={!isEditMode && !setPlayer}
                          onReset={
                            isEditMode || setPlayer
                              ? () => handleClockChange(giftSpell, 0)
                              : undefined
                          }
                        />
                        {(isEditMode || setPlayer) && (
                          <Stack
                            direction="row"
                            spacing={0.5}
                            sx={{ mt: 1, justifyContent: "center" }}
                          >
                            <Tooltip title={t("Decrement")} arrow>
                              <IconButton
                                color="primary"
                                onClick={() => decrementGiftClock(giftSpell)}
                                size="small"
                                sx={{ p: 0.25 }}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t("Reset")} arrow>
                              <IconButton
                                color="primary"
                                onClick={() => handleClockChange(giftSpell, 0)}
                                size="small"
                                sx={{ p: 0.25 }}
                              >
                                <RestartAltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t("Increment")} arrow>
                              <IconButton
                                color="primary"
                                onClick={() => incrementGiftClock(giftSpell)}
                                size="small"
                                sx={{ p: 0.25 }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )}
                      </Grid>
                      <Grid size="grow">
                        <LinearProgress
                          variant="determinate"
                          value={getClockProgress(giftSpell.clock || 0)}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: theme.palette.grey[300],
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: primary,
                            },
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ mt: 0.5, display: "block" }}
                        >
                          {giftSpell.clock || 0} / 4
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Individual Gifts */}
                  {giftSpell.gifts &&
                    giftSpell.gifts.map((gift, gIndex) => (
                      <ItemNameRow
                        key={`${gsIndex}-${gIndex}`}
                        name={gift.name === "esper_gift_custom_name" ? gift.customName : t(gift.name)}
                      >
                        <Tooltip title={t("Info")}>
                          <IconButton
                            sx={{ padding: "0px" }}
                            onClick={() => handleOpenModal(giftSpell, gift)}
                          >
                            <Info />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("Send to chat")}>
                          <IconButton
                            sx={{ padding: "0px", marginLeft: "5px" }}
                            onClick={() => sendToChat(giftSpell, gift)}
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
                {selectedGift && (
                  <SharedGiftCard
                    item={{
                      ...selectedGift,
                      spellType: "gift",
                      name:
                        selectedGift.name === "esper_gift_custom_name"
                          ? selectedGift.customName
                          : selectedGift.name,
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
