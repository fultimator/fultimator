import React from "react";
import {
  Typography,
  IconButton,
  Grid,
  ThemeProvider,
  Tooltip,
  Icon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Edit, VisibilityOff, ExpandMore, Info } from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "/src/hooks/useCustomTheme";

function ThemedSpellTinkererInfusion({ infusion, onEdit, isEditMode }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";

  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";

  const showInPlayerSheet =
    infusion.showInPlayerSheet || infusion.showInPlayerSheet === undefined;

  return (
    <>
      <Accordion
        disableGutters
        elevation={0}
        square
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Icon sx={{ color: theme.primary, marginRight: 1 }}>
            <Info />
          </Icon>
          <Typography variant="h4">{t("Infusion Details")}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ py: "6px", px: "12px" }}>
          <ReactMarkdown
            components={{
              p: ({ node: _n, ...props }) => (
                <p style={{ margin: 0 }} {...props} />
              ),
            }}
          >
            {t(
              "When you successfully hit one or more targets with an attack, you may spend 2 Inventory Points to produce a special **infusion** and apply the corresponding effect to that attack (if the attack had the **multi** property, apply the effects of the infusion to each target).",
            )}
          </ReactMarkdown>
          <ReactMarkdown
            components={{
              p: ({ node: _n, ...props }) => (
                <p style={{ margin: 0 }} {...props} />
              ),
            }}
          >
            {t(
              "You cannot apply more than one infusion to the same attack; producing and using an infusion are both part of the action you used to attack with the weapon.",
            )}
          </ReactMarkdown>
        </AccordionDetails>
      </Accordion>
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
          alignItems: "center",
        }}
      >
        <Grid container style={{ flexGrow: 1 }}>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              minHeight: "40px",
            }}
            size="grow"
          >
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
            >
              {t("Infusion")}
            </Typography>
          </Grid>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "40px",
            }}
            size={8}
          >
            <Typography variant="h3">{t("Effect")}</Typography>
          </Grid>
        </Grid>
      </div>
      {/* Row 2 */}
      {infusion.rank >= 1 && (
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
                }}
              >
                {t("Basic Infusions")}
              </Typography>
            </Grid>
          </Grid>
          {isEditMode && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                flexShrink: 0,
              }}
            >
              {!showInPlayerSheet && (
                <Tooltip title={t("Infusion not shown in player sheet")}>
                  <VisibilityOff sx={{ fontSize: "1.1rem", opacity: 0.7 }} />
                </Tooltip>
              )}
              <IconButton size="small" onClick={onEdit} sx={{ p: "3px" }}>
                <Edit sx={{ fontSize: "1.1rem" }} />
              </IconButton>
            </div>
          )}
        </div>
      )}
      {/* Row 3 */}
      {infusion.rank >= 1 &&
        infusion.effects
          .filter((ef) => ef.infusionRank === 1)
          .map((effect, i) => (
            <Grid
              container
              sx={{
                justifyContent: "flex-start",
                background: "transparent",
                padding: "3px 17px",
                borderBottom: `1px solid ${theme.secondary}`,
              }}
              key={i}
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
                    }}
                  >
                    {effect.name}
                  </Typography>
                </Grid>
                <Grid
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                  size={8}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ node: _n, ...props }) => <span {...props} />,
                    }}
                  >
                    {effect.effect}
                  </ReactMarkdown>
                </Grid>
              </Grid>
            </Grid>
          ))}
      {/* Row 2 */}
      {infusion.rank >= 2 && (
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
                }}
              >
                {t("Advanced Infusions")}
              </Typography>
            </Grid>
          </Grid>
        </div>
      )}
      {/* Row 3 */}
      {infusion.rank >= 2 &&
        infusion.effects
          .filter((ef) => ef.infusionRank === 2)
          .map((effect, i) => (
            <Grid
              container
              sx={{
                justifyContent: "flex-start",
                background: "transparent",
                padding: "3px 17px",
                borderBottom: `1px solid ${theme.secondary}`,
              }}
              key={i}
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
                    }}
                  >
                    {effect.name}
                  </Typography>
                </Grid>
                <Grid
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                  size={8}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ node: _n, ...props }) => <span {...props} />,
                    }}
                  >
                    {effect.effect}
                  </ReactMarkdown>
                </Grid>
              </Grid>
            </Grid>
          ))}
      {/* Row 2 */}
      {infusion.rank >= 3 && (
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
                }}
              >
                {t("Superior Infusions")}
              </Typography>
            </Grid>
          </Grid>
        </div>
      )}
      {/* Row 3 */}
      {infusion.rank >= 3 &&
        infusion.effects
          .filter((ef) => ef.infusionRank === 3)
          .map((effect, i) => (
            <Grid
              container
              sx={{
                justifyContent: "flex-start",
                background: "transparent",
                padding: "3px 17px",
                borderBottom: `1px solid ${theme.secondary}`,
              }}
              key={i}
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
                    }}
                  >
                    {effect.name}
                  </Typography>
                </Grid>
                <Grid
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                  size={8}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ node: _n, ...props }) => <span {...props} />,
                    }}
                  >
                    {effect.effect}
                  </ReactMarkdown>
                </Grid>
              </Grid>
            </Grid>
          ))}
    </>
  );
}

export default function SpellTinkererInfusion(props) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellTinkererInfusion {...props} />
    </ThemeProvider>
  );
}
