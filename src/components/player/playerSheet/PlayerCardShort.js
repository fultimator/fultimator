import React from "react";
import { Paper, Grid, Typography, Divider, Card } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import avatar_image from "../../avatar.jpg";
import Diamond from "../../Diamond";
import powered_by_fu from "../../../routes/powered_by_fu.png";

export default function PlayerCardShort({
  player,
  isEditMode,
  isCharacterSheet,
  characterImage,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const isMobile = window.innerWidth < 900;

  /* player.armor.isEquipped (should be only one) */
  const equippedArmor = player.armor?.find((armor) => armor.isEquipped) || null;

  /* player.shields.isEquipped (should be only one) */
  const equippedShield =
    player.shields?.find((shield) => shield.isEquipped) || null;

  /* player.weapons.isEquipped (can be more than one) */
  const equippedWeapons =
    player.weapons?.filter((weapon) => weapon.isEquipped) || [];

  /* player.accessories.isEquipped (should be only one) */
  const equippedAccessory =
    player.accessories?.find((accessory) => accessory.isEquipped) || null;

  // Function to format item names
  const formatItemName = (item) =>
    item.name !== item.base.name
      ? `${item.name} (${t(item.base.name)})`
      : t(item.name);

  // Gather all equipped items
  const equippedItems = [
    ...equippedWeapons.map(formatItemName),
    equippedArmor ? formatItemName(equippedArmor) : null,
    equippedShield ? formatItemName(equippedShield) : null,
    equippedAccessory ? equippedAccessory.name : null,
  ].filter((item) => item !== null); // Filter out null values

  // Join all equipped items into a single line
  const equipmentText = equippedItems.join(", ");

  // Rogue - Dodge Skill Bonus
  const dodgeBonus =
    equippedShield === null &&
    (equippedArmor === null || equippedArmor.martial === false)
      ? player.classes
          .map((cls) => cls.skills)
          .flat()
          .filter((skill) => skill.specialSkill === "Dodge")
          .map((skill) => skill.currentLvl)
          .reduce((a, b) => a + b, 0)
      : 0;

  // Calculate DEF and MDEF
  const currDef =
    (equippedArmor !== null
      ? equippedArmor.martial
        ? equippedArmor.def
        : player.attributes.dexterity + equippedArmor.def
      : player.attributes.dexterity) +
    (equippedShield !== null ? equippedShield.def : 0) +
    (player.modifiers?.def || 0) +
    (equippedArmor !== null ? equippedArmor.defModifier || 0 : 0) +
    (equippedShield !== null ? equippedShield.defModifier || 0 : 0) +
    (equippedAccessory !== null ? equippedAccessory.defModifier || 0 : 0) +
    equippedWeapons.reduce(
      (total, weapon) => total + (weapon.defModifier || 0),
      0
    ) +
    dodgeBonus;

  const currMDef =
    (equippedArmor !== null
      ? player.attributes.insight + equippedArmor.mdef
      : player.attributes.insight) +
    (equippedShield !== null ? equippedShield.mdef : 0) +
    (player.modifiers?.mdef || 0) +
    (equippedArmor !== null ? equippedArmor.mDefModifier || 0 : 0) +
    (equippedShield !== null ? equippedShield.mDefModifier || 0 : 0) +
    (equippedAccessory !== null ? equippedAccessory.mDefModifier || 0 : 0) +
    equippedWeapons.reduce(
      (total, weapon) => total + (weapon.mDefModifier || 0),
      0
    );

  // Initialize INIT to 0
  const currInit =
    (equippedArmor !== null ? equippedArmor.init : 0) +
    (player.modifiers?.init || 0) +
    (equippedArmor !== null ? equippedArmor.initModifier || 0 : 0) +
    (equippedShield !== null ? equippedShield.initModifier || 0 : 0) +
    (equippedAccessory !== null ? equippedAccessory.initModifier || 0 : 0);

  return (
    <>
      <Card
        elevation={3}
        sx={{
          borderRadius: "8px",
          border: "2px solid",
          borderColor: secondary,
          boxShadow: "none",
        }}
      >
        <Grid container>
          <Grid
            item
            xs
            sx={{
              background: `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%);`,
              borderRight: "4px solid white",
              px: 2,
            }}
          >
            <Typography
              color="#fff"
              fontFamily="Antonio"
              fontSize="1.5rem"
              fontWeight="medium"
              sx={{ textTransform: "uppercase" }}
            >
              {player.name}
            </Typography>
          </Grid>
          <Grid
            item
            sx={{
              px: 2,
              py: 0.5,
              borderLeft: `2px solid ${primary} `,
              borderBottom: `2px solid ${primary} `,
              borderImage: `linear-gradient(45deg, ${secondary} , ${ternary}) 1;`,
            }}
          >
            <Typography
              fontFamily="Antonio"
              fontSize="1.25rem"
              fontWeight="medium"
              sx={{ textTransform: "uppercase" }}
            >
              {player.info.pronouns && (
                <>
                  {player.info.pronouns} <Diamond color={primary} />{" "}
                </>
              )}
              {t("Lvl")} {player.lvl}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={3} sm={3}>
            <div style={{ position: "relative" }}>
              <img
                src={
                  isCharacterSheet
                    ? characterImage
                      ? characterImage
                      : avatar_image
                    : player.info.imgurl
                    ? player.info.imgurl
                    : avatar_image
                }
                alt="Player Avatar"
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  objectFit: "cover",
                  marginBottom: "-6px",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <img
                src={powered_by_fu}
                alt="Powered by Fu"
                style={{
                  width: "100%",
                  height: "100%",
                  maxHeight: "9rem",
                  maxWidth: "9rem",
                  marginTop:"5px"
                }}
              />
            </div>
          </Grid>
          <Grid
            container
            item
            xs={9}
            sx={{ marginTop: "5px", marginX: "-5px" }}
          >
            <Grid item xs={12}>
              <Paper
                elevation={3}
                sx={{
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: secondary,
                  display: "flex",
                  marginRight: "0px",
                  boxShadow: "none",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    textTransform: "uppercase",
                    padding: "5px", // Adjust padding instead of margins
                    backgroundColor: primary,
                    color: ternary,
                    borderRadius: "8px 8px 0 0", // Rounded corners only at the top
                    fontSize: "1em",
                  }}
                  align="center"
                >
                  {t("Traits")}
                </Typography>
                <Grid container spacing={1} sx={{ padding: "0.3rem" }}>
                  <Grid item xs={12} md={12}>
                    <Typography variant="h4">
                      <span
                        style={{
                          fontWeight: "bolder",
                          fontSize: isMobile ? "0.8rem" : "1rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {t("Identity") + ": "}
                      </span>
                      <span
                        style={{
                          fontSize: isMobile ? "0.8rem" : "1rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {player.info.identity.length > 40
                          ? player.info.identity.slice(0, 40) + "..."
                          : player.info.identity}
                      </span>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h4">
                      <span
                        style={{
                          fontWeight: "bolder",
                          fontSize: isMobile ? "0.8rem" : "1rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {t("Theme") + ": "}
                      </span>
                      <span
                        style={{
                          fontSize: isMobile ? "0.8rem" : "1rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {player.info.theme && t(player.info.theme).length > 20
                          ? t(player.info.theme).slice(0, 20) + "..."
                          : t(player.info.theme)}
                      </span>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h4">
                      <span
                        style={{
                          fontWeight: "bolder",
                          fontSize: isMobile ? "0.8rem" : "1rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {t("Origin") + ": "}
                      </span>
                      <span
                        style={{
                          fontSize: isMobile ? "0.8rem" : "1rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {player.info.origin.length > 20
                          ? player.info.origin.slice(0, 20) + "..."
                          : player.info.origin}
                      </span>
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid
              container
              item
              xs={12}
              sx={{
                marginTop: "10px",
                padding: "0.5rem",
                borderRadius: "8px",
                border: "2px solid",
                borderColor: secondary,
              }}
              justifyContent="center"
              alignItems="center"
            >
              <Grid container item xs={4} justifyContent="center">
                <Typography variant="h2" align="center">
                  {t("HP") + ": " + player.stats.hp.max}
                </Typography>
              </Grid>
              <Grid container item xs={4} justifyContent="center">
                <Typography variant="h2" align="center">
                  {t("MP") + ": " + player.stats.mp.max}
                </Typography>
              </Grid>
              <Grid container item xs={4} justifyContent="center">
                <Typography variant="h2" align="center">
                  {t("IP") + ": " + player.stats.ip.max}
                </Typography>
              </Grid>
              <Grid
                container
                item
                xs={12}
                justifyContent="center"
                sx={{ marginTop: "5px", marginBottom: "5px" }}
              >
                <Divider sx={{ width: "100%" }} />
              </Grid>
              <Grid container item xs={4} justifyContent="center">
                <Typography variant="h2" align="center">
                  {t("DEF") + ": " + currDef}
                </Typography>
              </Grid>
              <Grid container item xs={4} justifyContent="center">
                <Typography variant="h2" align="center">
                  {t("MDEF") + ": " + currMDef}
                </Typography>
              </Grid>
              <Grid container item xs={4} justifyContent="center">
                <Typography variant="h2" align="center">
                  {t("INIT") + ": " + currInit}
                </Typography>
              </Grid>
              <Grid
                container
                item
                xs={12}
                justifyContent="center"
                sx={{ marginTop: "5px", marginBottom: "5px" }}
              >
                <Divider sx={{ width: "100%" }} />
              </Grid>
              <Grid container item xs={3} justifyContent="center">
                <Typography variant="h2" align="center">
                  {t("DEX") + ": d" + player.attributes.dexterity}
                </Typography>
              </Grid>
              <Grid container item xs={3} justifyContent="center">
                <Typography variant="h2" align="center">
                  {t("INT") + ": d" + player.attributes.insight}
                </Typography>
              </Grid>
              <Grid container item xs={3} justifyContent="center">
                <Typography variant="h2" align="center">
                  {t("MIG") + ": d" + player.attributes.might}
                </Typography>
              </Grid>
              <Grid container item xs={3} justifyContent="center">
                <Typography variant="h2" align="center">
                  {t("WLP") + ": d" + player.attributes.willpower}
                </Typography>
              </Grid>
            </Grid>
            {equipmentText !== "" && (
              <Grid
                container
                item
                xs={12}
                sx={{
                  marginTop: "10px",
                  padding: "0.5rem",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: secondary,
                }}
              >
                <Grid container item xs={12} alignItems="center">
                  {" "}
                  <Typography variant="h3" fontWeight={"bolder"}>
                    <span>{t("Equipment") + ": "}&nbsp;</span>
                  </Typography>
                  <Typography variant="h4">
                    <span>{equipmentText}</span>
                  </Typography>
                </Grid>
              </Grid>
            )}
            {player.classes.length > 0 && (
              <Grid
                container
                item
                xs={12}
                sx={{
                  marginTop: "10px",
                  marginBottom: "10px",
                  padding: "0.5rem",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: secondary,
                }}
              >
                <Grid container item xs={12}>
                  <Typography variant="h3" fontWeight={"bolder"}>
                    {t("Classes") + ": "}
                  </Typography>
                </Grid>
                {player.classes.map((cl, i) => (
                  <Grid container item xs={12} key={i}>
                    <Typography variant="h4">
                      {t(cl.name) + " (" + t("LVL") + " " + cl.lvl + "):"}&nbsp;
                    </Typography>
                    {cl.skills.filter((sk) => sk.currentLvl > 0).length > 0 && (
                      <Typography variant="h4">
                        {cl.skills
                          .filter((sk) => sk.currentLvl > 0)
                          .map((sk, j) => (
                            <span key={j}>
                              {sk.skillName}
                              {sk.maxLvl > 1 ? ` (${sk.currentLvl})` : ""}
                              {j !==
                                cl.skills.filter((sk) => sk.currentLvl > 0)
                                  .length -
                                  1 && ", "}
                            </span>
                          ))}
                      </Typography>
                    )}
                    {cl.spells.filter((sp) => sp.spellType === "default")
                      .length > 0 && (
                      <Typography variant="h4">
                        &nbsp;{"- ( " + t("Spells") + ": "}
                        {cl.spells
                          .filter((sp) => sp.spellType === "default")
                          .map((sp, j) => (
                            <span key={j}>
                              {sp.name}
                              {j !==
                                cl.spells.filter(
                                  (sp) => sp.spellType === "default"
                                ).length -
                                  1 && ", "}
                            </span>
                          ))}
                        {" )"}
                      </Typography>
                    )}
                    {cl.spells.filter(
                      (sp) =>
                        sp.spellType === "arcanist" ||
                        sp.spellType === "arcanist-rework"
                    ).length > 0 && (
                      <Typography variant="h4">
                        &nbsp;{"- ( " + t("Arcana") + ": "}
                        {cl.spells
                          .filter(
                            (sp) =>
                              sp.spellType === "arcanist" ||
                              sp.spellType === "arcanist-rework"
                          )
                          .map((sp, j) => (
                            <span key={j}>
                              {sp.name}
                              {j !==
                                cl.spells.filter(
                                  (sp) =>
                                    sp.spellType === "arcanist" ||
                                    sp.spellType === "arcanist-rework"
                                ).length -
                                  1 && ", "}
                            </span>
                          ))}
                        {" )"}
                      </Typography>
                    )}
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Card>
    </>
  );
}
