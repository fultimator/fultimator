import React from "react";
import {
  Typography,
  Grid,
  ThemeProvider,
  Tooltip,
  Icon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import { VisibilityOff, ExpandMore, Info } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

function ThemedSpellChanter({
  magichant,
  onEditKeys,
  onEditTones,
  isEditMode,
  onEdit,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";

  const volumes = [
    {
      name: "magichant_volume_low",
      mp: 10,
      target: "magichant_volume_low_target",
    },
    {
      name: "magichant_volume_medium",
      mp: 20,
      target: "magichant_volume_medium_target",
    },
    {
      name: "magichant_volume_high",
      mp: 30,
      target: "magichant_volume_high_target",
    },
  ];

  const showInPlayerSheet =
    magichant.showInPlayerSheet || magichant.showInPlayerSheet === undefined;

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
          <Typography variant="h4">{t("Magichant Details")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ReactMarkdown>{t("magichant_details_1")}</ReactMarkdown>
          <ReactMarkdown>
            {"- " +
              t("magichant_details_2") +
              `\n` +
              "- " +
              t("magichant_details_3") +
              `\n` +
              "- " +
              t("magichant_details_4")}
          </ReactMarkdown>
        </AccordionDetails>
      </Accordion>
      {isEditMode && (
        <Grid
          item
          xs
          style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
        >
          <Button
            onClick={onEdit}
            variant="outlined"
            sx={{ marginTop: 2, marginBottom: 2, marginRight: 2 }}
          >
            {t("magichant_edit_button")}
          </Button>
          <Button
            onClick={onEditKeys}
            variant="outlined"
            sx={{ marginTop: 2, marginBottom: 2, marginRight: 2 }}
          >
            {t("magichant_edit_keys_button")}
          </Button>
          <Button
            onClick={onEditTones}
            variant="outlined"
            sx={{ marginTop: 2, marginBottom: 2, marginRight: 2 }}
          >
            {t("magichant_edit_tones_button")}
          </Button>
          {!showInPlayerSheet && (
            <Tooltip title={t("Magichant not shown in player sheet")}>
              <Icon>
                <VisibilityOff style={{ color: "black" }} />
              </Icon>
            </Tooltip>
          )}
        </Grid>
      )}
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
            xs={3}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              minHeight: "40px",
            }}
          >
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("magichant_volume")}
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
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("MP")}
            </Typography>
          </Grid>
          <Grid
            item
            xs={7}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("Target")}
            </Typography>
          </Grid>
        </Grid>
      </div>

      {volumes.map((volume, i) => (
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
              xs={3}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "left",
              }}
            >
              <Typography
                fontWeight="bold"
                style={{ flexGrow: 1, marginRight: "5px" }}
                sx={{
                  fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                }}
              >
                {t(volume.name)}
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
              <ReactMarkdown components={components}>
                {volume.mp + ""}
              </ReactMarkdown>
            </Grid>
            <Grid
              item
              xs={7}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ReactMarkdown components={components}>
                {t(volume.target)}
              </ReactMarkdown>
            </Grid>
          </Grid>
        </Grid>
      ))}
      {/* KEYS */}
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
            xs={3}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              minHeight: "40px",
            }}
          >
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("magichant_key")}
            </Typography>
          </Grid>
          <Grid
            item
            xs={2}
            sm={3}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("magichant_type")}
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
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("magichant_status_effect")}
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
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("magichant_attribute")}
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
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("magichant_recovery")}
            </Typography>
          </Grid>
        </Grid>
      </div>

      {magichant.keys.length === 0 ? (
        <Typography
          sx={{
            padding: "3px 17px",
            textAlign: "center",
            color: theme.primary,
            borderBottom: `1px solid ${theme.secondary}`,
            fontStyle: "italic",
          }}
        >
          {t("magichant_empty_keys")}
        </Typography>
      ) : (
        magichant.keys.map((chantKey, i) => (
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
                xs={3}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "left",
                }}
              >
                <Typography
                  fontWeight="bold"
                  style={{ flexGrow: 1, marginRight: "5px" }}
                  sx={{
                    fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                  }}
                >
                  {chantKey.name === "magichant_custom_name"
                    ? chantKey.customName
                    : t(chantKey.name)}
                </Typography>
              </Grid>
              <Grid
                item
                xs={2}
                sm={3}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ReactMarkdown components={components}>
                  {chantKey.name === "magichant_custom_name"
                    ? chantKey.type
                    : t(chantKey.type)}
                </ReactMarkdown>
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
                <ReactMarkdown components={components}>
                  {chantKey.name === "magichant_custom_name"
                    ? chantKey.status
                    : t(chantKey.status)}
                </ReactMarkdown>
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
                <ReactMarkdown components={components}>
                  {chantKey.name === "magichant_custom_name"
                    ? chantKey.attribute
                    : t(chantKey.attribute)}
                </ReactMarkdown>
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
                <ReactMarkdown components={components}>
                  {chantKey.name === "magichant_custom_name"
                    ? chantKey.recovery
                    : t(chantKey.recovery)}
                </ReactMarkdown>
              </Grid>
            </Grid>
          </Grid>
        ))
      )}

      {/* TONES */}
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
            xs={3}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              minHeight: "40px",
            }}
          >
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("magichant_tone")}
            </Typography>
          </Grid>
        </Grid>
      </div>

      {magichant.tones.length === 0 ? (
        <Typography
          sx={{
            padding: "3px 17px",
            textAlign: "center",
            color: theme.primary,
            borderBottom: `1px solid ${theme.secondary}`,
            fontStyle: "italic",
          }}
        >
          {t("magichant_empty_tones")}
        </Typography>
      ) : (
        magichant.tones.map((tone, i) => (
          <React.Fragment key={i}>
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
                    {tone.name === "magichant_custom_name"
                      ? tone.customName
                      : t(tone.name)}
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
            <Grid
              container
              justifyContent="flex-start"
              sx={{
                background: "transparent",
                padding: "3px 17px",
                marginBottom: "6px",
                borderBottom: `1px solid ${theme.secondary}`,
              }}
            >
              <Grid container style={{ flexGrow: 1 }}>
                <Grid
                  item
                  xs={12}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                  }}
                >
                  <ReactMarkdown components={components}>
                    {tone.name === "magichant_custom_name"
                      ? tone.effect
                      : t(tone.effect)}
                  </ReactMarkdown>
                  {/*<Typography
                    fontWeight="bold"
                    style={{ flexGrow: 1, marginRight: "5px" }}
                    sx={{
                      fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                    }}
                  >
                    {tone.name === "magichant_custom_name"
                      ? tone.effect
                      : t(tone.effect)}
                  </Typography>*/}
                </Grid>
              </Grid>
            </Grid>
          </React.Fragment>
        ))
      )}
    </>
  );
}

export default function SpellChanter(props) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellChanter {...props} />
    </ThemeProvider>
  );
}
