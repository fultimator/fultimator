import React from "react";
import {
  Typography,
  IconButton,
  Grid,
  ThemeProvider,
  Icon,
  Tooltip,
} from "@mui/material";
import { Edit, VisibilityOff, SettingsSuggest } from "@mui/icons-material";
import attributes from "../../../libs/attributes";
import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import ReactMarkdown from "react-markdown";

function ThemedSpellEntropistGamble({ gamble, onEdit, isEditMode }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const iconColor = isDarkMode ? '#ffffff' : '#000000';
  const gradientColor = isDarkMode ? '#1f1f1f' : '#fff';

  const inlineStyles = {
    margin: 0,
    padding: 0,
  };

  const components = {
    p: ({ _node, ...props }) => <p style={inlineStyles} {...props} />,
  };

  return (
    <>
      {/* Row 1 */}
      <div
        style={{
          backgroundColor: theme.primary,
          fontFamily: "Antonio",
          fontWeight: "normal",
          fontSize: "1.1em",
          padding: "2px 17px",
          color: theme.white,
          textTransform: "uppercase",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Grid container style={{ flexGrow: 1 }}>
          <Grid
            flexGrow
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
            }}
            size="grow">
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{
                fontSize: { xs: "0.7rem", sm: "1.1rem" }
              }}
            >
              {t("Spell")}
            </Typography>
          </Grid>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            size={{
              xs: 3,
              sm: 2
            }}>
            <Typography variant="h3" sx={{
              fontSize: { xs: "0.7rem", sm: "1.1rem" }
            }}>
              {t("MP x Dice")}
            </Typography>
          </Grid>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            size={{
              xs: 3,
              sm: 4
            }}>
            <Typography variant="h3" sx={{
              fontSize: { xs: "0.7rem", sm: "1.1rem" }
            }}>
              {t("Max Throwable Dices")}
            </Typography>
          </Grid>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            size={{
              xs: 3,
              sm: 3
            }}>
            <Typography variant="h3" sx={{
              fontSize: { xs: "0.7rem", sm: "1.1rem" }
            }}>
              {t("Attribute")}
            </Typography>
          </Grid>
        </Grid>
        {isEditMode && (
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
            size="grow">
            <div style={{ width: 40, height: 40 }} /> {/* Retain space */}
          </Grid>
        )}
      </div>
      {/* Row 2 */}
      <div
        style={{
          background: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
          padding: "3px 17px",
          display: "flex",
          justifyContent: "space-between",
          borderTop: `1px solid ${theme.secondary}`,
          borderBottom: `1px solid ${theme.secondary}`,
        }}
      >
        <Grid container style={{ flexGrow: 1 }}>
          <Grid
            flexGrow
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
            }}
            size="grow">
            <Typography
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "0.8rem", sm: "1rem" }
              }}>
              {gamble.isMagisphere && (
                <Tooltip title={t("Magisphere")}>
                  <SettingsSuggest sx={{ fontSize: "1rem" }} />
                </Tooltip>
              )}{" "}
              {gamble.spellName}
            </Typography>
          </Grid>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            size={2}>
            <Typography sx={{
              fontSize: { xs: "0.7rem", sm: "1rem" }
            }}>
              {gamble.mp}
            </Typography>
          </Grid>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            size={{
              xs: 3,
              sm: 4
            }}>
            <Typography sx={{
              fontSize: { xs: "0.7rem", sm: "1rem" }
            }}>
              {gamble.maxTargets}
            </Typography>
          </Grid>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            size={{
              xs: 4,
              sm: 3
            }}>
            <Typography sx={{
              fontSize: { xs: "0.7rem", sm: "1rem" }
            }}>
              {attributes[gamble.attr].shortcaps}
            </Typography>
          </Grid>
        </Grid>
        {isEditMode && (
          <Grid
            style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
            size="grow">
            {!gamble.showInPlayerSheet && (
              <Tooltip title={t("Spell not shown in player sheet")}>
                <Icon>
                  <VisibilityOff style={{ color: "black" }} />
                </Icon>
              </Tooltip>
            )}
            <IconButton size="small" onClick={onEdit}>
              <Edit style={{ color:  iconColor }} />
            </IconButton>
          </Grid>
        )}
      </div>
      {/* Row 3 */}
      <Grid
        container sx={{
          justifyContent: "flex-start",
          background: "transparent",
          marginBottom: "6px",
          borderBottom: `1px solid ${theme.secondary}`,
        }}
      >
        {gamble.targets.map((target, index) => (
          <Grid
            container
            key={index}
            sx={{
              background: theme.ternary,
              borderTop: `1px solid white`,
              borderBottom: `1px solid white`,
              padding: "3px 17px",
            }}
          >
            {/* Primary Effect */}
            <Grid  size={2}>
              <Typography
                style={{ flexGrow: 1, marginRight: "5px" }}
                sx={{
                  fontSize: { xs: "0.8rem", sm: "1rem" },
                  fontWeight: "bold"
                }}>
                {target.rangeFrom === target.rangeTo
                  ? target.rangeFrom
                  : `${target.rangeFrom} - ${target.rangeTo}`}
              </Typography>
            </Grid>
            <Grid  sx={{ mb: 1 }} size={10}>
              <Typography
                style={{ flexGrow: 1, marginRight: "5px" }}
                sx={{
                  fontSize: { xs: "0.8rem", sm: "1rem" }
                }}
              >
                <ReactMarkdown components={components}>{target.effect}</ReactMarkdown>
              </Typography>
            </Grid>

            {/* Secondary Effects */}
            {target.secondRoll && target.secondEffects?.length > 0 && (
              <>
                <Grid  size={2}>
                  {/* Leave to fill space */}
                </Grid>
                <Grid  size={10}>
                  <Grid container>
                    {target.secondEffects.map((effect, i) => (
                      <React.Fragment key={i}>
                        <Grid  size={1}>
                          <Typography
                            style={{ flexGrow: 1, marginRight: "5px" }}
                            sx={{
                              fontSize: { xs: "0.8rem", sm: "1rem" },
                              fontWeight: "bold"
                            }}>
                            {effect.dieValue}
                            {"."}
                          </Typography>
                        </Grid>
                        <Grid  size={3}>
                          <Typography
                            style={{ flexGrow: 1, marginRight: "5px" }}
                            sx={{
                              fontSize: { xs: "0.8rem", sm: "1rem" }
                            }}
                          >
                            <ReactMarkdown components={components}>{effect.effect}</ReactMarkdown>
                          </Typography>
                        </Grid>
                        {(i + 1) % 3 === 0 && <Grid  size={12} />}
                      </React.Fragment>
                    ))}
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>
        ))}
      </Grid>
    </>
  );
}

export default function SpellEntropistGamble(props) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellEntropistGamble {...props} />
    </ThemeProvider>
  );
}
