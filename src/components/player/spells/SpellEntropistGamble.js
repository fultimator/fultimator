import React from "react";
import {
  Typography,
  IconButton,
  Grid,
  useTheme,
  ThemeProvider,
  Icon,
  Tooltip,
} from "@mui/material";
import { Edit, VisibilityOff, SettingsSuggest } from "@mui/icons-material";
import attributes from "../../../libs/attributes";
import { useTranslate } from "../../../translation/translate";

function ThemedSpellEntropistGamble({ gamble, onEdit, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;
  const white = theme.palette.white.main;

  return (
    <>
      {/* Row 1 */}

      <div
        style={{
          backgroundColor: primary,
          fontFamily: "Antonio",
          fontWeight: "normal",
          fontSize: "1.1em",
          padding: "2px 17px",
          color: white,
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
              fontSize={{ xs: "0.7rem", sm: "1.1rem" }}
            >
              {t("Spell")}
            </Typography>
          </Grid>
          <Grid
            item
            xs={3}
            sm={2}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h3" fontSize={{ xs: "0.7rem", sm: "1.1rem" }}>
              {t("MP x Dice")}
            </Typography>
          </Grid>
          <Grid
            item
            xs={3}
            sm={4}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h3" fontSize={{ xs: "0.7rem", sm: "1.1rem" }}>
              {t("Max Throwable Dices")}
            </Typography>
          </Grid>
          <Grid
            item
            xs={3}
            sm={3}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h3" fontSize={{ xs: "0.7rem", sm: "1.1rem" }}>
              {t("Attribute")}
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

      {/* Row 2 */}
      <div
        style={{
          background: `linear-gradient(to right, ${ternary}, ${white})`,
          padding: "3px 17px",
          display: "flex",
          justifyContent: "space-between",
          borderTop: `1px solid ${secondary}`,
          borderBottom: `1px solid ${secondary}`,
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
              fontSize={{ xs: "0.8rem", sm: "1rem" }}
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
            item
            xs={2}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography fontSize={{ xs: "0.7rem", sm: "1rem" }}>
              {gamble.mp}
            </Typography>
          </Grid>
          <Grid
            item
            xs={3}
            sm={4}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography fontSize={{ xs: "0.7rem", sm: "1rem" }}>
              {gamble.maxTargets}
            </Typography>
          </Grid>
          <Grid
            item
            xs={4}
            sm={3}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography fontSize={{ xs: "0.7rem", sm: "1rem" }}>
              {attributes[gamble.attr].shortcaps}
            </Typography>
          </Grid>
        </Grid>
        {isEditMode && (
          <Grid
            item
            xs
            style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
          >
            {!gamble.showInPlayerSheet && (
              <Tooltip title={t("Spell not shown in player sheet")}>
                <Icon>
                  <VisibilityOff style={{ color: "black" }} />
                </Icon>
              </Tooltip>
            )}
            <IconButton size="small" onClick={onEdit}>
              <Edit style={{ color: "black" }} />
            </IconButton>
          </Grid>
        )}
      </div>

      {/* Row 3 */}
      <Grid
        container
        justifyContent="flex-start"
        sx={{
          background: "transparent",
          marginBottom: "6px",
          borderBottom: `1px solid ${secondary}`,
        }}
      >
        {gamble.targets.map((target, index) => (
          <Grid
            container
            key={index}
            sx={{
              background: ternary,
              borderTop: `1px solid white`,
              borderBottom: `1px solid white`,
              padding: "3px 17px",
            }}
          >
            {/* Primary Effect */}
            <Grid item xs={2}>
              <Typography
                style={{ flexGrow: 1, marginRight: "5px" }}
                fontSize={{ xs: "0.8rem", sm: "1rem" }}
                fontWeight={"bold"}
              >
                {target.rangeFrom === target.rangeTo
                  ? target.rangeFrom
                  : `${target.rangeFrom} - ${target.rangeTo}`}
              </Typography>
            </Grid>
            <Grid item xs={10} sx={{ mb: 1 }}>
              <Typography
                style={{ flexGrow: 1, marginRight: "5px" }}
                fontSize={{ xs: "0.8rem", sm: "1rem" }}
              >
                {target.effect}
              </Typography>
            </Grid>

            {/* Secondary Effects */}
            {target.secondRoll && target.secondEffects?.length > 0 && (
              <>
                <Grid item xs={2}>
                  {/* Leave to fill space */}
                </Grid>
                <Grid item xs={10}>
                  <Grid container>
                    {target.secondEffects.map((effect, i) => (
                      <React.Fragment key={i}>
                        <Grid item xs={1}>
                          <Typography
                            style={{ flexGrow: 1, marginRight: "5px" }}
                            fontSize={{ xs: "0.8rem", sm: "1rem" }}
                            fontWeight={"bold"}
                          >
                            {effect.dieValue}
                            {"."}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography
                            style={{ flexGrow: 1, marginRight: "5px" }}
                            fontSize={{ xs: "0.8rem", sm: "1rem" }}
                          >
                            {effect.effect}
                          </Typography>
                        </Grid>
                        {(i + 1) % 3 === 0 && <Grid item xs={12} />}
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
  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellEntropistGamble {...props} />
    </ThemeProvider>
  );
}
