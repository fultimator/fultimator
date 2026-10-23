import { Autocomplete, Box, Grid, TextField, Typography } from "@mui/material";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import { useTheme } from "@mui/material/styles";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import { useTranslate } from "/src/translation/translate";
import CustomTextarea from "/src/components/common/CustomTextarea";
import NotesMarkdown from "/src/components/common/NotesMarkdown";

const THEME_KEYS = [
  "Ambition",
  "Anger",
  "Belonging",
  "Doubt",
  "Duty",
  "Guilt",
  "Hope",
  "Justice",
  "Mercy",
  "Vengeance",
];

function TraitText({ label, value }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        display: "flex",
        alignItems: "baseline",
        gap: 0.35,
      }}
    >
      <Typography
        component="span"
        sx={{
          fontFamily: "Antonio",
          fontWeight: "bold",
          fontSize: "0.95rem",
          textTransform: "uppercase",
          color: "text.primary",
          lineHeight: 1.1,
          whiteSpace: "nowrap",
        }}
      >
        {label}:
      </Typography>
      <Typography
        component="span"
        sx={{
          fontFamily: "Antonio",
          fontWeight: "bold",
          fontSize: "0.95rem",
          textTransform: "uppercase",
          lineHeight: 1.25,
          fontStyle: value ? "normal" : "italic",
          color: value ? "text.primary" : "text.secondary",
          minWidth: 0,
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
}

export default function PcTraitsDescription({
  pc,
  isInteractive = false,
  onUpdate,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const _customTheme = useCustomTheme();
  const divider = theme.palette.divider;
  const themeOptions = THEME_KEYS.map(t);
  const description = pc.info?.description?.trim() || "";

  const updateInfo = (key, value) => {
    onUpdate?.((prev) => ({
      ...prev,
      info: {
        ...prev.info,
        [key]: value,
      },
    }));
  };

  return (
    <SectionCard title={t("Traits")}>
      <Box sx={{ p: 1, width: "100%" }}>
        <Box sx={{ display: "grid", gap: isInteractive ? 0.75 : 0.45 }}>
          {isInteractive ? (
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label={t("Identity")}
                  value={pc.info.identity || ""}
                  onChange={(event) =>
                    updateInfo("identity", event.target.value)
                  }
                  size="small"
                  fullWidth
                  slotProps={{ htmlInput: { maxLength: 300 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  freeSolo
                  size="small"
                  options={themeOptions}
                  value={pc.info.theme || ""}
                  onChange={(_, value) => updateInfo("theme", value || "")}
                  onInputChange={(_, value) => updateInfo("theme", value)}
                  renderInput={(params) => (
                    <TextField {...params} label={t("Theme")} fullWidth />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label={t("Origin")}
                  value={pc.info.origin || ""}
                  onChange={(event) => updateInfo("origin", event.target.value)}
                  size="small"
                  fullWidth
                  slotProps={{ htmlInput: { maxLength: 50 } }}
                />
              </Grid>
            </Grid>
          ) : (
            <Grid container rowSpacing={0.6} columnSpacing={2}>
              <Grid size={12}>
                <Box
                  sx={{
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: divider,
                    px: 0.65,
                    py: 0.45,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(0,0,0,0.015)",
                  }}
                >
                  <TraitText label={t("Identity")} value={pc.info.identity} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: divider,
                    px: 0.65,
                    py: 0.45,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(0,0,0,0.015)",
                  }}
                >
                  <TraitText
                    label={t("Theme")}
                    value={pc.info.theme ? t(pc.info.theme) : ""}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: divider,
                    px: 0.65,
                    py: 0.45,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(0,0,0,0.015)",
                  }}
                >
                  <TraitText label={t("Origin")} value={pc.info.origin} />
                </Box>
              </Grid>
            </Grid>
          )}

          {isInteractive ? (
            <CustomTextarea
              label={t("Description")}
              value={pc.info.description || ""}
              onChange={(event) =>
                updateInfo("description", event.target.value)
              }
              minRows={4}
              maxRows={8}
              maxLength={2000}
              placeholder={t("Description")}
            />
          ) : description ? (
            <Box
              sx={{
                fontSize: "0.95rem",
                lineHeight: 1.35,
                color: "text.primary",
                fontFamily: "inherit",
                borderRadius: 1,
                border: "1px solid",
                borderColor: divider,
                px: 0.65,
                py: 0.55,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.015)",
                "& p": { m: 0, fontFamily: "inherit" },
                "& p + p": { mt: 0.75 },
              }}
            >
              <NotesMarkdown uniform fontSize="1rem">
                {description}
              </NotesMarkdown>
            </Box>
          ) : null}
        </Box>
      </Box>
    </SectionCard>
  );
}
