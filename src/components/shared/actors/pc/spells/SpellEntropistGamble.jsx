import React from "react";
import {
  Typography,
  IconButton,
  Grid,
  ThemeProvider,
  Icon,
  Tooltip,
  Box,
} from "@mui/material";
import { Edit, VisibilityOff, SettingsSuggest } from "@mui/icons-material";
import attributes from "/src/libs/attributes";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import ReactMarkdown from "react-markdown";

function ThemedSpellEntropistGamble({ gamble, onEdit, isEditMode }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const iconColor = isDarkMode ? "#ffffff" : "#000000";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";
  const bodyTextSx = { fontSize: "0.9rem", lineHeight: 1.35 };

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
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
            }}
            size="grow"
          >
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{
                fontSize: { xs: "0.7rem", sm: "1.1rem" },
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
              sm: 2,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "0.7rem", sm: "1.1rem" },
              }}
            >
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
              sm: 4,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "0.7rem", sm: "1.1rem" },
              }}
            >
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
              sm: 3,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "0.7rem", sm: "1.1rem" },
              }}
            >
              {t("Attribute")}
            </Typography>
          </Grid>
        </Grid>
        {isEditMode && (
          <Box
            sx={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              flexShrink: 0,
              ml: 1,
            }}
          />
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
          minHeight: 44,
          fontSize: "0.9rem",
        }}
      >
        <Grid container style={{ flexGrow: 1 }}>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
            }}
            size="grow"
          >
            <Typography
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{
                fontWeight: "bold",
                ...bodyTextSx,
              }}
            >
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
            size={2}
          >
            <Typography
              sx={{
                ...bodyTextSx,
              }}
            >
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
              sm: 4,
            }}
          >
            <Typography
              sx={{
                ...bodyTextSx,
              }}
            >
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
              sm: 3,
            }}
          >
            <Typography
              sx={{
                ...bodyTextSx,
              }}
            >
              {attributes[gamble.attr].shortcaps}
            </Typography>
          </Grid>
        </Grid>
        {isEditMode && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              flexShrink: 0,
              minWidth: 40,
              ml: 1,
            }}
          >
            {!gamble.showInPlayerSheet && (
              <Tooltip title={t("Spell not shown in player sheet")}>
                <Icon>
                  <VisibilityOff style={{ color: "black" }} />
                </Icon>
              </Tooltip>
            )}
            <IconButton size="small" onClick={onEdit}>
              <Edit style={{ color: iconColor }} />
            </IconButton>
          </Box>
        )}
      </div>
      {/* Row 3 */}
      <Grid
        container
        sx={{
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
            size={12}
            sx={{
              background:
                index % 2 === 0
                  ? `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`
                  : "transparent",
              borderTop: `1px solid white`,
              borderBottom: `1px solid white`,
              padding: "3px 17px",
              minHeight: 44,
              fontSize: "0.9rem",
            }}
          >
            {/* Primary Effect */}
            <Grid size={2}>
              <Typography
                style={{ flexGrow: 1, marginRight: "5px" }}
                sx={{
                  ...bodyTextSx,
                  fontWeight: "bold",
                }}
              >
                {target.rangeFrom === target.rangeTo
                  ? target.rangeFrom
                  : `${target.rangeFrom} - ${target.rangeTo}`}
              </Typography>
            </Grid>
            <Grid sx={{ mb: 1 }} size={10}>
              <Typography
                component="div"
                style={{ flexGrow: 1, marginRight: "5px" }}
                sx={{
                  ...bodyTextSx,
                }}
              >
                <ReactMarkdown components={components}>
                  {target.effect}
                </ReactMarkdown>
              </Typography>
            </Grid>

            {/* Secondary Effects */}
            {target.secondRoll && target.secondEffects?.length > 0 && (
              <>
                {target.secondEffects.length >= 4 ? (
                  <>
                    <Grid size={2}>
                      {/* Indent under primary effect text */}
                    </Grid>
                    <Grid size={10}>
                      <Grid container>
                        {target.secondEffects.map((effect, i) => (
                          <Grid key={i} size={6}>
                            <Grid container>
                              <Grid size={3}>
                                <Typography
                                  style={{ flexGrow: 1, marginRight: "5px" }}
                                  sx={{
                                    ...bodyTextSx,
                                    fontWeight: "bold",
                                  }}
                                >
                                  {effect.dieValue}
                                  {"."}
                                </Typography>
                              </Grid>
                              <Grid size={9}>
                                <Typography
                                  component="div"
                                  style={{ flexGrow: 1, marginRight: "5px" }}
                                  sx={{
                                    ...bodyTextSx,
                                  }}
                                >
                                  <ReactMarkdown components={components}>
                                    {effect.effect}
                                  </ReactMarkdown>
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  </>
                ) : (
                  target.secondEffects.map((effect, i) => (
                    <React.Fragment key={i}>
                      <Grid size={2}>
                        {/* Indent under primary effect text */}
                      </Grid>
                      <Grid size={2}>
                        <Typography
                          style={{ flexGrow: 1, marginRight: "5px" }}
                          sx={{
                            ...bodyTextSx,
                            fontWeight: "bold",
                          }}
                        >
                          {effect.dieValue}
                          {"."}
                        </Typography>
                      </Grid>
                      <Grid size={8}>
                        <Typography
                          component="div"
                          style={{ flexGrow: 1, marginRight: "5px" }}
                          sx={{
                            ...bodyTextSx,
                          }}
                        >
                          <ReactMarkdown components={components}>
                            {effect.effect}
                          </ReactMarkdown>
                        </Typography>
                      </Grid>
                    </React.Fragment>
                  ))
                )}
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
