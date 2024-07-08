import React from "react";
import {
  Typography,
  IconButton,
  Grid,
  useTheme,
  ThemeProvider,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";

function ThemedSpellTinkererAlchemy({
  alchemy,
  onEditRank,
  onEditTargets,
  onEditEffects,
  isEditMode,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;
  const white = theme.palette.white.main;

  const ranks = [t("Basic"), t("Advanced"), t("Superior")];

  return (
    <>
      {/* MIX Row 1 */}

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
            <IconButton size="small" onClick={onEditRank}>
              <Edit style={{ color: "black" }} />
            </IconButton>
          </Grid>
        )}
      </div>

      {/* TARGETS Row 1 */}

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
              <Edit style={{ color: "black" }} />
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
            borderBottom: `1px solid ${secondary}`,
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
          backgroundColor: primary,
          fontFamily: "Antonio",
          fontWeight: "normal",
          fontSize: "1.1em",
          padding: "2px 17px",
          color: white,
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
              <Edit style={{ color: "black" }} />
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
            borderBottom: `1px solid ${secondary}`,
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
  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellTinkererAlchemy {...props} />
    </ThemeProvider>
  );
}
