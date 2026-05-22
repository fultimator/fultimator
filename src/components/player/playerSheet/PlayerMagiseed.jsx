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
  Box,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { Info, ChatOutlined } from "@mui/icons-material";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import { useChatMessagesStore } from "../../../store/chatMessagesStore";
import { SharedMagiseedCard } from "../../shared/itemCards";
import ItemNameRow from "./ItemNameRow";
import Clock from "./Clock";
import { magiseeds } from "../../../libs/floralistMagiseedData";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ReactMarkdown from "react-markdown";
import { useNumericClock } from "../../../hooks/useClock";

function MagiseedClockRow({ magiseedSpell, setPlayer, isEditMode, t, theme, primary }) {
  const clockValue = magiseedSpell.growthClock || 0;

  const persistClock = (newValue) => {
    if (!setPlayer) return;
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) =>
        cls.name === magiseedSpell.className
          ? {
            ...cls,
            spells: cls.spells.map((spell) =>
              spell.spellType === "magiseed"
                ? { ...spell, growthClock: newValue }
                : spell,
            ),
          }
          : cls,
      ),
    }));
  };

  const { state, set, increment, decrement, reset } = useNumericClock(4, clockValue, persistClock);
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
          <Stack direction="row" spacing={0.5} sx={{ mt: 1, justifyContent: "center" }}>
            <Tooltip title={t("Decrement")} arrow>
              <IconButton color="primary" onClick={decrement} size="small" sx={{ p: 0.25 }}>
                <RemoveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("Reset")} arrow>
              <IconButton color="primary" onClick={reset} size="small" sx={{ p: 0.25 }}>
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("Increment")} arrow>
              <IconButton color="primary" onClick={increment} size="small" sx={{ p: 0.25 }}>
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

export default function PlayerMagiseed({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [selectedSeed, setSelectedSeed] = useState(null);
  const [_selectedMagiseedSpell, setSelectedMagiseedSpell] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = (magiseedSpell, seed) => {
    setSelectedSeed(seed);
    setSelectedMagiseedSpell(magiseedSpell);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedSeed(null);
    setSelectedMagiseedSpell(null);
  };

  const sendToChat = (magiseedSpell, seed) => {
    addMessage({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      speaker: player?.name || "Player",
      kind: "display",
      itemType: "spell",
      name: seed.customName || t(seed.name),
      tags: [t("Magiseed"), magiseedSpell.className || t("Unknown")],
      description: seed.description || "",
    });
  };

  /* All magiseed spells from all classes */
  const magiseedSpells = player.classes
    .flatMap((c) => c.spells.map((spell) => ({ ...spell, className: c.name })))
    .filter(
      (spell) =>
        spell !== undefined &&
        spell.spellType === "magiseed" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined),
    )
    .sort((a, b) => a.className.localeCompare(b.className));

  const getCurrentEffect = (magiseedSpell) => {
    const currentMagiseed = magiseedSpell.currentMagiseed;
    const growthClock = magiseedSpell.growthClock || 0;
    if (!currentMagiseed) return null;

    const magiseedTemplate = magiseeds.find(
      (m) => m.name === currentMagiseed.name,
    );
    if (!magiseedTemplate) return null;

    const effectKey = Math.min(growthClock, 3);
    const effect =
      currentMagiseed.effects?.[effectKey] ||
      magiseedTemplate.effects?.[effectKey];

    return effect ? t(effect) : null;
  };

  return (
    <>
      {magiseedSpells.length > 0 && (
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
              {t("magiseed_garden")}
            </Typography>
            <Grid
              container
              spacing={1}
              sx={{ padding: "1em", flex: 1, width: "100%" }}
            >
              {magiseedSpells.map((magiseedSpell, msIndex) => (
                <React.Fragment key={msIndex}>
                  {/* Growth Clock Section */}
                  <Grid sx={{ mb: 2 }} size={12}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        mb: 1,
                      }}
                    >
                      {t("magiseed_growth_clock")} -{" "}
                      {t(magiseedSpell.className)}
                    </Typography>
                    <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
                      {magiseedSpell.currentMagiseed
                        ? magiseedSpell.currentMagiseed.customName ||
                        t(magiseedSpell.currentMagiseed.name)
                        : t("magiseed_no_magiseed")}
                    </Typography>
                    <MagiseedClockRow
                      magiseedSpell={magiseedSpell}
                      setPlayer={setPlayer}
                      isEditMode={isEditMode}
                      t={t}
                      theme={theme}
                      primary={primary}
                    />
                  </Grid>

                  {/* Current Effect */}
                  {magiseedSpell.currentMagiseed &&
                    getCurrentEffect(magiseedSpell) && (
                      <Grid sx={{ mb: 2 }} size={12}>
                        <Box
                          sx={{
                            p: 1.5,
                            backgroundColor: ternary + "20",
                            borderLeft: `4px solid ${primary}`,
                            borderRadius: "0 4px 4px 0",
                          }}
                        >
                          <Typography
                            variant="h4"
                            sx={{ fontWeight: "bold", mb: 1 }}
                          >
                            {t("magiseed_current_effect")} (T ={" "}
                            {magiseedSpell.growthClock || 0})
                          </Typography>
                          <ReactMarkdown components={{ p: "span" }}>
                            {getCurrentEffect(magiseedSpell)}
                          </ReactMarkdown>
                        </Box>
                      </Grid>
                    )}

                  {/* Available Magiseeds */}
                  {magiseedSpell.magiseeds &&
                    magiseedSpell.magiseeds.map((seed, sIndex) => (
                      <ItemNameRow
                        key={`${msIndex}-${sIndex}`}
                        name={
                          <>
                            {seed.customName || t(seed.name)}
                            {magiseedSpell.currentMagiseed &&
                              seed.name === magiseedSpell.currentMagiseed.name && (
                                <Typography
                                  component="span"
                                  variant="h3"
                                  sx={{
                                    ml: 1,
                                    fontSize: "0.8em",
                                    fontStyle: "italic",
                                  }}
                                >
                                  ({t("magiseed_plant_in_garden")})
                                </Typography>
                              )}
                          </>
                        }
                      >
                        <Tooltip title={t("Info")}>
                          <IconButton
                            sx={{ padding: "0px" }}
                            onClick={() => handleOpenModal(magiseedSpell, seed)}
                          >
                            <Info />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("Send to chat")}>
                          <IconButton
                            sx={{ padding: "0px", marginLeft: "5px" }}
                            onClick={() => sendToChat(magiseedSpell, seed)}
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
                {selectedSeed &&
                  (() => {
                    const template =
                      magiseeds.find((m) => m.name === selectedSeed.name) || {};
                    return (
                      <SharedMagiseedCard
                        item={{
                          ...template,
                          ...selectedSeed,
                          spellType: "magiseed",
                          name: selectedSeed.customName || selectedSeed.name,
                          description:
                            selectedSeed.description || template.description,
                          effects: selectedSeed.effects || template.effects,
                        }}
                      />
                    );
                  })()}
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
