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
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

function ThemedSpellTinkererAlchemy({
  alchemy,
  onEditRank,
  onEditTargets,
  onEditEffects,
  isEditMode,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const iconColor = isDarkMode ? '#ffffff' : '#000000';
  const gradientColor = isDarkMode ? '#1f1f1f' : '#fff';

  const ranks = [t("Basic"), t("Advanced"), t("Superior")];

  const showInPlayerSheet =
    alchemy.showInPlayerSheet || alchemy.showInPlayerSheet === undefined;

  return (
    <>
      <Accordion sx={{ marginY: 1 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Icon sx={{ color: theme.primary, marginRight: 1 }}>
            <Info />
          </Icon>
          <Typography variant="h4">{t("Alchemy Details")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ReactMarkdown>
            {t(
              "You may perform the **Inventory** action to rapidly craft a **potion** with powerful but somewhat unpredictable effects. When you do so, choose one type of **mix** among those you have unlocked (**basic**, **advanced** or **superior**) and spend the appropriate amount of Inventory Points."
            )}
          </ReactMarkdown>
          <ReactMarkdown>
            {t(
              "When you create a mix, roll the amount of twenty-sided dice indicated by that mix, then assign one of those rolls to the **target** table and one to the **effect** table . Discard all remaining dice, then describe the effects of the mix!"
            )}
          </ReactMarkdown>
          <ReactMarkdown>
            {t(
              'Effects marked with "**Any**" on the **effect** table are always available and can be chosen if none of the available effects appeal to you.'
            )}
          </ReactMarkdown>
        </AccordionDetails>
      </Accordion>
      {/* MIX Row 1 */}

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
              {t("Mix")}
            </Typography>
          </Grid>
          <Grid
            item
            xs={2}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h3">{t("IP Cost")}</Typography>
          </Grid>
          <Grid
            item
            xs={6}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h3">{t("Description")}</Typography>
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

      {/* MIX Row 2 */}
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
              {ranks[alchemy.rank - 1]}
            </Typography>
          </Grid>
          <Grid
            item
            xs={2}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography>{alchemy.rank + 2}</Typography>
          </Grid>
          <Grid
            item
            xs={6}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography>
              {alchemy.rank === 1
                ? t("Roll two d20s and assign one to target and one to effect.")
                : alchemy.rank === 2
                ? t(
                    "Roll three d20s and assign one to target and one to effect."
                  )
                : alchemy.rank === 3
                ? t(
                    "Roll four d20s and assign one to target and one to effect."
                  )
                : null}
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
              <Tooltip title={t("Alchemy not shown in player sheet")}>
                <Icon>
                  <VisibilityOff style={{ color: "black" }} />
                </Icon>
              </Tooltip>
            )}
            <IconButton size="small" onClick={onEditRank}>
              <Edit style={{ color:  iconColor }} />
            </IconButton>
          </Grid>
        )}
      </div>

      {/* TARGETS Row 1 */}

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
          marginTop: "20px",
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
              {t("Target")}
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
            }}
          >
            <div style={{ width: 40, height: 40 }} /> {/* Retain space */}
          </Grid>
        )}
      </div>

      {/* TARGETS Row 2 */}
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
              {t("Die")}
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
            <Typography>{t("The potions affects...")}</Typography>
          </Grid>
        </Grid>
        {isEditMode && (
          <Grid
            item
            xs
            style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
          >
            <IconButton size="small" onClick={onEditTargets}>
              <Edit style={{ color:  iconColor }} />
            </IconButton>
          </Grid>
        )}
      </div>
      {/* TARGETS Row 3 */}
      {alchemy.targets.map((target, i) => (
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
                {target.rangeFrom + " - " + target.rangeTo}
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
              <Typography>{target.effect}</Typography>
            </Grid>
          </Grid>
        </Grid>
      ))}

      {/* EFFECTS Row 1 */}

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
          marginTop: "20px",
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
              {t("Effect")}
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
            }}
          >
            <div style={{ width: 40, height: 40 }} /> {/* Retain space */}
          </Grid>
        )}
      </div>

      {/* EFFECTS Row 2 */}
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
              {t("Die")}
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
            <Typography>
              {t("Each creature affected by the potion...")}
            </Typography>
          </Grid>
        </Grid>
        {isEditMode && (
          <Grid
            item
            xs
            style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
          >
            <IconButton size="small" onClick={onEditEffects}>
              <Edit style={{ color:  iconColor }} />
            </IconButton>
          </Grid>
        )}
      </div>
      {/* EFFECTS Row 3 */}
      {alchemy.effects.map((effect, i) => (
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
                {effect.dieValue === 0 ? t("Any") : effect.dieValue}
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
              <Typography>{effect.effect}</Typography>
            </Grid>
          </Grid>
        </Grid>
      ))}
    </>
  );
}

export default function SpellTinkererAlchemy(props) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellTinkererAlchemy {...props} />
    </ThemeProvider>
  );
}
