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
import { NonStaticSpellCard } from "../../compendium/ItemCards";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

export default function PlayerMagichant({ player }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [selectedTone, setSelectedTone] = useState(null);
  const [_selectedMagichantSpell, setSelectedMagichantSpell] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = (magichantSpell, tone) => {
    setSelectedTone(tone);
    setSelectedMagichantSpell(magichantSpell);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedTone(null);
    setSelectedMagichantSpell(null);
  };

  /* All magichant spells from all classes */
  const magichantSpells = player.classes
    .flatMap((c) => c.spells.map((spell) => ({ ...spell, className: c.name })))
    .filter(
      (spell) =>
        spell !== undefined &&
        spell.spellType === "magichant" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
    )
    .sort((a, b) => a.className.localeCompare(b.className));

  const volumes = [
    {
      name: "magichant_volume_low",
      mp: 10,
      target: "magichant_volume_low_target",
    },
    {
      name: "magichant_volume_medium",
      mp: 20,
      target: "magichant_volume_medium_target",
    },
    {
      name: "magichant_volume_high",
      mp: 30,
      target: "magichant_volume_high_target",
    },
  ];

  const inlineStyles = {
    margin: 0,
    padding: 0,
  };

  const components = {
    p: ({ _node, ...props }) => <p style={inlineStyles} {...props} />,
  };

  return (
    <>
      {magichantSpells.length > 0 && (
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
              {t("Magichant")}
            </Typography>
            <Grid container spacing={1} sx={{ padding: "1em", flex: 1, width: "100%" }}>
              {magichantSpells.map((magichantSpell, msIndex) => (
                <React.Fragment key={msIndex}>
                  {/* VOLUMES GRID */}
                  <Grid  sx={{ mb: 2 }} size={12}>
                    <div
                      sx={{
                        backgroundColor: primary,
                        fontFamily: "Antonio",
                        fontWeight: "normal",
                        fontSize: "1.1em",
                        padding: "2px 17px",
                        color: custom.white,
                        textTransform: "uppercase",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Grid container sx={{ flexGrow: 1 }}>
                        <Grid  sx={{ display: "flex", alignItems: "center", justifyContent: "left", minHeight: "40px" }} size={3}>
                          <Typography variant="h3" sx={{ flexGrow: 1, marginRight: "5px", fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}>
                            {t("magichant_volume")}
                          </Typography>
                        </Grid>
                        <Grid  sx={{ display: "flex", alignItems: "center", justifyContent: "center" }} size={2}>
                          <Typography variant="h3" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}>
                            {t("MP")}
                          </Typography>
                        </Grid>
                        <Grid  sx={{ display: "flex", alignItems: "center", justifyContent: "center" }} size={7}>
                          <Typography variant="h3" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}>
                            {t("Target")}
                          </Typography>
                        </Grid>
                      </Grid>
                    </div>
                    {volumes.map((volume, i) => (
                      <Grid container sx={{ justifyContent: "flex-start", background: "transparent", padding: "3px 17px", borderBottom: `1px solid ${secondary}` }} key={i}>
                        <Grid container sx={{ flexGrow: 1 }}>
                          <Grid size={3} sx={{ display: "flex", alignItems: "center", justifyContent: "left" }}>
                            <Typography sx={{ fontWeight: "bold", flexGrow: 1, marginRight: "5px", fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}>
                              {t(volume.name)}
                            </Typography>
                          </Grid>
                          <Grid  sx={{ display: "flex", alignItems: "center", justifyContent: "center" }} size={2}>
                            <ReactMarkdown components={components}>{volume.mp + ""}</ReactMarkdown>
                          </Grid>
                          <Grid  sx={{ display: "flex", alignItems: "center", justifyContent: "center" }} size={7}>
                            <ReactMarkdown components={components}>{t(volume.target)}</ReactMarkdown>
                          </Grid>
                        </Grid>
                      </Grid>
                    ))}
                  </Grid>

                  {/* KEYS GRID */}
                  <Grid  sx={{ mb: 2 }} size={12}>
                    <div
                      sx={{
                        backgroundColor: primary,
                        fontFamily: "Antonio",
                        fontWeight: "normal",
                        fontSize: "1.1em",
                        padding: "2px 17px",
                        color: custom.white,
                        textTransform: "uppercase",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Grid container sx={{ flexGrow: 1 }}>
                        <Grid  sx={{ display: "flex", alignItems: "center", justifyContent: "left", minHeight: "40px" }} size={3}>
                          <Typography variant="h3" sx={{ flexGrow: 1, marginRight: "5px", fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}>
                            {t("magichant_key")}
                          </Typography>
                        </Grid>
                        <Grid
                          sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                          size={{
                            xs: 2,
                            sm: 3
                          }}>
                          <Typography variant="h3" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}>
                            {t("magichant_type")}
                          </Typography>
                        </Grid>
                        <Grid  sx={{ display: "flex", alignItems: "center", justifyContent: "center" }} size={2}>
                          <Typography variant="h3" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}>
                            {t("magichant_status_effect")}
                          </Typography>
                        </Grid>
                        <Grid
                          sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                          size={{
                            xs: 3,
                            sm: 2
                          }}>
                          <Typography variant="h3" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}>
                            {t("magichant_attribute")}
                          </Typography>
                        </Grid>
                        <Grid  sx={{ display: "flex", alignItems: "center", justifyContent: "center" }} size={2}>
                          <Typography variant="h3" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}>
                            {t("magichant_recovery")}
                          </Typography>
                        </Grid>
                      </Grid>
                    </div>
                    {magichantSpell.keys && magichantSpell.keys.length === 0 ? (
                      <Typography sx={{ padding: "3px 17px", textAlign: "center", color: primary, borderBottom: `1px solid ${secondary}`, fontStyle: "italic" }}>
                        {t("magichant_empty_keys")}
                      </Typography>
                    ) : (
                      magichantSpell.keys.map((chantKey, i) => (
                        <Grid container sx={{ justifyContent: "flex-start", background: "transparent", padding: "3px 17px", borderBottom: `1px solid ${secondary}` }} key={i}>
                          <Grid container sx={{ flexGrow: 1 }}>
                            <Grid  sx={{ display: "flex", alignItems: "center", justifyContent: "left" }} size={3}>
                              <Typography sx={{ fontWeight: "bold", flexGrow: 1, marginRight: "5px", fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}>
                                {chantKey.name === "magichant_custom_name" ? chantKey.customName : t(chantKey.name)}
                              </Typography>
                            </Grid>
                            <Grid
                              sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                              size={{
                                xs: 2,
                                sm: 3
                              }}>
                              <ReactMarkdown components={components}>{chantKey.name === "magichant_custom_name" ? chantKey.type : t(chantKey.type)}</ReactMarkdown>
                            </Grid>
                            <Grid  sx={{ display: "flex", alignItems: "center", justifyContent: "center" }} size={2}>
                              <ReactMarkdown components={components}>{chantKey.name === "magichant_custom_name" ? chantKey.status : t(chantKey.status)}</ReactMarkdown>
                            </Grid>
                            <Grid
                              sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                              size={{
                                xs: 3,
                                sm: 2
                              }}>
                              <ReactMarkdown components={components}>{chantKey.name === "magichant_custom_name" ? chantKey.attribute : t(chantKey.attribute)}</ReactMarkdown>
                            </Grid>
                            <Grid  sx={{ display: "flex", alignItems: "center", justifyContent: "center" }} size={2}>
                              <ReactMarkdown components={components}>{chantKey.name === "magichant_custom_name" ? chantKey.recovery : t(chantKey.recovery)}</ReactMarkdown>
                            </Grid>
                          </Grid>
                        </Grid>
                      ))
                    )}
                  </Grid>

                  {/* TONES AS CARDS */}
                  <Grid  container spacing={1} size={12}>
                    {magichantSpell.tones && magichantSpell.tones.map((tone, tIndex) => (
                      <Grid
                  container
                  spacing={0}
                  key={`${msIndex}-${tIndex}`}
                        sx={{ display: "flex", alignItems: "stretch", maxHeight: "40px" }}
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
                            {tone.name === "magichant_custom_name" ? tone.customName : t(tone.name)}
                          </Typography>
                        </Grid>
                        <Grid sx={{ display: "flex", alignItems: "stretch", maxHeight: "40px" }} size={2}>
                          <div
                            id="spell-right-controls"
                            sx={{
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
                                onClick={() => handleOpenModal(magichantSpell, tone)}
                              >
                                <Info />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </Grid>
                      </Grid>
                    ))}
                  </Grid>
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
                {selectedTone && (
                  <NonStaticSpellCard item={{
                    ...selectedTone,
                    spellType: "magichant",
                    name: selectedTone.name === "magichant_custom_name" ? selectedTone.customName : selectedTone.name,
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
