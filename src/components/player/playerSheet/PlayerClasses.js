import React from "react";
import { Paper, Typography, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import CustomHeader2 from "../../common/CustomHeader2";
import CustomHeader3 from "../../common/CustomHeader3";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";

export default function PlayerClasses({ player, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const StyledMarkdown = styled(ReactMarkdown)({
    whiteSpace: "pre-line",
  });

  return (
    <>
      {player.classes.length > 0 && (
        <>
          {player.classes.map((c, index) => (
            <Paper
              key={index}
              elevation={3}
              sx={{
                borderRadius: "8px",
                border: "2px solid",
                borderColor: secondary,
                display: "flex",
                flexDirection: "column",
                marginBottom: "1em",
                paddingBottom: "1em",
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
                  fontSize: "1.5em",
                }}
                align="center"
              >
                {t(c.name)} - {t("LVL") + " " + c.lvl}
              </Typography>
              {c.benefits && (
                <>
                  <Grid item xs={12}>
                    <CustomHeader2
                      headerText={`${t("Free Benefits")}`}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12} style={{ margin: "-20px 0 0 0" }}>
                    <ul>
                      {c.benefits.hpplus !== 0 && (
                        <li>
                          <Typography>
                            {t(
                              "Permanently increase your maximum Hit Points by"
                            )}{" "}
                            {c.benefits.hpplus}.
                          </Typography>
                        </li>
                      )}
                      {c.benefits.mpplus !== 0 && (
                        <li>
                          <Typography>
                            {t(
                              "Permanently increase your maximum Mind Points by"
                            )}{" "}
                            {c.benefits.mpplus}.
                          </Typography>
                        </li>
                      )}
                      {c.benefits.ipplus !== 0 && (
                        <li>
                          <Typography>
                            {t(
                              "Permanently increase your maximum Inventory Points by"
                            )}{" "}
                            {c.benefits.ipplus}.
                          </Typography>
                        </li>
                      )}
                      {c.benefits.rituals && (
                        <>
                          {c.benefits.rituals.ritualism && (
                            <li>
                              <Typography>
                                {t(
                                  "You may perform Rituals whose effects fall within the Ritualism discipline."
                                )}
                              </Typography>
                            </li>
                          )}
                        </>
                      )}
                      {c.benefits.martials && (
                        <>
                          {c.benefits.martials.melee && (
                            <li>
                              <Typography>
                                {t(
                                  "Gain the ability to equip martial melee weapons."
                                )}
                              </Typography>
                            </li>
                          )}
                          {c.benefits.martials.ranged && (
                            <li>
                              <Typography>
                                {t(
                                  "Gain the ability to equip martial ranged weapons."
                                )}
                              </Typography>
                            </li>
                          )}
                          {c.benefits.martials.shields && (
                            <li>
                              <Typography>
                                {t(
                                  "Gain the ability to equip martial shields."
                                )}
                              </Typography>
                            </li>
                          )}
                          {c.benefits.martials.armor && (
                            <li>
                              <Typography>
                                {t("Gain the ability to equip martial armor.")}
                              </Typography>
                            </li>
                          )}
                          {c.benefits.custom &&
                            c.benefits.custom.map((custombenefit, index) => (
                              <li key={index}>
                                <Typography>{custombenefit}</Typography>
                              </li>
                            ))}
                        </>
                      )}
                    </ul>
                  </Grid>
                </>
              )}
              {c.skills
                .filter((s) => s.currentLvl >= 1)
                .map((s, skillIndex) => (
                  <>
                    <CustomHeader3
                      key={skillIndex}
                      headerText={t(s.skillName)}
                      currentLvl={s.currentLvl}
                      maxLvl={s.maxLvl}
                      isEditMode={false}
                    />
                    <Typography
                      variant="body1"
                      justifyContent="flex-start"
                      sx={{
                        background: "transparent",
                        padding: "0 17px",
                      }}
                    >
                      <StyledMarkdown
                        allowedElements={["strong", "em"]}
                        unwrapDisallowed={true}
                      >
                        {s.description}
                      </StyledMarkdown>
                    </Typography>
                  </>
                ))}
              {c.lvl === 10 && (
                <>
                  <Grid item xs={12} sx={{marginTop: "1em"}}>
                    <CustomHeader2
                      headerText={t("Heroic Skill")}
                      //buttonText={t("Edit Benefits")}
                      //onButtonClick={() => setOpenEditBenefitsModal(true)}
                      isEditMode={false}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomHeader3
                      headerText={c.heroic.name}
                      currentLvl={0}
                      maxLvl={0}
                      isEditMode={false}
                      isHeroicSkill={true}
                    />
                    <Typography
                      variant="body1"
                      justifyContent="flex-start"
                      sx={{
                        background: "transparent",
                        padding: "0 17px",
                      }}
                    >
                      <StyledMarkdown
                        allowedElements={["strong", "em"]}
                        unwrapDisallowed={true}
                      >
                        {c.heroic.description}
                      </StyledMarkdown>
                    </Typography>
                  </Grid>
                </>
              )}
            </Paper>
          ))}
        </>
      )}
    </>
  );
}
