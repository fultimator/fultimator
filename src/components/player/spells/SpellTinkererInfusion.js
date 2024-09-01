import React from "react";
import {
  Typography,
  IconButton,
  Grid,
  useTheme,
  ThemeProvider,
  Tooltip,
  Icon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Edit, VisibilityOff, ExpandMore, Info } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

function ThemedSpellTinkererInfusion({ infusion, onEdit, isEditMode }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const iconColor = isDarkMode ? '#ffffff' : '#000000';
  const gradientColor = isDarkMode ? '#1f1f1f' : '#fff';

  const showInPlayerSheet =
    infusion.showInPlayerSheet || infusion.showInPlayerSheet === undefined;

  const inlineStyles = {
    margin: 0,
    padding: 0,
  };

  const components = {
    p: ({ node, ...props }) => <p style={inlineStyles} {...props} />,
  };

  return (
    <>
      <Accordion sx={{ marginY: 1 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Icon sx={{ color: theme.primary, marginRight: 1 }}>
            <Info />
          </Icon>
          <Typography variant="h4">{t("Infusion Details")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ReactMarkdown>
            {t(
              "When you successfully hit one or more targets with an attack, you may spend 2 Inventory Points to produce a special **infusion** and apply the corresponding effect to that attack (if the attack had the **multi** property, apply the effects of the infusion to each target)."
            )}
          </ReactMarkdown>
          <ReactMarkdown>
            {t(
              "You cannot apply more than one infusion to the same attack; producing and using an infusion are both part of the action you used to attack with the weapon."
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
        }}
      >
        <Grid container style={{ flexGrow: 1 }}>
          <Grid
            item
            xs
            flexGrow
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
            }}
          >
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
            >
              {t("Infusion")}
            </Typography>
          </Grid>
          <Grid
            item
            xs={8}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h3">{t("Effect")}</Typography>
          </Grid>
        </Grid>
        {isEditMode && (
          <Grid
            item
            xs
            style={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <div style={{ width: 40, height: 40 }} /> {/* Retain space */}
          </Grid>
        )}
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
              item
              xs
              flexGrow
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "left",
              }}
            >
              <Typography
                fontWeight="bold"
                style={{ flexGrow: 1, marginRight: "5px" }}
              >
                {t("Basic Infusions")}
              </Typography>
            </Grid>
          </Grid>
          {isEditMode && (
            <Grid
              item
              xs
              style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
            >
              {!showInPlayerSheet && (
                <Tooltip title={t("Infusion not shown in player sheet")}>
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
      )}
      {/* Row 3 */}
      {infusion.rank >= 1 &&
        infusion.effects
          .filter((ef) => ef.infusionRank === 1)
          .map((effect, i) => (
            <Grid
              container
              justifyContent="flex-start"
              sx={{
                background: "transparent",
                padding: "3px 17px",
                marginBottom: "6px",
                borderBottom: `1px solid ${theme.secondary}`,
              }}
              key={i}
            >
              <Grid container style={{ flexGrow: 1 }}>
                <Grid
                  item
                  xs
                  flexGrow
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                  }}
                >
                  <Typography
                    fontWeight="bold"
                    style={{ flexGrow: 1, marginRight: "5px" }}
                  >
                    {effect.name}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={8}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ReactMarkdown components={components}>
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
              item
              xs
              flexGrow
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "left",
              }}
            >
              <Typography
                fontWeight="bold"
                style={{ flexGrow: 1, marginRight: "5px" }}
              >
                {t("Advanced Infusions")}
              </Typography>
            </Grid>
          </Grid>
          {isEditMode && (
            <Grid
              item
              xs
              style={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
                minHeight: 34,
              }}
            ></Grid>
          )}
        </div>
      )}
      {/* Row 3 */}
      {infusion.rank >= 2 &&
        infusion.effects
          .filter((ef) => ef.infusionRank === 2)
          .map((effect, i) => (
            <Grid
              container
              justifyContent="flex-start"
              sx={{
                background: "transparent",
                padding: "3px 17px",
                marginBottom: "6px",
                borderBottom: `1px solid ${theme.secondary}`,
              }}
              key={i}
            >
              <Grid container style={{ flexGrow: 1 }}>
                <Grid
                  item
                  xs
                  flexGrow
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                  }}
                >
                  <Typography
                    fontWeight="bold"
                    style={{ flexGrow: 1, marginRight: "5px" }}
                  >
                    {effect.name}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={8}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ReactMarkdown components={components}>
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
              item
              xs
              flexGrow
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "left",
              }}
            >
              <Typography
                fontWeight="bold"
                style={{ flexGrow: 1, marginRight: "5px" }}
              >
                {t("Superior Infusions")}
              </Typography>
            </Grid>
          </Grid>
          {isEditMode && (
            <Grid
              item
              xs
              style={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
                minHeight: 34,
              }}
            ></Grid>
          )}
        </div>
      )}
      {/* Row 3 */}
      {infusion.rank >= 3 &&
        infusion.effects
          .filter((ef) => ef.infusionRank === 3)
          .map((effect, i) => (
            <Grid
              container
              justifyContent="flex-start"
              sx={{
                background: "transparent",
                padding: "3px 17px",
                marginBottom: "6px",
                borderBottom: `1px solid ${theme.secondary}`,
              }}
              key={i}
            >
              <Grid container style={{ flexGrow: 1 }}>
                <Grid
                  item
                  xs
                  flexGrow
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                  }}
                >
                  <Typography
                    fontWeight="bold"
                    style={{ flexGrow: 1, marginRight: "5px" }}
                  >
                    {effect.name}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={8}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ReactMarkdown components={components}>
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
