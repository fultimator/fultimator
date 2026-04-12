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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { Info } from "@mui/icons-material";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import { NonStaticSpellCard } from "../../compendium/ItemCards";
import Clock from "./Clock";

export default function PlayerGift({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [selectedGift, setSelectedGift] = useState(null);
  const [selectedGiftSpell, setSelectedGiftSpell] = useState(null);
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

  /* All gift spells from all classes */
  const giftSpells = player.classes
    .flatMap((c) => c.spells.map((spell) => ({ ...spell, className: c.name })))
    .filter(
      (spell) =>
        spell !== undefined &&
        spell.spellType === "gift" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
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
            <Grid container spacing={1} sx={{ padding: "1em" }}>
              {giftSpells.map((giftSpell, gsIndex) => (
                <React.Fragment key={gsIndex}>
                  {/* Brainwave Clock Section */}
                  <Grid  sx={{ mb: 2 }} size={12}>
                    <Typography variant="h3" sx={{ fontWeight: "bold", textTransform: "uppercase", mb: 1 }}>
                      {t("esper_brainwave_clock")} - {t(giftSpell.className)}
                    </Typography>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid >
                        <Clock
                          numSections={4}
                          size={60}
                          state={getClockState(giftSpell.clock || 0)}
                          setState={(isEditMode || setPlayer) ? (newState) => {
                            const filledSections = newState.reduce((count, section) => count + (section ? 1 : 0), 0);
                            handleClockChange(giftSpell, filledSections);
                          } : undefined}
                          isCharacterSheet={!isEditMode && !setPlayer}
                          onReset={(isEditMode || setPlayer) ? () => handleClockChange(giftSpell, 0) : undefined}
                        />
                      </Grid>
                      <Grid  size="grow">
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
                        <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>
                          {giftSpell.clock || 0} / 4
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Individual Gifts */}
                  {giftSpell.gifts && giftSpell.gifts.map((gift, gIndex) => (
                    <Grid
                      container
                      key={`${gsIndex}-${gIndex}`}
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
                          {gift.name === "esper_gift_custom_name" ? gift.customName : t(gift.name)}
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
                              onClick={() => handleOpenModal(giftSpell, gift)}
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
              PaperProps={{ sx: { width: { xs: "90%", md: "80%" } } }}
            >
              <DialogContent sx={{ p: 0 }}>
                {selectedGift && (
                  <NonStaticSpellCard item={{
                    ...selectedGift,
                    spellType: "gift",
                    name: selectedGift.name === "esper_gift_custom_name" ? selectedGift.customName : selectedGift.name,
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
