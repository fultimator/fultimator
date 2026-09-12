import React, { useState } from "react";
import {
  Typography,
  Grid,
  ThemeProvider,
  Tooltip,
  Icon,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
} from "@mui/material";
import {
  VisibilityOff,
  ExpandMore,
  Info,
  Edit,
  MusicNote,
} from "@mui/icons-material";
import { TypeIcon } from "/src/components/types";
import { useTranslate } from "/src/translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import ChanterVerseDialog from "./ChanterVerseDialog";
import { volumes } from "./magichantVerseUtils";

function ThemedSpellChanter({
  magichant,
  onEditKeys,
  onEditTones,
  isEditMode,
  onEdit,
  speaker,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";
  const bodyTextSx = { fontSize: "0.9rem", lineHeight: 1.35 };
  const [verseOpen, setVerseOpen] = useState(false);

  const showInPlayerSheet =
    magichant.showInPlayerSheet || magichant.showInPlayerSheet === undefined;

  const inlineStyles = {
    margin: 0,
    padding: 0,
  };

  const components = {
    p: ({ _node, ...props }) => <p style={inlineStyles} {...props} />,
  };

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
          <Typography variant="h4">{t("Magichant Details")}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ py: "6px", px: "12px" }}>
          <ReactMarkdown
            components={{
              p: ({ node: _n, ...props }) => (
                <p style={{ margin: 0 }} {...props} />
              ),
            }}
          >
            {t("magichant_details_1")}
          </ReactMarkdown>
          <ReactMarkdown
            components={{
              p: ({ _node, ...props }) => (
                <p style={{ margin: 0 }} {...props} />
              ),
              ul: ({ _node, ...props }) => (
                <ul style={{ margin: 0, paddingLeft: "1.2em" }} {...props} />
              ),
            }}
          >
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
          alignItems: "center",
          justifyContent: "space-between",
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
            size={3}
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
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            size={2}
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
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            size={7}
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            flexShrink: 0,
          }}
        >
          {isEditMode && !showInPlayerSheet && (
            <Tooltip title={t("Magichant not shown in player sheet")}>
              <VisibilityOff sx={{ fontSize: "1.1rem", opacity: 0.7 }} />
            </Tooltip>
          )}
          {isEditMode && (
            <IconButton
              size="small"
              onClick={onEdit}
              sx={{ color: "#fff", p: "3px" }}
            >
              <Edit sx={{ fontSize: "1.1rem" }} />
            </IconButton>
          )}
          <Tooltip title={t("Sing a Verse")}>
            <IconButton
              size="small"
              onClick={() => setVerseOpen(true)}
              sx={{ color: "#fff", p: "3px", ml: isEditMode ? 0.75 : 0 }}
            >
              <MusicNote sx={{ fontSize: "1.1rem" }} />
            </IconButton>
          </Tooltip>
        </Box>
      </div>
      {volumes.map((volume, i) => (
        <Grid
          container
          sx={{
            justifyContent: "flex-start",
            background:
              i % 2 === 0
                ? `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`
                : "transparent",
            padding: "3px 17px",
            minHeight: 44,
            fontSize: "0.9rem",
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
              size={3}
            >
              <Typography
                style={{ flexGrow: 1, marginRight: "5px" }}
                sx={{
                  ...bodyTextSx,
                  fontWeight: "bold",
                }}
              >
                {t(volume.name)}
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
              <ReactMarkdown components={components}>
                {volume.mp + ""}
              </ReactMarkdown>
            </Grid>
            <Grid
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              size={7}
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
          alignItems: "center",
          justifyContent: "space-between",
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
            size={3}
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
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            size={{
              xs: 2,
              sm: 3,
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
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            size={2}
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
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("magichant_attribute")}
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
              variant="h3"
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("magichant_recovery")}
            </Typography>
          </Grid>
        </Grid>
        <div style={{ width: 28, flexShrink: 0 }}>
          {isEditMode && (
            <Tooltip title={t("magichant_edit_keys_button")}>
              <IconButton
                size="small"
                onClick={onEditKeys}
                sx={{ color: "#fff", p: "3px" }}
              >
                <Edit sx={{ fontSize: "1.1rem" }} />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>
      {(magichant.keys ?? []).length === 0 ? (
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
        (magichant.keys ?? []).map((chantKey, i) => (
          <Grid
            container
            sx={{
              justifyContent: "flex-start",
              background:
                i % 2 === 0
                  ? `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`
                  : "transparent",
              padding: "3px 17px",
              minHeight: 44,
              fontSize: "0.9rem",
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
                size={3}
              >
                <Typography
                  style={{ flexGrow: 1, marginRight: "5px" }}
                  sx={{
                    ...bodyTextSx,
                    fontWeight: "bold",
                  }}
                >
                  {chantKey.key === "magichant_custom_name"
                    ? chantKey.customName
                    : t(chantKey.key)}
                </Typography>
              </Grid>
              <Grid
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
                size={{
                  xs: 2,
                  sm: 3,
                }}
              >
                {chantKey.type && <TypeIcon type={chantKey.type} />}
                <span style={{ textTransform: "capitalize" }}>
                  {chantKey.key === "magichant_custom_name"
                    ? chantKey.type
                    : t(chantKey.type)}
                </span>
              </Grid>
              <Grid
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                size={2}
              >
                <ReactMarkdown components={components}>
                  {chantKey.key === "magichant_custom_name"
                    ? chantKey.status
                    : t(chantKey.status)}
                </ReactMarkdown>
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
                <ReactMarkdown components={components}>
                  {chantKey.key === "magichant_custom_name"
                    ? chantKey.attribute
                    : t(chantKey.attribute)}
                </ReactMarkdown>
              </Grid>
              <Grid
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                size={2}
              >
                <ReactMarkdown components={components}>
                  {chantKey.key === "magichant_custom_name"
                    ? chantKey.recovery
                    : t(chantKey.recovery)}
                </ReactMarkdown>
              </Grid>
            </Grid>
            <div style={{ width: 28, flexShrink: 0 }} />
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
          alignItems: "center",
          justifyContent: "space-between",
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
            size={3}
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
        {isEditMode && (
          <Tooltip title={t("magichant_edit_tones_button")}>
            <IconButton
              size="small"
              onClick={onEditTones}
              sx={{ color: "#fff", p: "3px", flexShrink: 0 }}
            >
              <Edit sx={{ fontSize: "1.1rem" }} />
            </IconButton>
          </Tooltip>
        )}
      </div>
      {(magichant.tones ?? []).length === 0 ? (
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
        (magichant.tones ?? []).map((tone, i) => (
          <React.Fragment key={i}>
            <div
              style={{
                background: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
                padding: "3px 17px",
                display: "flex",
                justifyContent: "space-between",
                minHeight: 44,
                fontSize: "0.9rem",
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
                      ...bodyTextSx,
                      fontWeight: "bold",
                    }}
                  >
                    {tone.key === "magichant_custom_name"
                      ? tone.customName
                      : t(tone.key)}
                  </Typography>
                </Grid>
              </Grid>
              {isEditMode && (
                <Grid
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                    minHeight: 34,
                  }}
                  size="grow"
                ></Grid>
              )}
            </div>
            <Grid
              container
              sx={{
                justifyContent: "flex-start",
                background: "transparent",
                padding: "3px 17px",
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
                  size={12}
                >
                  <ReactMarkdown components={components}>
                    {tone.key === "magichant_custom_name"
                      ? tone.effect
                      : t(tone.effect)}
                  </ReactMarkdown>
                </Grid>
              </Grid>
            </Grid>
          </React.Fragment>
        ))
      )}
      <ChanterVerseDialog
        open={verseOpen}
        onClose={() => setVerseOpen(false)}
        magichant={magichant}
        speaker={speaker}
        t={t}
      />
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
