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
import { useNumericClock } from "../../../hooks/useClock";

function GiftClockRow({ giftSpell, setPlayer, isEditMode, t, theme, primary }) {
  const clockValue = giftSpell.clock || 0;

  const persistClock = (newValue) => {
    if (!setPlayer) return;
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) =>
        cls.name === giftSpell.className
          ? {
              ...cls,
              spells: cls.spells.map((spell) =>
                spell.name === giftSpell.name
                  ? { ...spell, clock: newValue }
                  : spell,
              ),
            }
          : cls,
      ),
    }));
  };

  const { state, set, increment, decrement, reset } = useNumericClock(
    4,
    clockValue,
    persistClock,
  );
  const canEdit = isEditMode || !!setPlayer;

  return (
    <Grid container sx={{ alignItems: "flex-start" }} spacing={2}>
      <Grid>
        <Clock
          numSections={4}
          size={60}
          state={state}
          setState={canEdit ? set : undefined}
          isCharacterSheet={!canEdit}
          onReset={canEdit ? reset : undefined}
        />
        {canEdit && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ mt: 1, justifyContent: "center" }}
          >
            <Tooltip title={t("Decrement")} arrow>
              <IconButton
                color="primary"
                onClick={decrement}
                size="small"
                sx={{ p: 0.25 }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("Reset")} arrow>
              <IconButton
                color="primary"
                onClick={reset}
                size="small"
                sx={{ p: 0.25 }}
              >
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("Increment")} arrow>
              <IconButton
                color="primary"
                onClick={increment}
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
          value={(clockValue / 4) * 100}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.palette.grey[300],
            "& .MuiLinearProgress-bar": { backgroundColor: primary },
          }}
        />
        <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>
          {clockValue} / 4
        </Typography>
      </Grid>
    </Grid>
  );
}

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
      name:
        gift.name === "esper_gift_custom_name" ? gift.customName : t(gift.name),
      tags: [t("Gift"), giftSpell.className || t("Unknown")],
      description: gift.description || "",
    });
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
                    <GiftClockRow
                      giftSpell={giftSpell}
                      setPlayer={setPlayer}
                      isEditMode={isEditMode}
                      t={t}
                      theme={theme}
                      primary={primary}
                    />
                  </Grid>

                  {/* Individual Gifts */}
                  {giftSpell.gifts &&
                    giftSpell.gifts.map((gift, gIndex) => (
                      <ItemNameRow
                        key={`${gsIndex}-${gIndex}`}
                        name={
                          gift.name === "esper_gift_custom_name"
                            ? gift.customName
                            : t(gift.name)
                        }
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
