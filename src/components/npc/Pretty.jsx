import { Card, Grid, Typography, Box, Dialog } from "@mui/material";
import React, { Fragment, useState } from "react";
import ReactMarkdown from "react-markdown";
import attributes from "../../libs/attributes";
import {
  calcDamage,
  calcDef,
  calcHP,
  calcInit,
  calcMagic,
  calcMDef,
  calcMP,
  calcPrecision,
} from "../../libs/npcs";
import { CloseBracket, OpenBracket } from "../Bracket";
import Diamond from "../Diamond";
import {
  ActionIcon,
  DistanceIcon,
  MeleeIcon,
  NotesIcon,
  OffensiveSpellIcon,
  RareItemIcon,
  SpellIcon,
} from "../icons";
import { Martial } from "../icons";
import { TypeAffinity } from "../types";
import Study from "./Study";
// import EditableImage from "../EditableImage";
import { ArrowDropDown } from "@mui/icons-material";
import { useTranslate, t } from "../../translation/translate";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { useTheme } from "@mui/material/styles";

function NpcPretty(
  { npc, study, npcImage, collapse, onClick = () => {} },
  ref
) {
  const { t } = useTranslate();
  const theme = useTheme();

  return (
    <Card>
      <div ref={ref} onClick={() => onClick()} style={{ cursor: "pointer" }}>
        {(study === 0 || study === null || study === undefined) && (
          <>
            <div
              style={{
                boxShadow: collapse ? "none" : "1px 1px 5px",
              }}
            >
              <Header npc={npc} npcImage={npcImage} />
            </div>
            {collapse ? (
              <>
                <Stats npc={npc} />
                <Immunities npc={npc} />
                <Attacks npc={npc} />
                <Spells npc={npc} />
                <Actions npc={npc} />
                <Special npc={npc} />
                <RareGear npc={npc} />
                <Equip npc={npc} />
                <Notes npc={npc} />
              </>
            ) : (
              <Grid container>
                <Grid
                  item
                  xs={12}
                  sx={{
                    padding: 1,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <ArrowDropDown />
                  <Typography
                    color={theme.palette.text.primary}
                    fontSize="1.1rem"
                    fontWeight="medium"
                  >
                    {t("Expand")}
                  </Typography>
                  <ArrowDropDown />
                </Grid>
              </Grid>
            )}
          </>
        )}

        {study >= 1 && (
          <div>
            <Study npc={npc} study={study} />
          </div>
        )}
      </div>
    </Card>
  );
}

function Header({ npc, npcImage }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const background =
    theme.mode === "dark"
      ? `linear-gradient(90deg, #583871 0%, #4C3D51 100%);`
      : `linear-gradient(90deg, #674168 0%, #b9a9be 100%);`;

  const borderImage =
    theme.mode === "dark"
      ? "linear-gralinear-gradient(45deg, #b9a9be, #ffffff) 1"
      : "linear-gradient(45deg, #b9a9be, #ffffff) 1";
  const borderImageBody =
    theme.mode === "dark"
      ? "linear-gradient(45deg, #674168, #ffffff) 1;"
      : "linear-gradient(45deg, #674168, #ffffff) 1;";
  const borderRight =
    theme.mode === "dark" ? `4px solid #1f1f1f` : `4px solid white`;

  const borderLeft =
    theme.mode === "dark" ? "2px solid #4C3D51" : "2px solid #b9a9be";

  const borderBottom =
    theme.mode === "dark" ? "2px solid #4C3D51" : "2px solid #b9a9be";

  const StyledMarkdown = ({ children, ...props }) => {
    return (
      <div style={{ whiteSpace: "pre-line", margin: 0, padding: 0 }}>
        <ReactMarkdown
          {...props}
          components={{
            p: (props) => <p style={{ margin: 0, padding: 0 }} {...props} />,
            ul: (props) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
            li: (props) => <li style={{ margin: 0, padding: 0 }} {...props} />,
            strong: (props) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: (props) => <em style={{ fontStyle: "italic" }} {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  };
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Grid container alignItems="stretch">
      <Grid container>
        <Grid
          item
          xs
          sx={{
            background,
            borderRight,
            px: 2,
          }}
        >
          <Typography
            color="white.main"
            fontFamily="Antonio"
            fontSize="1.5rem"
            fontWeight="medium"
            sx={{ textTransform: "uppercase" }}
          >
            {npc.name}
          </Typography>
        </Grid>
        <Grid
          item
          sx={{
            px: 2,
            py: 0.5,
            borderLeft: borderLeft,
            borderBottom: borderBottom,
            borderImage: borderImage,
          }}
        >
          <Typography
            fontFamily="Antonio"
            fontSize="1.25rem"
            fontWeight="medium"
            sx={{ textTransform: "uppercase" }}
          >
            {t("Lvl")} {npc.lvl} <Rank npc={npc} /> <Diamond /> {t(npc.species)}
          </Typography>
        </Grid>
      </Grid>
      <Box sx={{ display: "flex", width: 1 }}>
        {/* EditableImage */}
        {npcImage ? (
          <Box
            sx={{
              minWidth: "128px",
              width: "128px",
              height: "auto",
              background: "white",
              border: "1px solid #684268",
              borderTop: "none",
              overflow: "hidden",
              cursor: "pointer",
            }}
            onClick={handleClickOpen}
          >
            <img
              src={npcImage}
              alt="NPC Avatar"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center center",
                display: "block",
              }}
            />
          </Box>
        ) : null}
        {/* Dialog for expanded image */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <img
            src={npc.imgurl}
            alt="Expanded NPC Avatar"
            style={{
              width: "100%",
              height: "auto",
            }}
            onClick={handleClose}
          />
        </Dialog>

        {/* Rows */}
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          {/* Row 1 */}
          {(npc.villain || npc.phases || npc.multipart) && (
            <Box
              sx={{
                px: 2,
                py: 0.5,
                borderBottom: borderBottom,
                borderImage: borderImageBody,
              }}
            >
              <Typography
                fontFamily="Antonio"
                fontSize="1.25rem"
                sx={{ textTransform: "uppercase" }}
              >
                {RenderVillainPhase(npc)}
              </Typography>
            </Box>
          )}
          {/* Row 2 */}
          <Box
            sx={{
              px: 2,
              py: 0.5,
              borderBottom: borderBottom,
              borderImage: borderImageBody,
              flexGrow: 1,
            }}
          >
            <StyledMarkdown
              sx={{
                fontFamily: "PT Sans Narrow",
                fontSize: "1rem",
              }}
            >
              {npc.description}
            </StyledMarkdown>
          </Box>
          {/* Row 3 */}
          <Box
            sx={{
              px: 2,
              py: 0.5,
            }}
          >
            <Typography>
              <strong>{t("Typical Traits:")} </strong>
              {npc.traits}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Grid>
  );
}

function Rank({ npc }) {
  const { t } = useTranslate();
  return (
    <>
      {npc.rank === "elite" && t("Elite")}
      {npc.rank === "champion1" && t("Champion (1)")}
      {npc.rank === "champion2" && t("Champion (2)")}
      {npc.rank === "champion3" && t("Champion (3)")}
      {npc.rank === "champion4" && t("Champion (4)")}
      {npc.rank === "champion5" && t("Champion (5)")}
      {npc.rank === "champion6" && t("Champion (6)")}
      {npc.rank === "companion" && t("Companion")}
      {npc.rank === "groupvehicle" && (
        <>
          {npc.sizes === "small" && t("Small")}
          {npc.sizes === "medium" && t("Medium")}
          {npc.sizes === "large" && t("Large")}
          {npc.sizes && " "}
          {t("Group Vehicle")}
        </>
      )}
    </>
  );
}

function Stats({ npc }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isMobile = window.innerWidth < 900;
  const borderImage = `linear-gradient(45deg, #b9a9be, ${theme.transparent}) 1`;
  return (
    <Typography
      component="div"
      fontFamily="Antonio"
      fontWeight="bold"
      textAlign="center"
      fontSize={isMobile ? "0.74rem" : "0.9rem"}
    >
      <Grid container>
        <Grid
          item
          sx={{
            borderBottom: "1px solid #281127",
            borderTop: "1px solid #281127",
            borderRight: "1px solid #281127",
            borderImage: "linear-gradient(90deg, #341b35, #6d5072) 1;",
            mr: isMobile ? "1px" : "2px",
            my: "2px",
            flexBasis: "calc(50% - 2px)",
          }}
        >
          <Grid container alignItems="stretch" justifyContent="space-between">
            <Grid
              item
              xs
              sx={{
                bgcolor: theme.mode === "dark" ? "#1E2122" : "#efecf5",
                borderRight:
                  theme.mode === "dark"
                    ? "1px solid #42484B"
                    : "1px solid #ffffff",
                py: 0.4,
              }}
            >
              {t("DEX")} d{npc.attributes?.dexterity}
            </Grid>
            <Grid
              item
              xs
              sx={{
                bgcolor: theme.mode === "dark" ? "#1E2122" : "#f3f0f7",
                borderRight:
                  theme.mode === "dark"
                    ? "1px solid #42484B"
                    : "1px solid #ffffff",
                py: 0.4,
              }}
            >
              {t("INS")} d{npc.attributes?.insight}
            </Grid>
            <Grid
              item
              xs
              sx={{
                bgcolor: theme.mode === "dark" ? "#1D1F20" : "#f6f4f9",
                borderRight:
                  theme.mode === "dark"
                    ? "1px solid #42484B"
                    : "1px solid #ffffff",
                py: 0.4,
              }}
            >
              {t("MIG")} d{npc.attributes?.might}
            </Grid>
            <Grid
              item
              xs
              sx={{
                bgcolor: theme.mode === "dark" ? "#1B1D1E" : "#f9f8fb",
                py: 0.4,
              }}
            >
              {t("WLP")} d{npc.attributes?.will}
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          sx={{
            borderBottom: "1px solid #281127",
            borderTop: "1px solid #281127",
            borderLeft: "1px solid #281127",
            borderImage: "linear-gradient(90deg, #6d5072, #ffffff) 1;",
            ml: isMobile ? "1px" : "2px",
            my: "2px",
            flexBasis: "calc(50% - 2px)",
          }}
        >
          <Grid container alignItems="stretch" justifyContent="space-between">
            <Grid item sx={{ px: isMobile ? 0.5 : 1, py: 0.4 }}>
              {t("HP")}
            </Grid>
            <Grid
              item
              sx={{
                py: 0.4,
                px: isMobile ? 0.75 : 1.5,
                color: "white.main",
                bgcolor: "red.main",
              }}
            >
              {calcHP(npc)} <Diamond color="white.main" />{" "}
              {Math.floor(calcHP(npc) / 2)}
            </Grid>
            <Grid item sx={{ px: isMobile ? 0.5 : 1, py: 0.4 }}>
              {t("MP")}
            </Grid>
            <Grid
              item
              sx={{
                px: isMobile ? 0.75 : 1.5,
                py: 0.4,
                color: "white.main",
                bgcolor: "cyan.main",
              }}
            >
              {calcMP(npc)}
            </Grid>
            <Grid item xs sx={{ py: 0.4 }}>
              {t("Init.")} {calcInit(npc)}
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          sx={{
            borderBottom: "1px solid #281127",
            borderTop: "1px solid #281127",
            borderRight: "1px solid #281127",
            borderImage,
            mr: isMobile ? "1px" : "2px",
            flexBasis: "calc(25% - 2px)",
          }}
        >
          <Grid container justifyItems="space-between">
            <Grid
              item
              xs
              sx={{
                bgcolor: theme.mode === "dark" ? "#1B1D1E" : "#efecf5",
                borderRight:
                  theme.mode === "dark"
                    ? "1px solid #42484B"
                    : "1px solid #ffffff",
                py: 0.4,
              }}
            >
              {npc.armor?.def > 0 ? (
                <>
                  {t("DEF")} {calcDef(npc)}
                </>
              ) : (
                <>
                  {t("DEF")} +{calcDef(npc)}
                </>
              )}
            </Grid>
            <Grid
              item
              xs
              sx={{
                bgcolor: theme.mode === "dark" ? "#1B1D1E" : "#efecf5",
                py: 0.4,
              }}
            >
              {t("M.DEF")} +{calcMDef(npc)}
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          xs
          sx={{
            borderBottom: "1px solid #281127",
            borderTop: "1px solid #281127",
            borderLeft: "1px solid #281127",
            borderImage,
            ml: isMobile ? "1px" : "2px",
            mt: 0,
          }}
        >
          {npc.affinities && (
            <Grid container>
              <Grid item xs sx={{ py: 0.4, borderRight: "1px solid #42484B" }}>
                <TypeAffinity
                  type="physical"
                  affinity={npc.affinities.physical}
                />
              </Grid>
              <Grid item xs sx={{ py: 0.4, borderRight: "1px solid #604365" }}>
                <TypeAffinity type="wind" affinity={npc.affinities.wind} />
              </Grid>
              <Grid item xs sx={{ py: 0.4, borderRight: "1px solid #6f5375" }}>
                <TypeAffinity type="bolt" affinity={npc.affinities.bolt} />
              </Grid>
              <Grid item xs sx={{ py: 0.4, borderRight: "1px solid #816687" }}>
                <TypeAffinity type="dark" affinity={npc.affinities.dark} />
              </Grid>
              <Grid item xs sx={{ py: 0.4, borderRight: "1px solid #957d9b" }}>
                <TypeAffinity type="earth" affinity={npc.affinities.earth} />
              </Grid>
              <Grid item xs sx={{ py: 0.4, borderRight: "1px solid #ac97b0" }}>
                <TypeAffinity type="fire" affinity={npc.affinities.fire} />
              </Grid>
              <Grid item xs sx={{ py: 0.4, borderRight: "1px solid #c4b4c7" }}>
                <TypeAffinity type="ice" affinity={npc.affinities.ice} />
              </Grid>
              <Grid item xs sx={{ py: 0.4, borderRight: "1px solid #e0d7e2" }}>
                <TypeAffinity type="light" affinity={npc.affinities.light} />
              </Grid>
              <Grid item xs sx={{ py: 0.4 }}>
                <TypeAffinity type="poison" affinity={npc.affinities.poison} />
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Typography>
  );
}

function Immunities({ npc }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const background = theme.mode === 'dark'
    ? `linear-gradient(90deg, #1E2122 0%, rgba(255, 255, 255, 0) 100%)` // Dark mode gradient
    : `linear-gradient(90deg, #f6f4f9 0%, #ffffff 100%)`; // Light mode gradient

  const backgroundColor = theme.mode === 'dark'
    ? `#583871` // Dark mode background color
    : `#6e468d`; // Light mode background color

  // Immunities labels
  const immunitiesLabels = {
    slow: t("slow"),
    dazed: t("dazed"),
    weak: t("weak"),
    shaken: t("shaken"),
    enraged: t("enraged"),
    poisoned: t("poisoned"),
  };

  // Only list immunities that are true
  const trueImmunities = Object.keys(immunitiesLabels)
    .filter((key) => npc.immunities?.[key]) // Check if npc is immune to this status
    .map((key) => immunitiesLabels[key]);

  if (trueImmunities.length === 0) {
    return null;
  }

  const immunitiesList = trueImmunities.join(", ") + ".";

  return (
    <Grid
      container
      justifyContent="space-between"
      item
      sx={{
        mt: 1,
        py: 0.1,
      }}
    >
      {/* Immunity Label */}
      <Grid
        item
        xs={2}
        sx={{
          textAlign: 'center',
          backgroundColor: backgroundColor,
          color: `${theme.white}`,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography
          color="white.main"
          fontFamily="Antonio"
          fontSize="1.1rem"
          fontWeight="medium"
          sx={{ textTransform: "uppercase", margin: "auto" }}
        >
          {t("Immunities")}
        </Typography>
      </Grid>

      {/* Immunities List */}
      <Grid
        item
        xs={10}
        sx={{
          px: 1,
          display: 'flex',
          alignItems: 'center',
          background: background,
        }}
      >
        <Typography sx={{ fontWeight: "bold", margin: "auto 0" }}>
          {immunitiesList}
        </Typography>
      </Grid>
    </Grid>
  );
}

function Attacks({ npc }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const background =
    theme.mode === "dark"
      ? `linear-gradient(90deg, #583871 0%, rgba(255, 255, 255, 0) 100%)` // Dark mode gradient with transparent end
      : `linear-gradient(90deg, #6e468d 0%, #ffffff 100%)`; // Light mode gradient
  const damageTypeLabels = {
    physical: "physical_damage",
    wind: "air_damage",
    bolt: "bolt_damage",
    dark: "dark_damage",
    earth: "earth_damage",
    fire: "fire_damage",
    ice: "ice_damage",
    light: "light_damage",
    poison: "poison_damage",
  };

  const SpanMarkdown = ({ children, ...props }) => {
    return (
      <span
        style={{
          whiteSpace: "pre-line",
          display: "inline",
          margin: 0,
          padding: 0,
        }}
      >
        <ReactMarkdown
          {...props}
          components={{
            p: ({ ...props }) => <span {...props} />, // Render <p> as <span>
            strong: ({ ...props }) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: ({ ...props }) => (
              <em style={{ fontStyle: "italic" }} {...props} />
            ),
            span: ({ ...props }) => <span {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </span>
    );
  };

  return (
    <Grid container>
      <Grid
        item
        xs={12}
        sx={{
          mt: 1,
          px: 2,
          py: 0.3,
          background,
        }}
      >
        <Typography
          color="white.main"
          fontFamily="Antonio"
          fontSize="1.1rem"
          fontWeight="medium"
          sx={{ textTransform: "uppercase" }}
        >
          {t("Basic Attacks")}
        </Typography>
      </Grid>

      {npc.attacks?.map((attack, i) => {
        return (
          <Fragment key={i}>
            <Grid item xs={1} sx={{ px: 1, py: 0.5 }}>
              <Typography component="div" textAlign="center">
                {attack.range === "melee" && <MeleeIcon />}
                {attack.range === "distance" && <DistanceIcon />}
              </Typography>
            </Grid>
            <Grid item xs={11} sx={{ px: 1, py: 0.5 }}>
              <Typography component="div">
                <strong>{attack.name}</strong> <Diamond />{" "}
                <strong>
                  <OpenBracket />
                  {attributes[attack.attr1].shortcaps} {" + "}
                  {attributes[attack.attr2].shortcaps}
                  <CloseBracket />
                  {calcPrecision(attack, npc) > 0 &&
                    `+${calcPrecision(attack, npc)}`}{" "}
                </strong>
                {attack.type !== "nodmg" && (
                  <>
                    <strong>
                      <Diamond /> <OpenBracket />
                      {t("HR") + " + " + calcDamage(attack, npc)}
                      <CloseBracket />{" "}
                    </strong>
                    {attack.type === "physical" ? (
                      <span>
                        <SpanMarkdown>
                          {t(damageTypeLabels[attack.type])}
                        </SpanMarkdown>
                      </span>
                    ) : (
                      <span style={{ textTransform: "lowercase" }}>
                        <SpanMarkdown>
                          {t(damageTypeLabels[attack.type])}
                        </SpanMarkdown>
                      </span>
                    )}
                  </>
                )}{" "}
                {attack.special?.map((effect, i) => {
                  return (
                    <Typography component="span" key={i}>
                      {" "}
                      - <SpanMarkdown>{effect}</SpanMarkdown>{" "}
                    </Typography>
                  );
                })}
                {(typeof myVar === "string" ||
                  attack.special instanceof String) && (
                  <Typography component="span" key={i}>
                    <SpanMarkdown
                      components={{
                        strong: (props) => (
                          <strong style={{ fontWeight: "bold" }} {...props} />
                        ),
                        em: (props) => (
                          <em style={{ fontStyle: "italic" }} {...props} />
                        ),
                      }}
                    >
                      {attack.special}
                    </SpanMarkdown>
                  </Typography>
                )}
              </Typography>
            </Grid>
          </Fragment>
        );
      })}

      {npc.weaponattacks?.map((attack, i) => {
        return (
          <Fragment key={i}>
            <Grid item xs={1} sx={{ px: 1, py: 0.5 }}>
              <Typography component="div" textAlign="center">
                {attack.weapon.range === "melee" && <MeleeIcon />}
                {attack.weapon.range === "distance" && <DistanceIcon />}
              </Typography>
            </Grid>
            <Grid item xs={11} sx={{ px: 1, py: 0.5 }}>
              <Typography component="div">
                <strong>
                  {attack.name} ({attack.weapon.name}){" "}
                  {/* {attack.martial && <Martial />}{" "} */}
                </strong>{" "}
                <Diamond />{" "}
                {attack.weapon.hands === 1 ? t("1 handed") : t("2 handed")}{" "}
                <Diamond />{" "}
                <strong>
                  <OpenBracket />
                  {attributes[attack.weapon.att1].shortcaps}
                  {" + "}
                  {attributes[attack.weapon.att2].shortcaps}
                  <CloseBracket />
                  {calcPrecision(attack, npc) > 0 &&
                    `+${calcPrecision(attack, npc)}`}{" "}
                  <Diamond /> <OpenBracket />
                  {t("HR")} + {calcDamage(attack, npc)}
                  <CloseBracket />
                </strong>{" "}
                {(attack.type || attack.weapon.type) === "physical" ? (
                  <span>
                    <SpanMarkdown
                      components={{
                        strong: (props) => <strong {...props} />,
                      }}
                    >
                      {t(damageTypeLabels[attack.type || attack.weapon.type])}
                    </SpanMarkdown>
                  </span>
                ) : (
                  <>
                    <span style={{ textTransform: "lowercase" }}>
                      <SpanMarkdown
                        components={{
                          strong: (props) => <strong {...props} />,
                        }}
                      >
                        {t(damageTypeLabels[attack.type || attack.weapon.type])}
                      </SpanMarkdown>
                    </span>
                  </>
                )}{" "}
                {attack.special?.map((effect, i) => {
                  return (
                    <Typography component="span" key={i}>
                      {" "}
                      -{" "}
                      <SpanMarkdown
                        components={{
                          strong: (props) => (
                            <strong style={{ fontWeight: "bold" }} {...props} />
                          ),
                          em: (props) => (
                            <em style={{ fontStyle: "italic" }} {...props} />
                          ),
                        }}
                      >
                        {effect}
                      </SpanMarkdown>{" "}
                    </Typography>
                  );
                })}
              </Typography>
            </Grid>
          </Fragment>
        );
      })}
    </Grid>
  );
}

function Spells({ npc }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const background =
    theme.mode === "dark"
      ? `linear-gradient(90deg, #583871 0%, rgba(255, 255, 255, 0) 100%)` // Dark mode gradient with transparent end
      : `linear-gradient(90deg, #6e468d 0%, #ffffff 100%)`; // Light mode gradient
  if (!npc.spells || npc.spells.length === 0) {
    return null;
  }
  const StyledMarkdown = ({ children, ...props }) => {
    return (
      <div style={{ whiteSpace: "pre-line", margin: 0, padding: 0 }}>
        <ReactMarkdown
          {...props}
          components={{
            p: (props) => <p style={{ margin: 0, padding: 0 }} {...props} />,
            ul: (props) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
            li: (props) => <li style={{ margin: 0, padding: 0 }} {...props} />,
            strong: (props) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: (props) => <em style={{ fontStyle: "italic" }} {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <Grid container>
      <Grid
        item
        xs={12}
        sx={{
          px: 2,
          py: 0.3,
          background,
        }}
      >
        <Typography
          color="white.main"
          fontFamily="Antonio"
          fontSize="1.1rem"
          fontWeight="medium"
          sx={{ textTransform: "uppercase" }}
        >
          {t("Spells")}
        </Typography>
      </Grid>

      {npc.spells?.map((spell, i) => {
        return (
          <Fragment key={i}>
            <Grid item xs={1} sx={{ px: 1, py: 0.5 }}>
              <Typography component="div" textAlign="center">
                <SpellIcon />
              </Typography>
            </Grid>
            <Grid item xs={11} sx={{ px: 1, py: 0.5 }}>
              <Typography component="div">
                <strong>{spell.name}</strong>{" "}
                {spell.type === "offensive" && <OffensiveSpellIcon />}{" "}
                <Diamond />{" "}
                <strong>
                  {spell.type === "offensive" && (
                    <>
                      <OpenBracket />
                      {attributes[spell.attr1].shortcaps}
                      {" + "}
                      {attributes[spell.attr2].shortcaps}
                      <CloseBracket />
                      {calcMagic(npc) > 0 && `+${calcMagic(npc)}`} <Diamond />
                    </>
                  )}{" "}
                  {spell.mp} MP <Diamond /> {spell.target} <Diamond />{" "}
                  {spell.duration}
                </strong>
                <br />
                <Typography component="span" key={i}>
                  <StyledMarkdown
                    components={{
                      strong: (props) => (
                        <strong style={{ fontWeight: "bold" }} {...props} />
                      ),
                      em: (props) => (
                        <em style={{ fontStyle: "italic" }} {...props} />
                      ),
                    }}
                  >
                    {spell.effect}
                  </StyledMarkdown>{" "}
                </Typography>
              </Typography>
            </Grid>
          </Fragment>
        );
      })}
    </Grid>
  );
}

function Special({ npc }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const background =
    theme.mode === "dark"
      ? `linear-gradient(90deg, #583871 0%, rgba(255, 255, 255, 0) 100%)` // Dark mode gradient with transparent end
      : `linear-gradient(90deg, #6e468d 0%, #ffffff 100%)`; // Light mode gradient
  const special = [];

  if (npc.special) {
    npc.special.forEach((s) => {
      special.push(s);
    });
  }

  // Species
  if (npc.species === "Construct") {
    special.push({
      name: t("Construct"),
      effect: t(
        "Immune to **poison** damage and Resistant to **earth** damage, and immune to poisoned.",
        true
      ),
    });
  }

  if (npc.species === "Undead") {
    special.push({
      name: t("Undead"),
      effect: t(
        "Immune to **poisoned** status and additionally, when an effect (such as an Arcanum, a potion or a spell) would cause an undead creature to recover Hit Points, whoever controls that effect may instead have the undead lose half as many Hit Points.",
        true
      ),
    });
  }

  if (npc.species === "Plant") {
    special.push({
      name: t("Plant"),
      effect: t("Immune to **dazed**, **shaken**, **enraged** status", true),
    });
  }

  if (special.length === 0) {
    return null;
  }

  const SpanMarkdown = ({ children, ...props }) => {
    return (
      <span
        style={{
          whiteSpace: "pre-line",
          display: "inline",
          margin: 0,
          padding: 0,
        }}
      >
        <ReactMarkdown
          {...props}
          components={{
            p: ({ ...props }) => <span {...props} />, // Render <p> as <span>
            strong: ({ ...props }) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: ({ ...props }) => (
              <em style={{ fontStyle: "italic" }} {...props} />
            ),
            span: ({ ...props }) => <span {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </span>
    );
  };

  return (
    <Grid container>
      <Grid
        item
        xs={12}
        sx={{
          mt: 0,
          px: 2,
          py: 0.3,
          background,
        }}
      >
        <Typography
          color="white.main"
          fontFamily="Antonio"
          fontSize="1.1rem"
          fontWeight="medium"
          sx={{ textTransform: "uppercase" }}
        >
          {t("Special Rules")}
        </Typography>
      </Grid>

      {special?.map((special, i) => {
        return (
          <Fragment key={i}>
            <Grid item xs={12} sx={{ px: 3, py: 0.5 }}>
              <Typography component="div">
                <span style={{ display: "inline" }}>
                  <strong>{special.name}</strong> <Diamond />{" "}
                </span>
                <SpanMarkdown
                  components={{
                    strong: (props) => (
                      <strong style={{ fontWeight: "bold" }} {...props} />
                    ),
                    em: (props) => (
                      <em style={{ fontStyle: "italic" }} {...props} />
                    ),
                  }}
                >
                  {special.effect}
                </SpanMarkdown>
              </Typography>
            </Grid>
          </Fragment>
        );
      })}
    </Grid>
  );
}

function Actions({ npc }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const background =
    theme.mode === "dark"
      ? `linear-gradient(90deg, #583871 0%, rgba(255, 255, 255, 0) 100%)` // Dark mode gradient with transparent end
      : `linear-gradient(90deg, #6e468d 0%, #ffffff 100%)`; // Light mode gradient
  const actions = [];

  if (npc.actions) {
    npc.actions.forEach((s) => {
      actions.push(s);
    });
  }

  if (actions.length === 0) {
    return null;
  }

  const SpanMarkdown = ({ children, ...props }) => {
    return (
      <span
        style={{
          whiteSpace: "pre-line",
          display: "inline",
          margin: 0,
          padding: 0,
        }}
      >
        <ReactMarkdown
          {...props}
          components={{
            p: ({ ...props }) => <span {...props} />, // Render <p> as <span>
            strong: ({ ...props }) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: ({ ...props }) => (
              <em style={{ fontStyle: "italic" }} {...props} />
            ),
            span: ({ ...props }) => <span {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </span>
    );
  };

  return (
    <Grid container>
      <Grid
        item
        xs={12}
        sx={{
          mt: 0,
          px: 2,
          py: 0.3,
          background,
        }}
      >
        <Typography
          color="white.main"
          fontFamily="Antonio"
          fontSize="1.1rem"
          fontWeight="medium"
          sx={{ textTransform: "uppercase" }}
        >
          {t("Other Actions")}
        </Typography>
      </Grid>

      {actions?.map((actions, i) => {
        return (
          <Fragment key={i}>
            <Grid item xs={1} sx={{ px: 1, py: 0.5 }}>
              <Typography textAlign="center">
                <ActionIcon />
              </Typography>
            </Grid>
            <Grid item xs={11} sx={{ px: 1, py: 0.5 }}>
              <Typography component="div">
                <strong>{actions.name}</strong> <Diamond />{" "}
                <SpanMarkdown
                  components={{
                    strong: (props) => (
                      <strong style={{ fontWeight: "bold" }} {...props} />
                    ),
                    em: (props) => (
                      <em style={{ fontStyle: "italic" }} {...props} />
                    ),
                  }}
                >
                  {actions.effect}
                </SpanMarkdown>
              </Typography>
            </Grid>
          </Fragment>
        );
      })}
    </Grid>
  );
}

function Notes({ npc }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const background =
    theme.mode === "dark"
      ? `linear-gradient(90deg, #583871 0%, rgba(255, 255, 255, 0) 100%)` // Dark mode gradient with transparent end
      : `linear-gradient(90deg, #6e468d 0%, #ffffff 100%)`; // Light mode gradient
  const notes = [];

  if (npc.notes) {
    npc.notes.forEach((s) => {
      notes.push(s);
    });
  }

  if (notes.length === 0) {
    return null;
  }

  const SpanMarkdown = ({ children, ...props }) => {
    return (
      <span
        style={{
          whiteSpace: "pre-line",
          display: "inline",
          margin: 0,
          padding: 0,
        }}
      >
        <ReactMarkdown
          {...props}
          components={{
            p: ({ ...props }) => <span {...props} />, // Render <p> as <span>
            strong: ({ ...props }) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: ({ ...props }) => (
              <em style={{ fontStyle: "italic" }} {...props} />
            ),
            span: ({ ...props }) => <span {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </span>
    );
  };

  return (
    <Grid container>
      <Grid
        item
        xs={12}
        sx={{
          mt: 0,
          px: 2,
          py: 0.3,
          background,
        }}
      >
        <Typography
          color="white.main"
          fontFamily="Antonio"
          fontSize="1.1rem"
          fontWeight="medium"
          sx={{ textTransform: "uppercase" }}
        >
          {t("Notes")}
        </Typography>
      </Grid>

      {notes?.map((notes, i) => {
        return (
          <Fragment key={i}>
            <Grid item xs={1} sx={{ pl: 2, py: 1 }}>
              <Typography textAlign="center" style={{ width: 20, height: 20 }}>
                <NotesIcon />
              </Typography>
            </Grid>
            <Grid item xs={11} sx={{ pl: 1, pr: 5, py: 1 }}>
              <Typography component="div">
                <strong>{notes.name}</strong> <Diamond />{" "}
                <SpanMarkdown
                  components={{
                    strong: (props) => (
                      <strong style={{ fontWeight: "bold" }} {...props} />
                    ),
                    em: (props) => (
                      <em style={{ fontStyle: "italic" }} {...props} />
                    ),
                  }}
                >
                  {notes.effect}
                </SpanMarkdown>
              </Typography>
            </Grid>
          </Fragment>
        );
      })}
    </Grid>
  );
}

function RareGear({ npc }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const background =
    theme.mode === "dark"
      ? `linear-gradient(90deg, #583871 0%, rgba(255, 255, 255, 0) 100%)` // Dark mode gradient with transparent end
      : `linear-gradient(90deg, #6e468d 0%, #ffffff 100%)`; // Light mode gradient
  const raregear = [];

  if (npc.raregear) {
    npc.raregear.forEach((s) => {
      raregear.push(s);
    });
  }

  if (raregear.length === 0) {
    return null;
  }

  const SpanMarkdown = ({ children, ...props }) => {
    return (
      <span
        style={{
          whiteSpace: "pre-line",
          display: "inline",
          margin: 0,
          padding: 0,
        }}
      >
        <ReactMarkdown
          {...props}
          components={{
            p: ({ ...props }) => <span {...props} />, // Render <p> as <span>
            strong: ({ ...props }) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: ({ ...props }) => (
              <em style={{ fontStyle: "italic" }} {...props} />
            ),
            span: ({ ...props }) => <span {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </span>
    );
  };

  return (
    <Grid container>
      <Grid
        item
        xs={12}
        sx={{
          mt: 0,
          px: 2,
          py: 0.3,
          background,
        }}
      >
        <Typography
          color="white.main"
          fontFamily="Antonio"
          fontSize="1.1rem"
          fontWeight="medium"
          sx={{ textTransform: "uppercase" }}
        >
          {t("Rare Equipment")}
        </Typography>
      </Grid>

      {raregear?.map((raregear, i) => {
        return (
          <Fragment key={i}>
            <Grid item xs={1} sx={{ px: 1, py: 0.5 }}>
              <Typography textAlign="center">
                <RareItemIcon />
              </Typography>
            </Grid>
            <Grid item xs={11} sx={{ px: 1, py: 0.5 }}>
              <Typography component="div">
                <strong>{raregear.name}</strong> <Diamond />{" "}
                <SpanMarkdown
                  components={{
                    strong: (props) => (
                      <strong style={{ fontWeight: "bold" }} {...props} />
                    ),
                    em: (props) => (
                      <em style={{ fontStyle: "italic" }} {...props} />
                    ),
                  }}
                >
                  {raregear.effect}
                </SpanMarkdown>
              </Typography>
            </Grid>
          </Fragment>
        );
      })}
    </Grid>
  );
}

function Equip({ npc }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const background =
    theme.mode === "dark"
      ? `linear-gradient(90deg, #583871 0%, rgba(255, 255, 255, 0) 100%)` // Dark mode gradient with transparent end
      : `linear-gradient(90deg, #6e468d 0%, #ffffff 100%)`; // Light mode gradient
  const weapons = [];

  npc.weaponattacks?.forEach((attack) => {
    if (weapons.find((weapon) => weapon.name === attack.weapon.name)) {
      return;
    }
    weapons.push(attack.weapon);
  });

  const hasWeapons = weapons.length !== 0;
  const hasArmor = npc.armor && npc.armor.name !== t("No Armor", true);
  const hasShield = npc.shield && npc.shield.name !== t("No Shield", true);
  const damageTypeLabels = {
    physical: "physical_damage",
    wind: "air_damage",
    bolt: "bolt_damage",
    dark: "dark_damage",
    earth: "earth_damage",
    fire: "fire_damage",
    ice: "ice_damage",
    light: "light_damage",
    poison: "poison_damage",
  };

  const SpanMarkdown = ({ children, ...props }) => {
    return (
      <span
        style={{
          whiteSpace: "pre-line",
          display: "inline",
          margin: 0,
          padding: 0,
        }}
      >
        <ReactMarkdown
          {...props}
          components={{
            p: ({ ...props }) => <span {...props} />, // Render <p> as <span>
            strong: ({ ...props }) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: ({ ...props }) => (
              <em style={{ fontStyle: "italic" }} {...props} />
            ),
            span: ({ ...props }) => <span {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </span>
    );
  };

  if (!hasWeapons && !hasArmor && !hasShield) {
    return null;
  }

  return (
    <Grid container>
      <Grid
        item
        xs={12}
        sx={{
          mt: 0,
          px: 2,
          py: 0.3,
          background,
        }}
      >
        <Typography
          color="white.main"
          fontFamily="Antonio"
          fontSize="1.1rem"
          fontWeight="medium"
          sx={{ textTransform: "uppercase" }}
        >
          {t("Equipment")}
        </Typography>
      </Grid>

      {/* Weapons */}
      {weapons.map((weapon, i) => (
        <Grid key={i} item xs={12} sx={{ px: 2, py: 0 }}>
          <Typography>
            <strong>{t("Weapon:")}</strong> {weapon.name}{" "}
            {weapon.martial && <Martial />} <Diamond />{" "}
            {weapon.hands === 1 ? t("1 handed") : t("2 handed")} <Diamond />{" "}
            <strong>
              {" "}
              <OpenBracket />
              {attributes[weapon.att1].shortcaps}
              {" + "}
              {attributes[weapon.att2].shortcaps}
              <CloseBracket />
              {weapon.prec > 0 && `+${weapon.prec}`} <Diamond /> <OpenBracket />
              {t("HR")} + {weapon.damage}
              <CloseBracket />
            </strong>{" "}
            {weapon.type === "physical" ? (
              <span>
                <SpanMarkdown
                  components={{
                    strong: (props) => <strong {...props} />,
                  }}
                >
                  {t(damageTypeLabels[weapon.type])}
                </SpanMarkdown>
              </span>
            ) : (
              <>
                <span style={{ textTransform: "lowercase" }}>
                  <SpanMarkdown
                    components={{
                      strong: (props) => <strong {...props} />,
                    }}
                  >
                    {t(damageTypeLabels[weapon.type])}
                  </SpanMarkdown>
                </span>
              </>
            )}{" "}
            <Diamond /> <strong>{weapon.cost}</strong> {t("zenit")}
          </Typography>
        </Grid>
      ))}

      {/* Armor */}
      {npc.armor && npc.armor.name !== "No Armor" && (
        <Grid item xs={12} sx={{ px: 2, py: 0 }} alignItems="center">
          <strong>{t("Armor:")}</strong> {npc.armor.name}{" "}
          {npc.armor.martial && <Martial />}
          <Diamond />{" "}
          {npc.armor.def > 0 ? (
            <strong>
              {t("DEF")} {npc.armor.def}
            </strong>
          ) : (
            <strong>
              {t("DEF")} + {npc.armor.defbonus}
            </strong>
          )}{" "}
          <Diamond />{" "}
          <strong>
            {t("M.DEF")} + {npc.armor.mdefbonus}
          </strong>{" "}
          <Diamond /> {t("Init.")} <strong>{npc.armor.init}</strong> <Diamond />{" "}
          <strong>{npc.armor.cost}</strong> {t("zenit")}
        </Grid>
      )}

      {/* Shield */}
      {npc.shield && npc.shield.name !== "No Shield" && (
        <Grid item xs={12} sx={{ px: 2, py: 0 }}>
          <strong>{t("Shield:")}</strong> {npc.shield.name}{" "}
          {npc.shield.martial && <Martial />}
          <Diamond />{" "}
          {npc.shield.def > 0 ? (
            <strong>
              {t("DEF")} {npc.shield.def}
            </strong>
          ) : (
            <strong>
              {t("DEF")} + {npc.shield.defbonus}
            </strong>
          )}{" "}
          <Diamond />{" "}
          <strong>
            {t("M.DEF")} + {npc.shield.mdefbonus}
          </strong>{" "}
          <Diamond /> {t("Init.")} <strong>{npc.shield.init}</strong>{" "}
          <Diamond /> <strong>{npc.shield.cost}</strong> {t("zenit")}
        </Grid>
      )}
    </Grid>
  );
}

function RenderVillainPhase({ villain, phases, multipart }) {
  const getVillainLabel = (villainType) => {
    switch (villainType) {
      case "minor":
        return t("minor_villain");
      case "major":
        return t("major_villain");
      case "supreme":
        return t("supreme_villain");
      default:
        return "";
    }
  };

  const phaseString =
    phases && phases >= 1 ? `${t("Phase", true)} ${phases}` : null;

  const values = [getVillainLabel(villain), phaseString, multipart].filter(
    Boolean
  );

  const combinedString = values.length > 0 ? values.join(" ⬥ ") : null;

  return <>{combinedString && <>{combinedString}</>}</>;
}

export default React.forwardRef(NpcPretty);

export { calcHP, calcMP, calcInit, Rank, Stats, Attacks, Spells };
